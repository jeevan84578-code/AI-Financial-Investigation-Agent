from fastapi import APIRouter

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("")
def get_dashboard() -> dict:
    """Return the dashboard DTO used by the command center."""
    return {
        "period": "Q2 2025",
        "updated_at": "2025-06-30T09:42:00Z",
        "kpis": [
            {
                "label": "Open investigations",
                "value": "24",
                "change": "+12.5%",
                "trend": "up",
                "tone": "cyan",
                "icon": "case",
            },
            {
                "label": "At-risk exposure",
                "value": "$2.84M",
                "change": "-8.2%",
                "trend": "down",
                "tone": "amber",
                "icon": "exposure",
            },
            {
                "label": "High-risk vendors",
                "value": "08",
                "change": "+2",
                "trend": "up",
                "tone": "red",
                "icon": "vendor",
            },
            {
                "label": "Recovered this quarter",
                "value": "$486K",
                "change": "+24.8%",
                "trend": "up",
                "tone": "green",
                "icon": "recovered",
            },
        ],
        "exposure_series": [
            {"month": "Jan", "exposure": 1.9, "investigations": 11},
            {"month": "Feb", "exposure": 2.2, "investigations": 14},
            {"month": "Mar", "exposure": 2.0, "investigations": 13},
            {"month": "Apr", "exposure": 2.7, "investigations": 19},
            {"month": "May", "exposure": 2.4, "investigations": 17},
            {"month": "Jun", "exposure": 2.84, "investigations": 24},
        ],
        "vendor_heatmap": [
            {"name": "Apex Logistics", "category": "Logistics", "score": 84, "exposure": "$420K"},
            {"name": "Northstar Supplies", "category": "Materials", "score": 68, "exposure": "$286K"},
            {"name": "Vertex Consulting", "category": "Professional services", "score": 52, "exposure": "$174K"},
            {"name": "Bluebird Media", "category": "Marketing", "score": 41, "exposure": "$98K"},
            {"name": "Cobalt Systems", "category": "Technology", "score": 77, "exposure": "$312K"},
            {"name": "Greenline Energy", "category": "Utilities", "score": 29, "exposure": "$86K"},
        ],
        "cases": [
            {
                "id": "INV-2048",
                "title": "Duplicate invoices across regional entities",
                "vendor": "Apex Logistics",
                "risk": 84,
                "status": "Investigating",
                "time": "12 min ago",
            },
            {
                "id": "INV-2045",
                "title": "Unusual payment velocity detected",
                "vendor": "Cobalt Systems",
                "risk": 77,
                "status": "Review",
                "time": "38 min ago",
            },
            {
                "id": "INV-2041",
                "title": "Vendor bank account changed before payout",
                "vendor": "Northstar Supplies",
                "risk": 68,
                "status": "Open",
                "time": "1 hr ago",
            },
        ],
        "cfo_summary": {
            "headline": "Exposure is concentrated in 3 vendors",
            "body": "Your high-risk vendor exposure is down 8.2% this quarter. Two investigations need executive review before the next payment run.",
            "actions": 2,
            "confidence": 94,
        },
    }

