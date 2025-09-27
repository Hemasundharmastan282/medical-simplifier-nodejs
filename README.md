#  Medical Report Simplifier (Node.js/Express)

An **AI-powered backend service** designed to streamline the analysis of raw medical lab reports. This application simplifies complex data into patient-friendly summaries using high-speed Large Language Models (LLMs).

##  The Problem

Raw medical lab reports are often complex, filled with specialized terminology, abbreviations, and reference ranges, making them difficult for patients to understand without a healthcare professional.

##  The Solution

This application creates a three-step pipeline to transform raw text into concise, understandable feedback using the Groq API's speed and reliability for structured data tasks.

##  Key Features

| Feature | Description | Technology | 
| :--- | :--- | :--- | 
| **High-Speed Normalization** | Extracts test names, values, units, and status (high/low/normal) from raw text, enforcing a strict JSON structure via Zod schemas. | Groq AI (LLaMA/Mixtral) | 
| **Contextual Summarization** | Generates a single, patient-friendly sentence summarizing abnormal findings and provides simple, non-diagnostic explanations. | Groq AI | 
| **API Endpoints** | Provides two API routes (`/summarize-text` and `/summarize-image`) for flexible input handling via Express. | Express.js | 
| **Robust Validation** | Uses **Zod** schema coercion and validation to ensure the LLM's output meets all structural requirements before processing. | Zod | 
| **Secure Setup** | Configures the service using ES Modules (E SM) and secures credentials via `.env` file and `.gitignore`. | Node.js, `dotenv` | 

##  Project Structure

Your project is structured for clear separation of concerns:
medical-simplifier-nodejs/
├── src/
│   ├── data/                 # Stores static data (e.g., refRanges.json)
│   ├── schemas/              # Zod schemas (medicalSchema.js) for structured output
│   └── services/             # Core business logic (Normalization, NLP, OCR Mock)
├── .env                      # Stores API keys (ignored by Git)
├── .gitignore                # Ensures .env and node_modules are never committed
├── index.js                  # Main Express server and API route definitions
├── package.json              # Project dependencies and metadata
└── README.md                 # This file
##  Setup & Installation

### 1. Prerequisites

Ensure you have a recent version of **Node.js** installed and possess a **Groq API Key**.

### 2. Clone the Repository

git clone YOUR_REPOSITORY_URL
cd medical-simplifier-nodejs


### 3. Install Dependencies

Install all necessary packages, including `express`, `openai` (used for Groq), and `zod`.

npm install


### 4. Configure Your API Key

Create a file named `.env` in the root directory of your project and add your Groq key.

.env
Groq API Key (The primary credential)
GROQ_API_KEY="sk-gsk_YOUR_ACTUAL_SECRET_KEY_HERE"

(Optional: Included to satisfy legacy checks in some SDKs)
OPENAI_API_KEY="sk-gsk_YOUR_ACTUAL_SECRET_KEY_HERE"

Models used for structured tasks
GROQ_NORMALIZATION_MODEL=mixtral-8x7b-32768
GROQ_SUMMARY_MODEL=mixtral-8x7b-32768


##  Running the API

Start the Express server:

npm start


The server will be running at `http://localhost:3000`.

##  API Usage (Postman Examples)

All endpoints accept `POST` requests. Set the body type to **raw** and the format to **JSON (application/json)**.

### Endpoint 1: Summarize Raw Text

**URL:** `POST http://localhost:3000/api/summarize-text`

| Input Mode | Body | Description | 
| :--- | :--- | :--- | 
| **Custom Text** | `{"rawText": "Glucose 135 mg/dL, Cholesterol 240 mg/dL."}` | Processes the provided string through the pipeline. | 
| **Default Mock** | **None** or `{}` | Uses the hardcoded text from the internal OCR mock. |

### Endpoint 2: Summarize Image (Mocked)

**URL:** `POST http://localhost:3000/api/summarize-image`

| Input Mode | Body | Description | 
| :--- | :--- | :--- | 
| **Image Path** | `{"imagePath": "src/data/lab_report_q3_2024.png"}` | Simulates the full workflow by passing the path to the OCR mock. |

##  License

This project is licensed under the MIT License.
