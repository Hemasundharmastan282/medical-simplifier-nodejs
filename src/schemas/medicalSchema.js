// const { z } = require('zod');

// // Schema for Step 2: Normalized Tests JSON
// const NormalizedTestSchema = z.object({
//   name: z.string().describe("Standardized name of the medical test (e.g., 'Hemoglobin', 'White Blood Cell Count')."),
//   value: z.number().describe("The numerical result value."),
//   unit: z.string().describe("The standardized unit of measurement (e.g., 'g/dL', '/uL')."),
//   status: z.enum(["low", "high", "normal"]).describe("The result status."),
//   ref_range: z.object({
//     low: z.number(),
//     high: z.number(),
//   }).describe("The standardized reference range for this test."),
// });

// const NormalizationOutputSchema = z.object({
//   tests: z.array(NormalizedTestSchema),
//   normalization_confidence: z.number().min(0).max(1).describe("The system's confidence in the extraction and normalization."),
// });

// // Schema for Step 3: Patient-Friendly Summary
// const SummaryOutputSchema = z.object({
//     summary: z.string().describe("A single, concise sentence summarizing all abnormal findings."),
//     explanations: z.array(z.string()).describe("A list of simple, non-diagnostic explanations for each abnormal finding."),
// });

// module.exports = { NormalizationOutputSchema, SummaryOutputSchema };

// src/schemas/medicalSchema.js (Updated with Coercion)
import { z } from 'zod';

// Schema for Step 2: Normalized Tests JSON
const NormalizedTestSchema = z.object({
    name: z.string().describe("Standardized name of the medical test."),
    // FIX: Use z.coerce.number() to automatically convert '4.10' (string) to 4.10 (number)
    value: z.coerce.number().describe("The numerical result value."),
    unit: z.string().describe("The standardized unit of measurement."),
    // FIX: Make status and ref_range UNAMBIGUOUS in the schema
    status: z.enum(["low", "high", "normal"]).describe("The result status (MUST be one of these three exact strings)."),
    ref_range: z.object({
        low: z.coerce.number(),
        high: z.coerce.number(),
    }).describe("The standardized reference range (MUST contain low and high keys with numerical values)."),
});

const NormalizationOutputSchema = z.object({
    tests: z.array(NormalizedTestSchema),
    // FIX: Add coercion here just in case, and make the field optional/nullable
    normalization_confidence: z.coerce.number().min(0).max(1).default(0.95).optional(), 
});

// ... (SummaryOutputSchema remains the same)
const SummaryOutputSchema = z.object({
    summary: z.string().describe("A single, concise sentence summarizing all abnormal findings."),
    explanations: z.array(z.string()).describe("A list of simple, non-diagnostic explanations for each abnormal finding."),
});

export { NormalizationOutputSchema, SummaryOutputSchema };