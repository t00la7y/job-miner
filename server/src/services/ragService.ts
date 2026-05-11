import { Types } from "mongoose";
import { generateEmbedding } from "./embeddingService";
import { searchSimilarJobs } from "./qdrantClient";
import ChatHistory from "../models/chatHistory";
import User from "../models/user";
import Job from "../models/job";

export interface RAGContext {
  userMessage: string;
  chatHistory: Array<{
    userMessage: string;
    botResponse: string;
    timestamp: Date;
  }>;
  similarJobs: Array<{
    title: string;
    company: string;
    location: string;
    description: string;
    salary: string;
  }>;
  userProfile: {
    searchHistory: string[];
    clickedJobs: string[];
    preferences: {
      jobTypes: string[];
      industries: string[];
      experienceLevel: string;
    };
  };
}

export async function buildRAGContext(
  userId: string,
  userMessage: string,
): Promise<RAGContext> {
  try {
    // 1. Generate embedding for user message
    const messageEmbedding = await generateEmbedding(userMessage);

    // 2. Search for similar jobs in Qdrant
    const similarJobIds: string[] = await searchSimilarJobs(
      messageEmbedding,
      5,
    );

    // 3. Fetch similar jobs from MongoDB
    const similarJobs = await Job.find({
      _id: { $in: similarJobIds.map((id: string) => new Types.ObjectId(id)) },
    })
      .select("title company location description salary")
      .limit(5);

    // 4. Fetch last 10 chat history entries
    const chatHistory = await ChatHistory.find({
      user: new Types.ObjectId(userId),
    })
      .sort({ timestamp: -1 })
      .limit(10)
      .select("userMessage botResponse timestamp");

    // 5. Fetch user profile data
    const user = await User.findById(userId).select(
      "searchHistory clickedJobs preferences",
    );

    if (!user) {
      throw new Error("User not found");
    }

    return {
      userMessage,
      chatHistory: chatHistory.reverse().map((chat) => ({
        userMessage: chat.userMessage,
        botResponse: chat.botResponse,
        timestamp: chat.timestamp,
      })),
      similarJobs: similarJobs.map((job) => ({
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        salary: job.salary,
      })),
      userProfile: {
        searchHistory: user.searchHistory || [],
        clickedJobs: user.clickedJobs || [],
        preferences: user.preferences || {
          jobTypes: [],
          industries: [],
          experienceLevel: "entry-level",
        },
      },
    };
  } catch (error) {
    console.error("Error building RAG context:", error);
    throw error;
  }
}

export function assembleSystemPrompt(context: RAGContext): string {
  const { chatHistory, similarJobs, userProfile } = context;

  let prompt = `You are a helpful job search assistant for JobMiner. Help users find and learn about job opportunities.

USER PROFILE:
- Experience Level: ${userProfile.preferences.experienceLevel}
- Preferred Job Types: ${userProfile.preferences.jobTypes.join(", ") || "Not specified"}
- Preferred Industries: ${userProfile.preferences.industries.join(", ") || "Not specified"}
- Recent Searches: ${userProfile.searchHistory.slice(-5).join(", ") || "None"}
- Jobs Clicked: ${userProfile.clickedJobs.length} jobs viewed

RECENT CONVERSATION:
${chatHistory
  .slice(-5)
  .map((chat) => `User: ${chat.userMessage}\nAssistant: ${chat.botResponse}`)
  .join("\n\n")}

RELEVANT JOB OPPORTUNITIES:
${similarJobs
  .map(
    (job) => `- ${job.title} at ${job.company} (${job.location}) - ${job.salary}
  Description: ${job.description.substring(0, 200)}...`,
  )
  .join("\n\n")}

Based on the user's profile, conversation history, and relevant job opportunities, provide helpful, personalized advice about job searching. Be conversational and encouraging. If they ask about specific jobs, reference the relevant opportunities above. Keep responses focused and actionable.`;

  return prompt;
}
