import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), ms),
  );
  return Promise.race([promise, timeout]);
};

const fetchAdzuna = async (what: string, where: string = "south africa") => {
  const res = await axios.get(
    `https://api.adzuna.com/v1/api/jobs/za/search/1`,
    {
      params: {
        app_id: process.env.ADZUNA_APP_ID,
        app_key: process.env.ADZUNA_API_KEY,
        results_per_page: 20,
        what,
        where,
      },
      // timeout: 3000
    },
  );
  return res.data.results || [];
};

const fetchRemotive = async (what: string) => {
  const res = await axios.get("https://remotive.com/api/remote-jobs");
  return res.data.jobs.filter((job: any) =>
    job.title.toLowerCase().includes(what.toLowerCase()),
  );
};

const fetchJSearch = async (what: string) => {
  const res = await axios.get("https://jsearch.p.rapidapi.com/search", {
    params: {
      query: `${what} in south africa`,
      page: "1",
      num_pages: "1",
      country: "za",
    },
    headers: {
      "x-rapidapi-key": process.env.RAPID_API_KEY!,
      "x-rapidapi-host": process.env.RAPID_API_HOST ,
    },
  });
  return res.data.data || [];
};

export const fetchAllJobs = async (
  what: string,
  where: string,
) => {
  const remotivePromise = fetchRemotive(what);
  const jsearchPromise = fetchJSearch(what);

  const adzunaPromise = withTimeout(fetchAdzuna(what, where), 2500).catch(
    () => [],
  );

  const [remotiveRaw, jsearchRaw] = await Promise.all([
    remotivePromise,
    jsearchPromise,
  ]);

  let adzunaRaw: any[] = [];
  try {
    adzunaRaw = await Promise.race([adzunaPromise, Promise.resolve([])]);
  } catch {
    adzunaRaw = [];
  }

  return {
    adzunaRaw,
    remotiveRaw,
    jsearchRaw,
  };
};
