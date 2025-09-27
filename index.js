// // index.js (in the project root, using ESM - Updated for new data structure)

// import 'dotenv/config'; 
// import { normalizeTests } from './src/services/normalizationService.js';
// import { generateSummary, checkHallucination } from './src/services/nlpService.js';
// import { processOcr } from './src/services/ocrprocessor.js'; 

// async function processMedicalReport(imagePath) {
//     console.log(`\n=================================================`);
//     console.log(`Starting medical report processing for: ${imagePath}`);
//     console.log(`=================================================\n`);

//     let rawText;
//     try {
//         // STEP 1: OCR
//         console.log('1. Running OCR on image...');
//         rawText = await processOcr(imagePath); 
//         if (!rawText || rawText.length < 10) {
//             throw new Error("OCR returned no usable text. Check ocrService.js implementation.");
//         }
//         console.log(`   [OCR Success] Extracted Text Snippet: "${rawText.substring(0, 50)}..."`);
//     } catch (error) {
//         console.error('\n--- OCR Failure ---');
//         console.error(`Reason: ${error.message}`);
//         return { status: "error", reason: "Failed to extract text from image." };
//     }

//     let normalizedData;
//     try {
//         // STEP 2: Normalization
//         console.log('\n2. Normalizing and extracting data using Groq...');
//         normalizedData = await normalizeTests(rawText);
        
//         if (normalizedData.status === 'error') {
//              throw new Error(normalizedData.reason);
//         }
//         // Access the new 'tests' property
//         console.log(`   [Normalization Success] Found ${normalizedData.tests.length} test results.`);
        
//     } catch (error) {
//         console.error('\n--- Normalization Failure ---');
//         console.error(`Reason: ${error.message}`);
//         return { status: "error", reason: "Failed to normalize data via AI service." };
//     }

//     let summaryData;
//     try {
//         // STEP 3: Summary (Pass the full normalizedData object to access 'tests')
//         console.log('\n3. Generating patient summary using Groq...');
//         summaryData = await generateSummary(normalizedData); 

//         if (summaryData.status === 'error') {
//             throw new Error(summaryData.reason);
//         }
//         console.log(`   [Summary Success] Overview: "${summaryData.summary}"`);
        
//     } catch (error) {
//         console.error('\n--- Summary Generation Failure ---');
//         console.error(`Reason: ${error.message}`);
//         return { status: "error", reason: "Failed to generate summary via AI service." };
//     }

//     // STEP 4: Guardrail Check (Pass the full normalizedData object)
//     console.log('\n4. Running internal guardrail check...');
//     const isHallucinated = checkHallucination(normalizedData, summaryData);
    
//     // Final Result Compilation
//     const finalOutput = {
//         ...summaryData,
//         guardrail_check: {
//             triggered: isHallucinated,
//             message: isHallucinated 
//                 ? "Warning: Potential hallucination detected. Review summary carefully."
//                 : "Guardrail check passed."
//         },
//         status: "success"
//     };

//     console.log('\n=================================================');
//     console.log('           FINAL REPORT SUMMARY (JSON)           ');
//     console.log('=================================================');
//     console.log(JSON.stringify(finalOutput, null, 2));
//     console.log('=================================================\n');
    
//     return finalOutput;
// }

// // --- EXECUTION BLOCK ---
// const IMAGE_PATH = process.env.EXAMPLE_IMAGE_PATH || './path/to/default/report.png';

// processMedicalReport(IMAGE_PATH)
//     .catch(err => {
//         console.error("\n[FATAL APPLICATION CRASH] Application failed to start:", err.message);
//         process.exit(1);
//     });

// export { processMedicalReport };







// index.js (API Entry Point, using ESM - FINAL WORKING VERSION)

import 'dotenv/config'; 
import express from 'express'; 
import { normalizeTests } from './src/services/normalizationService.js';
import { generateSummary, checkHallucination } from './src/services/nlpService.js';
import { processOcr } from './src/services/ocrprocessor.js'; 

// --- PORT CONFIGURATION ---
const PORT = process.env.PORT || 3000;
const app = express();

// --- Middleware ---
// To parse JSON bodies
app.use(express.json()); 
// To parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));


// ----------------------------------------------------------------------
// --- CORE PROCESSING LOGIC ---
// ----------------------------------------------------------------------
async function processPipeline(rawText) {
    let normalizedData;
    
    // STEP 2: Normalization
    console.log('\n2. Normalizing and extracting data using Groq...');
    normalizedData = await normalizeTests(rawText);
    
    if (normalizedData.status === 'error') {
        throw new Error(`Normalization failed: ${normalizedData.reason}`);
    }
    console.log(`   [Normalization Success] Found ${normalizedData.tests.length} test results.`);

    // STEP 3: Summary
    console.log('\n3. Generating patient summary using Groq...');
    const summaryData = await generateSummary(normalizedData); 

    if (summaryData.status === 'error') {
        throw new Error(`Summary generation failed: ${summaryData.reason}`);
    }
    console.log(`   [Summary Success] Overview: "${summaryData.summary}"`);

    // STEP 4: Guardrail Check
    console.log('\n4. Running internal guardrail check...');
    const isHallucinated = checkHallucination(normalizedData, summaryData);
    
    const finalOutput = {
        ...summaryData,
        guardrail_check: {
            triggered: isHallucinated,
            message: isHallucinated 
                ? "Warning: Potential hallucination detected. Review summary carefully."
                : "Guardrail check passed."
        },
        status: "success"
    };

    return finalOutput;
}


// ----------------------------------------------------------------------
// --- API ENDPOINTS (Postman Input) ---
// ----------------------------------------------------------------------

// Endpoint 1: Accepts RAW TEXT (for testing/default input)
app.post('/api/summarize-text', async (req, res) => {
    // 🔑 CRITICAL FIX: Use optional chaining (?.rawText) to safely access the property.
    let rawText = req.body?.rawText; 
    
    // DEFAULT CASE: If no input is provided (rawText is undefined/null/empty)
    if (!rawText) {
        console.log('No rawText provided in the request. Using default mock pipeline.');
        
        const IMAGE_PATH = process.env.EXAMPLE_IMAGE_PATH || './path/to/default/report.png';
        
        // Use the OCR processor (which is mocked) to get the default text
        try {
            rawText = await processOcr(IMAGE_PATH);
        } catch (ocrError) {
             return res.status(500).json({ status: "error", reason: "Default OCR mock failed to return text." });
        }
        
        if (!rawText || rawText.length < 10) {
            return res.status(500).json({ status: "error", reason: "Default OCR returned unusable text." });
        }
    }
    
    try {
        console.log(`\nProcessing request with ${rawText.length} characters of raw text...`);
        const result = await processPipeline(rawText);

        console.log('\n--- API Request Succeeded ---');
        return res.status(200).json(result);

    } catch (error) {
        // Handle pipeline errors (normalization, summary, etc.)
        console.error('API Error during processing:', error.message);
        return res.status(500).json({ status: "error", reason: error.message || "Internal server error during AI pipeline execution." });
    }
});


// Endpoint 2: Accepts IMAGE PATH (simulating file upload/path)
app.post('/api/summarize-image', async (req, res) => {
    // Safely access imagePath
    const imagePath = req.body?.imagePath;

    if (!imagePath) {
        return res.status(400).json({ status: "error", reason: "Missing 'imagePath' in the request body." });
    }

    try {
        console.log(`\nStarting pipeline for image: ${imagePath}`);
        
        // STEP 1: OCR
        const rawText = await processOcr(imagePath);
        if (!rawText || rawText.length < 10) {
            throw new Error("OCR service returned no usable text.");
        }
        
        const result = await processPipeline(rawText);
        
        console.log('\n--- API Request Succeeded ---');
        return res.status(200).json(result);
    } catch (error) {
        console.error('API Error:', error.message);
        return res.status(500).json({ status: "error", reason: error.message || "Internal server error." });
    }
});


// ----------------------------------------------------------------------
// --- START THE SERVER ---
// ----------------------------------------------------------------------

app.listen(PORT, () => {
    console.log(`\n✅ Server is running on http://localhost:${PORT}`);
    console.log('Endpoints ready:');
    console.log(`   POST /api/summarize-text (Use for raw text input or default run)`);
    console.log(`   POST /api/summarize-image (Use for image path input)`);
});