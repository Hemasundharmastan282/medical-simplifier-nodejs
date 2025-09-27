// // src/services/normalizationService.js (Final and Working Code)

// import OpenAI from "openai";
// import { NormalizationOutputSchema } from '../schemas/medicalSchema.js'; 
// import fs from 'fs'; 
// import path from 'path'; 
// import { fileURLToPath } from 'url'; 
// import { zodToJsonSchema } from 'zod-to-json-schema'; 

// // --- JSON File Loading ---
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename); 
// const refRangesPath = path.resolve(__dirname, '../data/refRanges.json');
// const refRanges = JSON.parse(fs.readFileSync(refRangesPath, 'utf-8'));

// // --- CLIENT SETUP (Lazy Init) ---
// let openaiClient; 

// function getOpenAIClient() {
//     if (!openaiClient) {
//         if (!process.env.GROQ_API_KEY) {
//             throw new Error("GROQ_API_KEY is missing. Environment variables must be set.");
//         }
//         openaiClient = new OpenAI({
//             apiKey: process.env.GROQ_API_KEY, 
//             baseURL: "https://api.groq.com/openai/v1",
//         });
//     }
//     return openaiClient;
// }

// const MODEL_NAME = process.env.GROQ_NORMALIZATION_MODEL || 'llama-3.3-70b-versatile'; 

// async function normalizeTests(rawText) {
//     const openai = getOpenAIClient();
    
//     // 1. Build the list of reference ranges
//     const rangeList = Object.entries(refRanges)
//         .map(([name, range]) => `${name}: ${range.low}-${range.high} ${range.unit}`)
//         .join('\n');

//     // 2. Define instructions and prompt
//     const systemInstruction = `
//         You are a medical data processor. Fix typos, extract, and standardize test results from the raw text below using the provided reference ranges.
        
//         Known Reference Ranges:
//         ${rangeList}
        
//         Constraints: Output must be a valid JSON object strictly following the structure with a top-level property named 'tests'.
//     `;
    
//     const userPrompt = `Raw Text to process: "${rawText}"`;

//     // 3. Generate the required JSON Schema object
//     const schemaForAPI = zodToJsonSchema(NormalizationOutputSchema, 'NormalizationOutputSchema');

//     try {
//         const response = await openai.chat.completions.create({
//             model: MODEL_NAME, 
//             messages: [
//                 // 🔑 CRITICAL FIX: The messages array must contain at least one item
//                 { role: 'system', content: systemInstruction },
//                 { role: 'user', content: userPrompt }
//             ],
//             response_format: { 
//                 type: "json_object", 
//                 schema: schemaForAPI 
//             },
//             temperature: 0.0,
//         });

//         const jsonString = response.choices?.[0]?.message?.content?.trim();
//         if (!jsonString) {
//              throw new Error("Groq API returned empty content.");
//         }
//         const parsedJson = JSON.parse(jsonString);
        
//         const validated = NormalizationOutputSchema.safeParse(parsedJson);

//         if (!validated.success) {
//             console.error("LLM output validation failed:", validated.error);
//             return { status: "error", reason: "AI failed to structure data correctly." };
//         }

//         return validated.data; 

//     } catch (error) {
//         // Output the full error to help debug any new API issues
//         console.error("Groq Normalization Service Error:", error); 
//         return { status: "error", reason: "AI service failure during normalization." };
//     }
// }

// export { normalizeTests };


// src/services/normalizationService.js (Final Working ESM Code)

import OpenAI from "openai";
import { NormalizationOutputSchema } from '../schemas/medicalSchema.js'; 
import fs from 'fs'; 
import path from 'path'; 
import { fileURLToPath } from 'url'; 
import { zodToJsonSchema } from 'zod-to-json-schema';

// --- JSON File Loading (Robust ESM Method) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 
const refRangesPath = path.resolve(__dirname, '../data/refRanges.json');
const refRanges = JSON.parse(fs.readFileSync(refRangesPath, 'utf-8'));


// --- CLIENT SETUP (Lazy Initialization to fix ESM timing errors) ---
let openaiClient; 

function getOpenAIClient() {
    if (!openaiClient) {
        if (!process.env.GROQ_API_KEY) {
            throw new Error("GROQ_API_KEY is missing. Environment variables must be set.");
        }
        
        openaiClient = new OpenAI({
            apiKey: process.env.GROQ_API_KEY, 
            baseURL: "https://api.groq.com/openai/v1",
        });
    }
    return openaiClient;
}

const MODEL_NAME = process.env.GROQ_NORMALIZATION_MODEL || 'llama-3.3-70b-versatile'; 

async function normalizeTests(rawText) {
    const openai = getOpenAIClient();
    
    // 1. Build the list of reference ranges for the prompt
    const rangeList = Object.entries(refRanges)
        .map(([name, range]) => `${name}: ${range.low}-${range.high} ${range.unit}`)
        .join('\n');

    // 2. Define instructions and prompt (with strong array constraints)
const systemInstruction = `
    You are an expert medical data processor. Extract and standardize test results from the raw text using the provided reference ranges.
    
    Known Reference Ranges:
    ${rangeList}
    
    Constraints: 
    1. Output MUST be a valid JSON object.
    2. The 'tests' property MUST contain a JSON ARRAY (a list starting with '[').
    3. For every test extracted, you MUST provide the 'name', the numerical 'value', the 'unit', the 'status' (from 'low', 'high', 'normal'), AND the 'ref_range' object.
    4. The 'value', 'low', and 'high' fields MUST contain numbers, NOT strings in quotes (e.g., use 4.10, not "4.10").
    5. Do NOT include any descriptive text.
`;
    
    const userPrompt = `Raw Text to process: "${rawText}"`;

    // 3. Generate the required JSON Schema object using the installed helper
    const schemaForAPI = zodToJsonSchema(NormalizationOutputSchema, 'NormalizationOutputSchema');

    try {
        const response = await openai.chat.completions.create({
            model: MODEL_NAME, 
            messages: [
                // CRITICAL FIX: Array must contain the system and user messages
                { role: 'system', content: systemInstruction },
                { role: 'user', content: userPrompt }
            ],
            response_format: { 
                type: "json_object", 
                schema: schemaForAPI // Uses the correctly generated schema
            },
            temperature: 0.0, // Low temp for extraction task
        });

        const jsonString = response.choices?.[0]?.message?.content?.trim();
        if (!jsonString) {
             throw new Error("Groq API returned empty content.");
        }
        const parsedJson = JSON.parse(jsonString);
        
        // Validation using Zod
        const validated = NormalizationOutputSchema.safeParse(parsedJson);

        if (!validated.success) {
            console.error("LLM output validation failed:", validated.error);
            return { status: "error", reason: "AI failed to structure data correctly." };
        }

        return validated.data; 

    } catch (error) {
        // Log the full error to help debug any new API issues
        console.error("Groq Normalization Service Error:", error); 
        return { status: "error", reason: "AI service failure during normalization." };
    }
}

export { normalizeTests };