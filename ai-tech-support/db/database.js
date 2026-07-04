import { MongoClient } from 'mongodb';

const COLLECTION_NAME = 'soporte_history_detail';
const uri = process.env.MONGODB_CS;
const client = new MongoClient(uri);

let db;

export async function connectDB() {
    if (db) return db;
    await client.connect();
    db = client.db('AIChat');
    console.log('Conectado a MongoDB');
    return db;
}
export async function getFormattedHistory(chatId) {
    const db = await connectDB();
    const collection = db.collection(COLLECTION_NAME);

    // Recuperamos el historial. 
    // NOTA: Cambié el sort a 1 para que sea cronológico (del más viejo al más nuevo)
    const rawHistory = await collection.find({ chatId })
        .project({ _id: 0, userQuestion: 1, chatResponse: 1 })
        .sort({ datetime: 1 }) 
        .toArray();

    // Mapeamos al formato que exige @google/genai
    return rawHistory.flatMap((log) => [
        { role: "user", parts: [{ text: log.userQuestion }] },
        { role: "model", parts: [{ text: log.chatResponse }] }
    ]);
};

export async function saveChatTurn(chatId, userQuestion, chatResponse) {
    const db = await connectDB();
    const collection = db.collection(COLLECTION_NAME);

    const newEntry = {
        chatId,
        datetime: Date.now(),
        userQuestion,
        chatResponse
    };

    return await collection.insertOne(newEntry);
};