from google import genai
from google.genai import types
from schemas import AnalysisResult
import os
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self, model_name: str = "gemini-2.5-flash-lite"):
        self.client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        self.model_name = model_name

    async def analyze_logs(self, logs: str, domain: str) -> AnalysisResult:
        prompt = f"""
You are an expert DevOps SRE. Analyze the following {domain} logs and return a STRICT JSON response matching the exact schema provided.
Focus on evidence-based reasoning. If logs are insufficient, clearly state it in investigation_gaps.
Do NOT include markdown formatting. Return ONLY raw JSON.

Logs:
{logs}
"""
        response = await self.client.aio.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                response_mime_type="application/json",
                response_schema=AnalysisResult,  # Pass the Pydantic class directly
            ),
        )

        return AnalysisResult.model_validate_json(response.text)