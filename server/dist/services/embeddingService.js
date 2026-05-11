"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmbedding = generateEmbedding;
exports.generateJobEmbedding = generateJobEmbedding;
const OLLAMA_BASE_URL = "http://localhost:11434";
const EMBEDDING_MODEL = "nomic-embed-text";
async function generateEmbedding(text) {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: EMBEDDING_MODEL,
                prompt: text,
            }),
        });
        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.embedding;
    }
    catch (error) {
        console.error("Error generating embedding:", error);
        throw error;
    }
}
async function generateJobEmbedding(job) {
    const textToEmbed = `${job.title} ${job.description || ""} ${job.tags?.join(" ") || ""}`.trim();
    return generateEmbedding(textToEmbed);
}
//# sourceMappingURL=embeddingService.js.map