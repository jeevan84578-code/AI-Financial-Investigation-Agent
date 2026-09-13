import json
import os
import re
from typing import Any

import httpx
from pydantic import BaseModel, Field

from app.db.models import Investigation


class GeneratedReport(BaseModel):
    executive_narrative: str = Field(min_length=1)
    risk_assessment: str = Field(min_length=1)
    key_evidence: list[str] = Field(min_length=1)
    business_impact: str = Field(min_length=1)
    recommendations: list[str] = Field(min_length=1)
    confidence_score: float = Field(ge=0, le=100)


class AiReportError(RuntimeError):
    pass


OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


async def generate_report(investigation: Investigation) -> GeneratedReport:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise AiReportError("OPENROUTER_API_KEY is not configured.")

    model = os.getenv("OPENROUTER_MODEL", "qwen/qwen-2.5-72b-instruct")
    prompt = _build_prompt(investigation)
    payload = {
        "model": model,
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are Helios FI, an evidence-grounded financial risk investigator. "
                    "Use only the supplied investigation data. Never invent transactions, vendors, "
                    "or evidence. Return only valid JSON matching the requested schema."
                ),
            },
            {"role": "user", "content": prompt},
        ],
    }

    try:
        async with httpx.AsyncClient(timeout=45) as client:
            response = await client.post(
                OPENROUTER_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": os.getenv("OPENROUTER_SITE_URL", "http://localhost:5173"),
                    "X-Title": "Helios FI",
                },
                json=payload,
            )
            response.raise_for_status()
            body = response.json()
            content = body["choices"][0]["message"]["content"]
    except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError) as error:
        raise AiReportError("OpenRouter did not return a usable report.") from error

    try:
        parsed: Any = json.loads(_strip_code_fence(content))
        return GeneratedReport.model_validate(parsed)
    except (json.JSONDecodeError, TypeError, ValueError) as error:
        raise AiReportError("The AI response did not match the report schema.") from error


def _build_prompt(investigation: Investigation) -> str:
    concentration = [
        finding for finding in investigation.findings_json if finding.get("type") == "concentration"
    ]
    return json.dumps(
        {
            "task": "Generate an investigation report with the exact JSON fields requested.",
            "required_fields": {
                "executive_narrative": "A concise CFO-ready narrative.",
                "risk_assessment": "Explain the risk score and primary drivers.",
                "key_evidence": "An array of 2-5 evidence statements grounded in findings.",
                "business_impact": "Explain plausible financial and operational impact without inventing amounts.",
                "recommendations": "An array of 3-5 specific, prioritized actions.",
                "confidence_score": "A number from 0 to 100 reflecting evidence confidence.",
            },
            "investigation": {
                "risk_score": investigation.risk_score,
                "filename": investigation.filename,
                "transaction_count": investigation.transaction_count,
                "vendor_count": investigation.vendor_count,
                "total_amount": investigation.total_amount,
                "findings": investigation.findings_json,
                "timeline": investigation.timeline_json,
                "vendor_concentration_findings": concentration,
            },
        },
        indent=2,
    )


def _strip_code_fence(content: str) -> str:
    return re.sub(r"^```(?:json)?\s*|\s*```$", "", content.strip(), flags=re.IGNORECASE)
