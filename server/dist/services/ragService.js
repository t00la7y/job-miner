"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRAGContext = buildRAGContext;
exports.assembleSystemPrompt = assembleSystemPrompt;
const mongoose_1 = require("mongoose");
const embeddingService_1 = require("./embeddingService");
const qdrantClient_1 = require("./qdrantClient");
const chatHistory_1 = __importDefault(require("../models/chatHistory"));
const user_1 = __importDefault(require("../models/user"));
const job_1 = __importDefault(require("../models/job"));
async function buildRAGContext(userId, userMessage) {
    try {
        // 1. Generate embedding for user message
        const messageEmbedding = await (0, embeddingService_1.generateEmbedding)(userMessage);
        // 2. Search for similar jobs in Qdrant
        const similarJobIds = await (0, qdrantClient_1.searchSimilarJobs)(messageEmbedding, 5);
        // 3. Fetch similar jobs from MongoDB
        const similarJobs = await job_1.default.find({
            _id: { $in: similarJobIds.map((id) => new mongoose_1.Types.ObjectId(id)) },
        })
            .select("title company location description salary")
            .limit(5);
        // 4. Fetch last 10 chat history entries
        const chatHistory = await chatHistory_1.default.find({
            user: new mongoose_1.Types.ObjectId(userId),
        })
            .sort({ timestamp: -1 })
            .limit(10)
            .select("userMessage botResponse timestamp");
        // 5. Fetch user profile data
        const user = await user_1.default.findById(userId).select("searchHistory clickedJobs preferences");
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
    }
    catch (error) {
        console.error("Error building RAG context:", error);
        throw error;
    }
}
function assembleSystemPrompt(context) {
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
        .map((job) => `- ${job.title} at ${job.company} (${job.location}) - ${job.salary}
  Description: ${job.description.substring(0, 200)}...`)
        .join("\n\n")}

Based on the user's profile, conversation history, and relevant job opportunities, provide helpful, personalized advice about job searching. Be conversational and encouraging. If they ask about specific jobs, reference the relevant opportunities above. Keep responses focused and actionable.`;
    return prompt;
}
//# sourceMappingURL=ragService.js.map