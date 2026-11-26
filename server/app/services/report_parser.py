"""Deterministic laboratory marker extraction and report export helpers."""

import re
from typing import Any, Dict, List, Optional, Tuple


# Matches common lab report rows such as:
# "Hemoglobin   13.2   g/dL   13.5 - 17.5" or "Glucose: 112 mg/dL (70 - 99)"
LAB_LINE_RE = re.compile(
    r"^(?P<name>[A-Za-z][A-Za-z0-9\s/().,%-]{2,45}?)\s*[:\-]?\s+"
    r"(?P<value>\d+(?:\.\d+)?)\s*"
    r"(?P<unit>[A-Za-z/%^0-9.*µuL-]+)?\s+"
    r"(?:\(?\s*(?:ref(?:erence)?(?:\s*range)?\s*[:\-]?\s*)?"
    r"(?P<low>\d+(?:\.\d+)?)\s*[-–to]+\s*(?P<high>\d+(?:\.\d+)?)\s*\)?)?$",
    re.IGNORECASE,
)


def _classify_status(value_str: str, low_str: Optional[str], high_str: Optional[str]) -> str:
    if low_str is None or high_str is None:
        return "unknown"
    try:
        val = float(value_str)
        low = float(low_str)
        high = float(high_str)
        if val < low:
            return "low"
        if val > high:
            return "high"
        return "normal"
    except ValueError:
        return "unknown"


def parse_lab_markers_from_text(text: str) -> List[Dict[str, Any]]:
    """
    Extract laboratory markers strictly from text lines present in the uploaded report.
    Never invents reference ranges or measured values.
    """
    if not text:
        return []

    markers: List[Dict[str, Any]] = []
    seen_names = set()

    for raw_line in text.splitlines():
        line = " ".join(raw_line.strip().split())
        if len(line) < 6 or line.startswith("--- Page"):
            continue
        match = LAB_LINE_RE.match(line)
        if not match:
            continue

        name = match.group("name").strip(" :-\t")
        # Skip obvious header or date lines
        if any(skip in name.lower() for skip in ("page", "date", "phone", "dob", "age", "id", "zip")):
            continue

        value = match.group("value")
        unit = (match.group("unit") or "").strip()
        low = match.group("low")
        high = match.group("high")

        if low is not None and high is not None:
            ref_range = f"{low} - {high}" + (f" {unit}" if unit else "")
        else:
            ref_range = "Not specified in report"

        status = _classify_status(value, low, high)
        key = name.lower()
        if key in seen_names:
            continue
        seen_names.add(key)

        markers.append(
            {
                "name": name,
                "value": value,
                "unit": unit,
                "reference_range": ref_range,
                "status": status,
                "explanation": "Parsed directly from uploaded report text.",
            }
        )

    return markers[:40]


def format_summary_for_download(
    filename: str,
    created_at: str,
    summary_data: Dict[str, Any],
) -> Tuple[str, str]:
    """Generate a clean Markdown summary document for user download."""
    lines = [
        f"# Medical Report Summary: {filename}",
        f"Generated: {created_at}",
        "",
        "## Important Medical Disclaimer",
        summary_data.get("disclaimer", ""),
        "",
        "## Plain-Language Summary",
        summary_data.get("plain_summary", ""),
        "",
    ]

    markers = summary_data.get("lab_markers", [])
    if markers:
        lines.append("## Extracted Laboratory Markers")
        lines.append("| Marker | Value | Unit | Reference Range | Status |")
        lines.append("| --- | --- | --- | --- | --- |")
        for m in markers:
            lines.append(
                f"| {m.get('name', '')} | {m.get('value', '')} | {m.get('unit', '')} | "
                f"{m.get('reference_range', 'Not specified in report')} | {str(m.get('status', 'unknown')).upper()} |"
            )
        lines.append("")

    terms = summary_data.get("medical_terms", [])
    if terms:
        lines.append("## Medical Terms Explained")
        for t in terms:
            lines.append(f"- **{t.get('term', '')}**: {t.get('simple_explanation', '')}")
        lines.append("")

    questions = summary_data.get("questions_for_doctor", [])
    if questions:
        lines.append("## Suggested Questions for Your Doctor")
        for q in questions:
            lines.append(f"- {q}")
        lines.append("")

    warnings = summary_data.get("warnings", [])
    if warnings:
        lines.append("## Notes & Cautions")
        for w in warnings:
            lines.append(f"- {w}")
        lines.append("")

    content = "\n".join(lines)
    safe_stem = re.sub(r"[^A-Za-z0-9._-]+", "_", filename.rsplit(".", 1)[0])
    download_name = f"{safe_stem}_summary.md"
    return download_name, content
