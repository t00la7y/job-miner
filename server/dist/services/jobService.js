"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllJobs = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const API_TIMEOUT_MS = 8000;
const ADZUNA_TIMEOUT_MS = 12000; // Increased for multi-page fetches
const DEFAULT_LOCATION = process.env.DEFAULT_LOCATION || "South Africa";
const ADZUNA_RESULTS_PER_PAGE = Number(process.env.ADZUNA_RESULTS_PER_PAGE) || 50;
const ADZUNA_PAGE_COUNT = Number(process.env.ADZUNA_PAGE_COUNT) || 2;
const JSEARCH_NUM_PAGES = Number(process.env.JSEARCH_NUM_PAGES) || 5;
const GREENHOUSE_BOARDS = String(process.env.GREENHOUSE_BOARDS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
const LEVER_SITES = String(process.env.LEVER_SITES || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
const ASHBY_BOARDS = String(process.env.ASHBY_BOARDS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
const WORKABLE_ACCOUNTS = String(process.env.WORKABLE_ACCOUNTS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
const RECRUITEE_COMPANIES = String(process.env.RECRUITEE_COMPANIES || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
const PERSONIO_COMPANIES = String(process.env.PERSONIO_COMPANIES || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
const http = axios_1.default.create({ timeout: API_TIMEOUT_MS });
const withTimeout = (promise, ms) => {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms));
    return Promise.race([promise, timeout]);
};
const getCountryCode = (where) => {
    const normalized = where.trim().toLowerCase();
    if (normalized.includes("south africa") || normalized === "za") {
        return "za";
    }
    if (normalized.includes("united states") || normalized === "us") {
        return "us";
    }
    if (normalized.includes("united kingdom") || normalized === "uk") {
        return "gb";
    }
    return undefined;
};
const mapAdzunaCountry = (where) => getCountryCode(where) || getCountryCode(DEFAULT_LOCATION) || "za";
const JSEARCH_URL = process.env.JSEARCH_URL || "https://jsearch.p.rapidapi.com/search";
const JSEARCH_HOST = "jsearch.p.rapidapi.com";
const fetchAdzunaPage = async (what, where, page) => {
    const country = mapAdzunaCountry(where);
    const params = {
        app_id: process.env.ADZUNA_APP_ID || "",
        app_key: process.env.ADZUNA_API_KEY || "",
        results_per_page: ADZUNA_RESULTS_PER_PAGE,
        what,
    };
    if (where.trim()) {
        params.where = where;
    }
    const res = await axios_1.default.get(`https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`, {
        params,
        timeout: ADZUNA_TIMEOUT_MS,
        headers: {
            Accept: "application/json",
        },
    });
    return res.data.results || [];
};
const fetchAdzuna = async (what, where = "") => {
    const pages = await Promise.all(Array.from({ length: ADZUNA_PAGE_COUNT }, (_, index) => fetchAdzunaPage(what, where, index + 1)));
    return pages.flat();
};
const fetchRemotive = async (what, where) => {
    const effectiveWhere = where.trim().toLowerCase();
    const res = await http.get("https://remotive.com/api/remote-jobs");
    return res.data.jobs.filter((job) => {
        const titleMatches = String(job.title || "")
            .toLowerCase()
            .includes(what.toLowerCase());
        const location = String(job.candidate_required_location || "").toLowerCase();
        const locationMatches = location.includes(effectiveWhere) ||
            location.includes("worldwide") ||
            location.includes("remote");
        return titleMatches && locationMatches;
    });
};
const fetchGreenhouse = async (what, where) => {
    if (!GREENHOUSE_BOARDS.length)
        return [];
    const effectiveWhere = where.trim().toLowerCase();
    const results = await Promise.all(GREENHOUSE_BOARDS.map(async (board) => {
        const res = await http.get(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs`, {
            params: { content: true },
        });
        return (res.data.jobs || []).filter((job) => {
            const title = String(job.title || "").toLowerCase();
            const location = String(job.location?.name || "").toLowerCase();
            return (title.includes(what.toLowerCase()) &&
                (location.includes(effectiveWhere) || effectiveWhere === ""));
        });
    }));
    return results.flat();
};
const fetchLever = async (what, where) => {
    if (!LEVER_SITES.length)
        return [];
    const effectiveWhere = where.trim().toLowerCase();
    const results = await Promise.all(LEVER_SITES.map(async (site) => {
        const res = await http.get(`https://api.lever.co/v0/postings/${site}`, {
            params: { mode: "json", limit: 100 },
        });
        return (res.data || []).filter((job) => {
            const title = String(job.text || job.title || "").toLowerCase();
            const location = String(job.categories?.location || job.categories?.commitment || "").toLowerCase();
            return (title.includes(what.toLowerCase()) &&
                (location.includes(effectiveWhere) || effectiveWhere === ""));
        });
    }));
    return results.flat();
};
const fetchAshby = async (what, where) => {
    if (!ASHBY_BOARDS.length)
        return [];
    const effectiveWhere = where.trim().toLowerCase();
    const results = await Promise.all(ASHBY_BOARDS.map(async (board) => {
        const res = await http.get(`https://api.ashbyhq.com/posting-api/job-board/${board}`, {
            params: { includeCompensation: true },
        });
        return (res.data || []).filter((job) => {
            const title = String(job.title || "").toLowerCase();
            const location = String(job.location || "").toLowerCase();
            return (title.includes(what.toLowerCase()) &&
                (location.includes(effectiveWhere) || effectiveWhere === ""));
        });
    }));
    return results.flat();
};
const fetchWorkable = async (what, where) => {
    if (!WORKABLE_ACCOUNTS.length)
        return [];
    const effectiveWhere = where.trim().toLowerCase();
    const results = await Promise.all(WORKABLE_ACCOUNTS.map(async (account) => {
        const res = await http.get(`https://www.workable.com/api/accounts/${account}`, {
            params: { details: true },
        });
        return (res.data.jobs || []).filter((job) => {
            const title = String(job.title || "").toLowerCase();
            const location = String(job.location || job.department || "").toLowerCase();
            return (title.includes(what.toLowerCase()) &&
                (location.includes(effectiveWhere) || effectiveWhere === ""));
        });
    }));
    return results.flat();
};
const fetchRecruitee = async (what, where) => {
    if (!RECRUITEE_COMPANIES.length)
        return [];
    const effectiveWhere = where.trim().toLowerCase();
    const results = await Promise.all(RECRUITEE_COMPANIES.map(async (company) => {
        const res = await http.get(`https://${company}.recruitee.com/api/offers/`);
        return (res.data || []).filter((job) => {
            const title = String(job.title || "").toLowerCase();
            const location = String(job.location || "").toLowerCase();
            return (title.includes(what.toLowerCase()) &&
                (location.includes(effectiveWhere) || effectiveWhere === ""));
        });
    }));
    return results.flat();
};
const fetchPersonio = async (what, where) => {
    if (!PERSONIO_COMPANIES.length)
        return [];
    const effectiveWhere = where.trim().toLowerCase();
    const results = await Promise.all(PERSONIO_COMPANIES.map(async (company) => {
        const res = await http.get(`https://${company}.jobs.personio.de/xml`, {
            params: { language: "en" },
        });
        const xml = String(res.data || "");
        return parsePersonioXml(xml).filter((job) => {
            const title = String(job.title || "").toLowerCase();
            const location = String(job.location || "").toLowerCase();
            return (title.includes(what.toLowerCase()) &&
                (location.includes(effectiveWhere) || effectiveWhere === ""));
        });
    }));
    return results.flat();
};
const parsePersonioXml = (xml) => {
    return xml
        .split(/<position>/gi)
        .slice(1)
        .map((position) => {
        const extractTag = (tag) => {
            const match = position.match(new RegExp(`<${tag}>([\s\S]*?)<\/${tag}>`, "i"));
            return match ? match[1].trim() : "";
        };
        return {
            title: extractTag("name"),
            company: extractTag("subcompany") || "Personio",
            location: extractTag("office"),
            description: extractTag("description") || "",
            url: "",
            salary: "N/A",
        };
    });
};
const fetchArbeitNow = async (what, where = DEFAULT_LOCATION) => {
    const effectiveQuery = `${what} ${where}`.trim();
    const res = await http.get("https://www.arbeitnow.com/api/job-board-api", {
        params: {
            search: effectiveQuery,
            page: "1",
        },
    });
    return res.data.data || res.data.jobs || [];
};
const fetchJSearch = async (what, where = "") => {
    const effectiveWhere = where.trim() || DEFAULT_LOCATION;
    const query = `${what} jobs in ${effectiveWhere}`;
    const params = {
        query,
        page: "1",
        num_pages: String(JSEARCH_NUM_PAGES),
    };
    const country = getCountryCode(effectiveWhere);
    if (country) {
        params.country = country;
    }
    const res = await http.get(JSEARCH_URL, {
        params,
        headers: {
            "x-rapidapi-key": process.env.RAPID_API_KEY || "",
            "x-rapidapi-host": JSEARCH_HOST,
        },
    });
    return res.data.data || [];
};
const safeFetch = async (fn, provider, fallback) => {
    try {
        const response = await fn();
        if (Array.isArray(response)) {
            console.log(`${provider} responded with ${response.length} items`);
        }
        else {
            console.log(`${provider} responded`);
        }
        return response;
    }
    catch (error) {
        console.warn(`${provider} fetch failed:`, error?.message || error);
        return fallback;
    }
};
const fetchAllJobs = async (what, where) => {
    const effectiveWhere = where.trim() || DEFAULT_LOCATION;
    const remotivePromise = safeFetch(() => withTimeout(fetchRemotive(what, effectiveWhere), API_TIMEOUT_MS), "Remotive", []);
    const jsearchPromise = safeFetch(() => withTimeout(fetchJSearch(what, effectiveWhere), API_TIMEOUT_MS), "JSearch", []);
    const adzunaPromise = safeFetch(() => withTimeout(fetchAdzuna(what, effectiveWhere), ADZUNA_TIMEOUT_MS), "Adzuna", []);
    const arbeitNowPromise = safeFetch(() => withTimeout(fetchArbeitNow(what, effectiveWhere), API_TIMEOUT_MS), "ArbeitNow", []);
    const greenhousePromise = safeFetch(() => withTimeout(fetchGreenhouse(what, effectiveWhere), API_TIMEOUT_MS), "Greenhouse", []);
    const leverPromise = safeFetch(() => withTimeout(fetchLever(what, effectiveWhere), API_TIMEOUT_MS), "Lever", []);
    const ashbyPromise = safeFetch(() => withTimeout(fetchAshby(what, effectiveWhere), API_TIMEOUT_MS), "Ashby", []);
    const workablePromise = safeFetch(() => withTimeout(fetchWorkable(what, effectiveWhere), API_TIMEOUT_MS), "Workable", []);
    const recruiteePromise = safeFetch(() => withTimeout(fetchRecruitee(what, effectiveWhere), API_TIMEOUT_MS), "Recruitee", []);
    const personioPromise = safeFetch(() => withTimeout(fetchPersonio(what, effectiveWhere), API_TIMEOUT_MS), "Personio", []);
    const [remotiveRaw, jsearchRaw, adzunaRaw, arbeitNowRaw, greenhouseRaw, leverRaw, ashbyRaw, workableRaw, recruiteeRaw, personioRaw,] = await Promise.all([
        remotivePromise,
        jsearchPromise,
        adzunaPromise,
        arbeitNowPromise,
        greenhousePromise,
        leverPromise,
        ashbyPromise,
        workablePromise,
        recruiteePromise,
        personioPromise,
    ]);
    return {
        adzunaRaw,
        remotiveRaw,
        jsearchRaw,
        arbeitNowRaw,
        greenhouseRaw,
        leverRaw,
        ashbyRaw,
        workableRaw,
        recruiteeRaw,
        personioRaw,
    };
};
exports.fetchAllJobs = fetchAllJobs;
//# sourceMappingURL=jobService.js.map