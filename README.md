Medical Report Simplifier (Node.js/Express)
An AI-powered backend service designed to streamline the analysis of raw medical lab reports. This application uses the Groq API for high-speed AI processing (Normalization and Summarization).

 The Problem
Raw medical lab reports are complex and difficult for patients to understand.

 The Solution
This application creates a robust, multi-step pipeline to transform complex medical data into concise, understandable feedback.

 Key Features
Feature

Description

Technology

High-Speed Normalization

Extracts test names, values, units, and status (high/low/normal) from raw text, enforcing a strict JSON array structure.

Groq AI (LLaMA/Mixtral)

Contextual Summarization

Generates a single, patient-friendly sentence summarizing abnormal findings and provides simple, non-diagnostic explanations.

Groq AI

API Endpoints

Provides two routes for flexible input handling via Express.

Express.js

Robust Validation

Uses Zod schema coercion and validation to ensure the LLM's output meets all structural requirements.

Zod

 Project Structure
Your project is structured for clear separation of concerns:

medical-simplifier-nodejs/
├── src/
│   ├── data/                 # Static data (e.g., refRanges.json)
│   ├── schemas/              # Zod schemas (medicalSchema.js) for structured output
│   └── services/             # Core logic (Normalization, NLP, OCR Mock)
├── .env                      # Stores API keys (Ignored by Git)
├── index.js                  # Main Express server and API routes
└── package.json              # Project dependencies and metadata

🛠️ Setup & Installation
1. Prerequisites
Ensure you have a recent version of Node.js installed and possess a Groq API Key.

2. Installation Steps
Clone the repository and install the dependencies:

git clone YOUR_REPOSITORY_URL
cd medical-simplifier-nodejs
npm install

3. Configure Your API Key
Create a file named .env in the project root and add your credentials.

# .env

# Groq API Key (The primary credential)
GROQ_API_KEY="sk-gsk_YOUR_ACTUAL_SECRET_KEY_HERE"

# (Optional: Included to satisfy legacy checks in some SDKs)
OPENAI_API_KEY="sk-gsk_YOUR_ACTUAL_SECRET_KEY_HERE" 

 Running the API
Start the Express server:

npm start

The server will be running at http://localhost:3000.

 API Usage (Postman Examples)
Use Postman to interact with the API. All endpoints accept POST requests and require a JSON body.

Endpoint 1: Summarize Raw Text
This is the primary endpoint for testing with custom text.

URL: POST http://localhost:3000/api/summarize-text

Use Case: Send raw text input.

Example Body (JSON):

{
    "rawText": "Glucose 135 mg/dL, Hemoglobin 11.5 g/dL, Cholesterol 240 mg/dL."
}

Default Case: If you send an empty body ({}) or None, the API uses the text from the internal OCR mock to run the pipeline.

Endpoint 2: Summarize Image (Mocked)
This endpoint simulates the full image-to-text pipeline.

URL: POST http://localhost:3000/api/summarize-image

Use Case: Send the path of the image to be processed by the mock OCR.

Example Body (JSON):

{
    "imagePath": "src/data/lab_report_q3_2024.png" 
}

 License
This project is licensed under the MIT License.
