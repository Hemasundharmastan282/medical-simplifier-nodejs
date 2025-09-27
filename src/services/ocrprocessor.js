// src/services/ocrprocessor.js (Updated Mock Logic)

async function processOcr(imagePath) {
    console.log(`\n(MOCK) Simulating OCR for image path: ${imagePath}`);
    
    // Check for the specific test path
    if (imagePath.includes('image_c11b38.png')) {
        // This is the specific mock text for your test image
        return "Test results: RBC 4.10 10^6/uL, Hemoglobin 11.5 g/dL, Glucose 125 mg/dL. LDL 140 mg/dL";
    } 
    
    // Default fallback text (or throw an error if the path isn't recognized)
    if (imagePath.includes('default')) {
        return "Default result text: WBC 8.0, Platelets 250, Cholesterol 200.";
    }

    // If the path isn't recognized, throw an error to simulate OCR failure
    throw new Error(`OCR failed: Image path '${imagePath}' not found in mock data.`);
}

export { processOcr };