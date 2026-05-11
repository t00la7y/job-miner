"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VECTOR_SIZE = exports.COLLECTION_NAME = void 0;
exports.initializeQdrantCollection = initializeQdrantCollection;
exports.upsertJobVector = upsertJobVector;
exports.searchSimilarJobs = searchSimilarJobs;
let qdrantClient;
const COLLECTION_NAME = "jobs";
exports.COLLECTION_NAME = COLLECTION_NAME;
const VECTOR_SIZE = 768;
exports.VECTOR_SIZE = VECTOR_SIZE;
async function getQdrantClient() {
    if (!qdrantClient) {
        const qdrantModule = await import("@qdrant/js-client-rest");
        const { QdrantClient } = qdrantModule;
        qdrantClient = new QdrantClient({
            url: "http://localhost:6333",
        });
    }
    return qdrantClient;
}
async function initializeQdrantCollection() {
    try {
        const client = await getQdrantClient();
        // Check if collection exists
        const collections = await client.getCollections();
        const collectionExists = collections.collections.some((collection) => collection.name === COLLECTION_NAME);
        if (!collectionExists) {
            // Create collection with cosine distance for semantic similarity
            await client.createCollection(COLLECTION_NAME, {
                vectors: {
                    size: VECTOR_SIZE,
                    distance: "Cosine",
                },
            });
            console.log(`Created Qdrant collection: ${COLLECTION_NAME}`);
        }
        else {
            console.log(`Qdrant collection ${COLLECTION_NAME} already exists`);
        }
    }
    catch (error) {
        console.error("Error initializing Qdrant collection:", error);
        throw error;
    }
}
async function upsertJobVector(jobId, vector) {
    try {
        const client = await getQdrantClient();
        await client.upsert(COLLECTION_NAME, {
            points: [
                {
                    id: jobId,
                    vector: vector,
                    payload: {
                        jobId: jobId,
                    },
                },
            ],
        });
    }
    catch (error) {
        console.error("Error upserting job vector:", error);
        throw error;
    }
}
async function searchSimilarJobs(vector, limit = 5) {
    try {
        const client = await getQdrantClient();
        const searchResult = await client.search(COLLECTION_NAME, {
            vector: vector,
            limit: limit,
            with_payload: true,
        });
        return searchResult.map((point) => point.payload?.jobId);
    }
    catch (error) {
        console.error("Error searching similar jobs:", error);
        throw error;
    }
}
//# sourceMappingURL=qdrantClient.js.map