// src/services/nlpService.js (FINAL, WORKING ESM CODE)

import OpenAI from "openai";
import { SummaryOutputSchema } from '../schemas/medicalSchema.js'; 
import { zodToJsonSchema } from 'zod-to-json-schema'; // Import the schema helper

// --- CLIENT SETUP (Lazy Init) ---
// Note: We use GROQ_SUMMARY_MODE in the environment variable check, 
// but it should probably be GROQ_SUMMARY_MODEL for consistency.
const MODEL_NAME = process.env.GROQ_SUMMARY_MODEL || 'llama-3.3-70b-versatile'; // <-- Corrected variable name access

let openaiClient;

function getOpenAIClient() {
    if (!openaiClient) {
        if (!process.env.GROQ_API_KEY) {
             throw new Error("GROQ_API_KEY not found. Ensure .env is loaded.");
        }
        openaiClient = new OpenAI({
            apiKey: process.env.GROQ_API_KEY, 
            baseURL: "https://api.groq.com/openai/v1",
        });
    }
    return openaiClient;
}


async function generateSummary(normalizedData) {
    const openai = getOpenAIClient(); // Initialize client
    
    const abnormalTests = normalizedData.tests.filter(t => t.status !== 'normal');
    
    if (abnormalTests.length === 0) {
        return { summary: "All results are within the normal reference range.", explanations: [] };
    }
    
    const summaryList = abnormalTests
        .map(t => `${t.name} (${t.value} ${t.unit}) is ${t.status}. Reference Range: ${t.ref_range.low} to ${t.ref_range.high} ${t.unit}`)
        .join('\n');

    const systemInstruction = `
        You are an AI-powered medical report simplifier for a patient.
        Analyze the following abnormal test results. Do NOT perform diagnosis, suggest treatment, or give medical advice.
        
        Abnormal Test Results:
        ${summaryList}
        
        Your task is to provide a patient-friendly summary:
        1. 'summary': A single, concise sentence summarizing all abnormal findings.
        2. 'explanations': A list of simple, common, non-diagnostic reasons for each abnormal result.
        
        Constraints: Output must be a valid JSON object following the structure exactly.
    `;
    
    const userPrompt = `Generate the patient summary based on the list above.`;

    // Generate the required JSON Schema using the helper library
    const schemaForAPI = zodToJsonSchema(SummaryOutputSchema, 'SummaryOutputSchema');


    try {
        const response = await openai.chat.completions.create({
            // 🔑 FIX 1: Use the dynamic MODEL_NAME variable for the API call
            model: MODEL_NAME, 
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: userPrompt }
            ],
            response_format: { 
                type: "json_object", 
                // 🔑 FIX 2: Use the correctly generated schema object
                schema: schemaForAPI, 
            }, 
            temperature: 0.1,
        });

        const jsonString = response.choices?.[0]?.message?.content?.trim();
        if (!jsonString) {
            throw new Error("Groq API returned empty content.");
        }
        return JSON.parse(jsonString);

    } catch (error) {
        // Log the full error object for better debugging
        console.error("Groq Summary Error:", error); 
        return { status: "error", reason: "AI summary generation failed." };
    }
}

function checkHallucination(normalizedData, summaryData) {
    // Uses the .tests array for checking
    const testNames = new Set(normalizedData.tests.map(t => t.name.toLowerCase().trim()));
    const summaryText = (summaryData.summary + ' ' + summaryData.explanations.join(' ')).toLowerCase();

    const potentialHallucinationKeywords = ['platelets', 'creatinine', 'glucose', 'cholesterol']; 
    
    for (const keyword of potentialHallucinationKeywords) {
        if (summaryText.includes(keyword) && !testNames.has(keyword)) {
            console.warn(`Guardrail triggered: Hallucinated test '${keyword}' detected in summary.`);
            return true; 
        }
    }
    
    return false; 
}

export { generateSummary, checkHallucination };