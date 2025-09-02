// src/inngest/functions.ts
import { inngest } from "./client";
import { OpenAI } from "openai";
import { saveWebsiteData } from "@/lib/db";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// The main function that builds the website
export const generateWebsite = inngest.createFunction(
  { id: "generate-website-from-prompt" },
  { event: "website.generate.requested" },
  async ({ event, step }) => {
    const { userId, prompt, siteId } = event.data;

    // STEP 1: Generate the high-level site structure (pages and sections)
    const structure = await step.run("1-generate-site-structure", async () => {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a website architect. Based on the user's prompt, generate a JSON object representing the site structure. Include a 'pages' array, where each page has a 'name' (e.g., 'Home') and a 'sections' array. Each section should have a 'type' (e.g., 'hero', 'about', 'menu') and a 'prompt' for what content to generate for it.`,
          },
          { role: "user", content: `Prompt: ${prompt}` },
        ],
        response_format: { type: "json_object" },
      });
      return JSON.parse(response.choices[0].message.content || "{}");
    });

    // STEP 2: Generate content for each section of each page
    const finalSiteData = await step.run("2-generate-all-content", async () => {
      const siteWithContent = { ...structure };

      for (const page of siteWithContent.pages) {
        for (const section of page.sections) {
          const contentResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: `You are a website content writer. Based on the user's main goal and the specific section prompt, generate a JSON object with 'title' and 'body' text. Main goal: ${prompt}`,
              },
              { role: "user", content: `Section prompt: ${section.prompt}` },
            ],
            response_format: { type: "json_object" },
          });
          section.content = JSON.parse(contentResponse.choices[0].message.content || "{}");
        }
      }
      return siteWithContent;
    });

    const generatedCode = await step.run("3-generate-html-css", async () => {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert web developer specializing in Tailwind CSS. 
            Your task is to create a single, complete HTML file based on a JSON object describing a website's content.
            Use Tailwind CSS for all styling. Use modern, clean design principles.
            Ensure the page is fully responsive.
            Use placeholder images from https://placehold.co/ if image URLs are not provided in the JSON.
            The final output should be ONLY the raw HTML code. Do not include markdown, explanations, or any text outside of the HTML itself.`,
          },
          { 
            role: "user", 
            content: `Generate the HTML for the following website data: ${JSON.stringify(finalSiteData)}`
          },
        ],
      });
      let rawCode = response.choices[0].message.content || '';
      rawCode = rawCode.replace(/^```html\n/, ''); 
      rawCode = rawCode.replace(/\n```$/, '');

      return rawCode.trim();

    });

    // STEP 4: Save everything to the database
    await step.run("4-save-to-database", async () => {
      if (!generatedCode) {
        throw new Error("Code generation failed, received empty response from AI.");
      }
      await saveWebsiteData(siteId, userId, finalSiteData, generatedCode);
    });

    return { message: "Website generated and saved successfully!", siteId };
  }
);