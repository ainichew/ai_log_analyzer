import re
from typing import Tuple

def preprocess_logs(logs: str, max_chars: int = 45000) -> str:
    """Clean, deduplicate, and chunk logs while preserving context & errors."""
    lines = logs.splitlines()
    if len(lines) < 50:
        return logs
    
    error_lines = []
    context_start = 15000
    context_end = -15000
    error_pattern = re.compile(r"\b(ERROR|FATAL|CRITICAL|EXCEPTION|PANIC)\b", re.IGNORECASE)
    
    for i, line in enumerate(lines):
        if error_pattern.search(line):
            # Capture 10 lines before & after errors
            start_idx = max(0, i - 10)
            end_idx = min(len(lines), i + 11)
            error_lines.extend(lines[start_idx:end_idx])
            
    unique = list(dict.fromkeys(error_lines))  # Deduplicate while preserving order
    head = lines[:500]
    tail = lines[-500:]
    
    combined = "\n".join(head + unique + tail)
    return combined[:max_chars]