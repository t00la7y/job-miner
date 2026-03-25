import axios from "axios";
import type { Job } from "../types/index";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const jobsService = {
  getJobs: async (
    what: string = "",
    where: string = "south africa",
    signal?: AbortSignal,
  ): Promise<Job[]> => {
    try {
      const response = await api.get("/api/jobs", {
        params: { what, where },
        signal,
      });
      return response.data;
    } catch (error: any) {
      console.error(
        "Error fetching jobs:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
  
  saveJob: async (job: Partial<Job>): Promise<Job> => {
    try {
      const response = await api.post("/api/jobs/save", job);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to save job");
    }
  },
};
