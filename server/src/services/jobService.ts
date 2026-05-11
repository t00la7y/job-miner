import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_TIMEOUT_MS = 8000;
const ADZUNA_TIMEOUT_MS = 12000; // Increased for multi-page fetches
const DEFAULT_LOCATION = process.env.DEFAULT_LOCATION || "South Africa";
const ADZUNA_RESULTS_PER_PAGE =
  Number(process.env.ADZUNA_RESULTS_PER_PAGE) || 50;
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
const http = axios.create({ timeout: API_TIMEOUT_MS });

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), ms),
  );
  return Promise.race([promise, timeout]);
};

const getCountryCode = (where: string) => {
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

const mapAdzunaCountry = (where: string) =>
  getCountryCode(where) || getCountryCode(DEFAULT_LOCATION) || "za";

const JSEARCH_URL =
  process.env.JSEARCH_URL || "https://jsearch.p.rapidapi.com/search";
const JSEARCH_HOST = "jsearch.p.rapidapi.com";

const fetchAdzunaPage = async (what: string, where: string, page: number) => {
  const country = mapAdzunaCountry(where);
  const params: Record<string, string | number> = {
    app_id: process.env.ADZUNA_APP_ID || "",
    app_key: process.env.ADZUNA_API_KEY || "",
    results_per_page: ADZUNA_RESULTS_PER_PAGE,
    what,
  };

  if (where.trim()) {
    params.where = where;
  }

  const res = await axios.get(
    `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`,
    {
      params,
      timeout: ADZUNA_TIMEOUT_MS,
      headers: {
        Accept: "application/json",
      },
    },
  );
  return res.data.results || [];
};

const fetchAdzuna = async (what: string, where: string = "") => {
  const pages = await Promise.all(
    Array.from({ length: ADZUNA_PAGE_COUNT }, (_, index) =>
      fetchAdzunaPage(what, where, index + 1),
    ),
  );
  return pages.flat();
};

const fetchRemotive = async (what: string, where: string) => {
  const effectiveWhere = where.trim().toLowerCase();
  const res = await http.get("https://remotive.com/api/remote-jobs");
  return res.data.jobs.filter((job: any) => {
    const titleMatches = String(job.title || "")
      .toLowerCase()
      .includes(what.toLowerCase());
    const location = String(
      job.candidate_required_location || "",
    ).toLowerCase();
    const locationMatches =
      location.includes(effectiveWhere) ||
      location.includes("worldwide") ||
      location.includes("remote");
    return titleMatches && locationMatches;
  });
};

const fetchGreenhouse = async (what: string, where: string) => {
  if (!GREENHOUSE_BOARDS.length) return [];
  const effectiveWhere = where.trim().toLowerCase();

  const results = await Promise.all(
    GREENHOUSE_BOARDS.map(async (board) => {
      const res = await http.get(
        `https://boards-api.greenhouse.io/v1/boards/${board}/jobs`,
        {
          params: { content: true },
        },
      );
      return (res.data.jobs || []).filter((job: any) => {
        const title = String(job.title || "").toLowerCase();
        const location = String(job.location?.name || "").toLowerCase();
        return (
          title.includes(what.toLowerCase()) &&
          (location.includes(effectiveWhere) || effectiveWhere === "")
        );
      });
    }),
  );

  return results.flat();
};

const fetchLever = async (what: string, where: string) => {
  if (!LEVER_SITES.length) return [];
  const effectiveWhere = where.trim().toLowerCase();

  const results = await Promise.all(
    LEVER_SITES.map(async (site) => {
      const res = await http.get(`https://api.lever.co/v0/postings/${site}`, {
        params: { mode: "json", limit: 100 },
      });
      return (res.data || []).filter((job: any) => {
        const title = String(job.text || job.title || "").toLowerCase();
        const location = String(
          job.categories?.location || job.categories?.commitment || "",
        ).toLowerCase();
        return (
          title.includes(what.toLowerCase()) &&
          (location.includes(effectiveWhere) || effectiveWhere === "")
        );
      });
    }),
  );

  return results.flat();
};

const fetchAshby = async (what: string, where: string) => {
  if (!ASHBY_BOARDS.length) return [];
  const effectiveWhere = where.trim().toLowerCase();

  const results = await Promise.all(
    ASHBY_BOARDS.map(async (board) => {
      const res = await http.get(
        `https://api.ashbyhq.com/posting-api/job-board/${board}`,
        {
          params: { includeCompensation: true },
        },
      );
      return (res.data || []).filter((job: any) => {
        const title = String(job.title || "").toLowerCase();
        const location = String(job.location || "").toLowerCase();
        return (
          title.includes(what.toLowerCase()) &&
          (location.includes(effectiveWhere) || effectiveWhere === "")
        );
      });
    }),
  );

  return results.flat();
};

const fetchWorkable = async (what: string, where: string) => {
  if (!WORKABLE_ACCOUNTS.length) return [];
  const effectiveWhere = where.trim().toLowerCase();

  const results = await Promise.all(
    WORKABLE_ACCOUNTS.map(async (account) => {
      const res = await http.get(
        `https://www.workable.com/api/accounts/${account}`,
        {
          params: { details: true },
        },
      );
      return (res.data.jobs || []).filter((job: any) => {
        const title = String(job.title || "").toLowerCase();
        const location = String(
          job.location || job.department || "",
        ).toLowerCase();
        return (
          title.includes(what.toLowerCase()) &&
          (location.includes(effectiveWhere) || effectiveWhere === "")
        );
      });
    }),
  );

  return results.flat();
};

const fetchRecruitee = async (what: string, where: string) => {
  if (!RECRUITEE_COMPANIES.length) return [];
  const effectiveWhere = where.trim().toLowerCase();

  const results = await Promise.all(
    RECRUITEE_COMPANIES.map(async (company) => {
      const res = await http.get(
        `https://${company}.recruitee.com/api/offers/`,
      );
      return (res.data || []).filter((job: any) => {
        const title = String(job.title || "").toLowerCase();
        const location = String(job.location || "").toLowerCase();
        return (
          title.includes(what.toLowerCase()) &&
          (location.includes(effectiveWhere) || effectiveWhere === "")
        );
      });
    }),
  );

  return results.flat();
};

const fetchPersonio = async (what: string, where: string) => {
  if (!PERSONIO_COMPANIES.length) return [];
  const effectiveWhere = where.trim().toLowerCase();

  const results = await Promise.all(
    PERSONIO_COMPANIES.map(async (company) => {
      const res = await http.get(`https://${company}.jobs.personio.de/xml`, {
        params: { language: "en" },
      });
      const xml = String(res.data || "");
      return parsePersonioXml(xml).filter((job: any) => {
        const title = String(job.title || "").toLowerCase();
        const location = String(job.location || "").toLowerCase();
        return (
          title.includes(what.toLowerCase()) &&
          (location.includes(effectiveWhere) || effectiveWhere === "")
        );
      });
    }),
  );

  return results.flat();
};

const parsePersonioXml = (xml: string) => {
  return xml
    .split(/<position>/gi)
    .slice(1)
    .map((position) => {
      const extractTag = (tag: string) => {
        const match = position.match(
          new RegExp(`<${tag}>([\s\S]*?)<\/${tag}>`, "i"),
        );
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

const fetchArbeitNow = async (
  what: string,
  where: string = DEFAULT_LOCATION,
) => {
  const effectiveQuery = `${what} ${where}`.trim();
  const res = await http.get("https://www.arbeitnow.com/api/job-board-api", {
    params: {
      search: effectiveQuery,
      page: "1",
    },
  });
  return res.data.data || res.data.jobs || [];
};

const fetchJSearch = async (what: string, where: string = "") => {
  const effectiveWhere = where.trim() || DEFAULT_LOCATION;
  const query = `${what} jobs in ${effectiveWhere}`;
  const params: Record<string, string> = {
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

const safeFetch = async <T>(
  fn: () => Promise<T>,
  provider: string,
  fallback: T,
) => {
  try {
    const response = await fn();
    if (Array.isArray(response)) {
      console.log(`${provider} responded with ${response.length} items`);
    } else {
      console.log(`${provider} responded`);
    }
    return response;
  } catch (error: any) {
    console.warn(`${provider} fetch failed:`, error?.message || error);
    return fallback;
  }
};

export const fetchAllJobs = async (what: string, where: string) => {
  const effectiveWhere = where.trim() || DEFAULT_LOCATION;

  const remotivePromise = safeFetch(
    () => withTimeout(fetchRemotive(what, effectiveWhere), API_TIMEOUT_MS),
    "Remotive",
    [],
  );
  const jsearchPromise = safeFetch(
    () => withTimeout(fetchJSearch(what, effectiveWhere), API_TIMEOUT_MS),
    "JSearch",
    [],
  );
  const adzunaPromise = safeFetch(
    () => withTimeout(fetchAdzuna(what, effectiveWhere), ADZUNA_TIMEOUT_MS),
    "Adzuna",
    [],
  );
  const arbeitNowPromise = safeFetch(
    () => withTimeout(fetchArbeitNow(what, effectiveWhere), API_TIMEOUT_MS),
    "ArbeitNow",
    [],
  );
  const greenhousePromise = safeFetch(
    () => withTimeout(fetchGreenhouse(what, effectiveWhere), API_TIMEOUT_MS),
    "Greenhouse",
    [],
  );
  const leverPromise = safeFetch(
    () => withTimeout(fetchLever(what, effectiveWhere), API_TIMEOUT_MS),
    "Lever",
    [],
  );
  const ashbyPromise = safeFetch(
    () => withTimeout(fetchAshby(what, effectiveWhere), API_TIMEOUT_MS),
    "Ashby",
    [],
  );
  const workablePromise = safeFetch(
    () => withTimeout(fetchWorkable(what, effectiveWhere), API_TIMEOUT_MS),
    "Workable",
    [],
  );
  const recruiteePromise = safeFetch(
    () => withTimeout(fetchRecruitee(what, effectiveWhere), API_TIMEOUT_MS),
    "Recruitee",
    [],
  );
  const personioPromise = safeFetch(
    () => withTimeout(fetchPersonio(what, effectiveWhere), API_TIMEOUT_MS),
    "Personio",
    [],
  );

  const [
    remotiveRaw,
    jsearchRaw,
    adzunaRaw,
    arbeitNowRaw,
    greenhouseRaw,
    leverRaw,
    ashbyRaw,
    workableRaw,
    recruiteeRaw,
    personioRaw,
  ] = await Promise.all([
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
