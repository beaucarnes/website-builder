// src/lib/db.ts
import { sql } from '@vercel/postgres';

export async function saveWebsiteData(siteId: string, userId: string, jsonData: object, htmlCode: string) {
  try {
    await sql`
      INSERT INTO websites (id, userId, jsonData, htmlCode)
      VALUES (${siteId}, ${userId}, ${JSON.stringify(jsonData)}, ${htmlCode})
      ON CONFLICT (id) 
      DO UPDATE SET 
        jsonData = ${JSON.stringify(jsonData)},
        htmlCode = ${htmlCode};
    `;
    console.log(`Successfully saved data and HTML for siteId: ${siteId}`);
  } catch (error) {
    console.error("Failed to save website data:", error);
    throw new Error("Database save operation failed.");
  }
}