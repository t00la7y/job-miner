import axios from "axios";
import type { Job } from "../types/index";

const API_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const jobsService = {
  getJobs: async (
    what: string = "",
    where: string = "",
    signal?: AbortSignal,
  ): Promise<Job[]> => {
    try {
      if (!what || what.trim().length === 0) {
        throw new Error("Please enter a search term");
      }

      const response = await api.get("/api/jobs", {
        params: { what, where },
        signal,
      });

      const payload = response.data;
      if (!Array.isArray(payload)) {
        console.warn(
          "Unexpected jobs response format, expected array:",
          payload,
        );
        return [];
      }

      if (payload.length === 0) {
        console.warn("No jobs found for query:", { what, where });
      }

      return payload;
    } catch (error: any) {
      if (error.name === "CanceledError" || error.name === "AbortError") {
        throw error;
      }

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch jobs. Please try again.";

      console.error("Error fetching jobs:", errorMessage, error);
      throw new Error(errorMessage);
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
