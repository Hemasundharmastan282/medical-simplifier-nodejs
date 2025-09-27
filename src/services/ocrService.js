// src/services/ocrService.js
const fs = require('fs');

async function extractText(fileBuffer, fileMimeType, textInput) {
    if (textInput) {
        // Handle text input directly
        return { text: textInput, confidence: 1.0 };
    }

    if (fileBuffer) {
        // --- OCR Simulation for the Sample Image Input ---
        console.log("Simulating OCR on image/scan...");
        
        // This text simulates the common errors from a basic OCR engine (Hemglobin, Hgh)
        const rawOcrText = "CBC: Hemglobin 10.2 g/dL (Low)\nWBC 11200 /uL (Hgh)";
        
        return { text: rawOcrText, confidence: 0.80 };
    }
    
    return { text: null, confidence: 0.0 };
}

module.exports = { extractText };