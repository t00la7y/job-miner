import { Request, Response } from "express";
import { buildRAGContext, assembleSystemPrompt } from "../services/ragService";
import ChatHistory from "../models/chatHistory";

const OLLAMA_BASE_URL = "http://localhost:11434";
const CHAT_MODEL = "qwen2.5:3b";

export const chatController = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const user = (req as any).user;
    const userId = user?._id?.toString() || user?.id;

    if (!message || !userId) {
      return res
        .status(400)
        .json({ error: "Message and user authentication required" });
    }

    // Build RAG context
    const context = await buildRAGContext(userId, message);
    const systemPrompt = assembleSystemPrompt(context);

    // Prepare messages for Ollama
    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: message,
      },
    ];

    // Call Ollama API with streaming
    const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        messages: messages,
        stream: true,
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama API error: ${ollamaResponse.status}`);
    }

    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    // Stream the response
    const reader = ollamaResponse.body?.getReader();
    if (!reader) {
      throw new Error("No response body from Ollama");
    }

    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.trim() === "") continue;

          try {
            const data = JSON.parse(line);
            if (data.done) break;

            const content = data.message?.content || "";
            if (content) {
              fullResponse += content;
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch (parseError) {
            // Skip invalid JSON lines
            continue;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    // End the stream
    res.write("data: [DONE]\n\n");
    res.end();

    // Save to chat history (fire and forget)
    try {
      await ChatHistory.create({
        user: userId,
        userMessage: message,
        botResponse: fullResponse,
      });
    } catch (saveError) {
      console.error("Error saving chat history:", saveError);
      // Don't fail the request if saving fails
    }
  } catch (error) {
    console.error("Chat controller error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
