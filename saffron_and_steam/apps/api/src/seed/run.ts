// npm run seed -w api: (re)loads the sample menu and café settings into MongoDB.
import { env } from "../config/env";
import { connectDb, disconnectDb } from "../db";
import { seedCatalog } from "./seed";

await connectDb(env.MONGODB_URI);
const { items, categories } = await seedCatalog();
console.log(`Seeded ${items} dishes, ${categories} categories and the café settings.`);
await disconnectDb();
