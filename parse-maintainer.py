#!/usr/bin/env python3

"""Convert maintainer issue markdown to JSON"""

import os
import sys
import json
import re
import subprocess
from datetime import datetime
from pathlib import Path

REQUIRED_QUESTIONS = [
    "How to support",
    "A small brief about your project",
    "One FOSS maintainer lesson for your younger self",
    "Why do you do it? Why do you bother maintaining a FOSS project?",
    "If your repo had a theme song, what would it be?",
    "Which file in your project would you most like to set on fire?",
    "What's your open-source villain origin story?",
    "If you had to use one emoji to convey what it is like to be a FOSS maintainer, what would it be?",
]

LABEL_MAP = {
    "github": "GitHub",
    "Github": "GitHub",
    "gitlab": "GitLab",
    "Gitlab": "GitLab",
    "codeberg": "Codeberg",
    "bitbucket": "BitBucket",
    "Bitbucket": "BitBucket",
    "linkedin": "LinkedIn",
    "Linkedin": "LinkedIn",
    "mastodon": "Mastodon",
    "bluesky": "Bluesky",
    "substack": "Substack",
    "discourse": "Discourse",
    "twitter": "Twitter",
    "email": "Email",
    "mail": "Email",
    "Mail": "Email",
    "rss": "RSS",
    "web": "Web",
    "website": "Web",
    "Website": "Web",
    "blog": "Web",
    "Blog": "Web",
    "x": "X",
    "X/Twitter": "X",
    "Twitter/X": "X",
    "reddit": "Reddit",
    "medium": "Medium",
    "youtube": "Youtube",
    "YouTube": "Youtube",
}


def parse_issue(md):
    md = re.sub(r"<!--.*?-->", "", md, flags=re.DOTALL)

    data = {
        "username": "",
        "full_name": "",
        "photo": "",
        "designation": "",
        "socials": [],
        "projects": [],
        "form": [],
        "created_on": datetime.now().astimezone().isoformat(),
    }

    for field in ["username", "full_name", "photo", "designation"]:
        m = re.search(
            rf"\*\*{field}:\*\*\s*(.+?)(?=\n\*\*|\n---|\Z)",
            md,
            re.IGNORECASE | re.DOTALL,
        )
        if m:
            data[field] = m.group(1).strip()

    socials_m = re.search(r"\*\*socials:\*\*\s*\n((?:^- .+\n?)+)", md, re.MULTILINE)
    if socials_m:
        for line in socials_m.group(1).strip().split("\n"):
            if ":" in line:
                line = line.lstrip("- ").strip()
                label, link = line.split(":", 1)
                label = label.strip()
                normalized = LABEL_MAP.get(label, label)
                data["socials"].append({"label": normalized, "link": link.strip()})

    for block in re.findall(
        r"\*\*project:\*\*\s*\n((?:^- .+(?:\n(?:    .+)?)*\n?)+)", md, re.MULTILINE
    ):
        project = {
            "name": "",
            "project_link": "",
            "website_link": "",
            "logo": "",
            "short_description": "",
            "description": "",
        }
        for field in project:
            m = re.search(
                rf"^- {field}:\s*(.+?)(?=\n- |\Z)", block, re.MULTILINE | re.DOTALL
            )
            if m:
                value = re.sub(r"\n\s{4}", "\n", m.group(1).strip())
                project[field] = value.strip()
        if project["name"]:
            data["projects"].append(project)

    questions_m = re.search(r"## Questions(.+)", md, re.DOTALL)
    if questions_m:
        parsed = {}
        for q, r in re.findall(
            r"\*\*(.+?):\*\*\s*\n(.+?)(?=\n\*\*|\Z)", questions_m.group(1), re.DOTALL
        ):
            parsed[q.strip().rstrip(":")] = r.rstrip("\n").replace("\n", "<br>")
        for req_q in REQUIRED_QUESTIONS:
            if req_q not in parsed:
                print(f"Warning: Missing question: '{req_q}'", file=sys.stderr)
            data["form"].append({"question": req_q, "response": parsed.get(req_q, "")})

    return data


if __name__ == "__main__":
    if os.getenv("CI") == "true":
        sys.exit(0)

    if len(sys.argv) < 2 or sys.argv[1] == "--help":
        print("Usage: python parse-maintainer.py <input.md>")
        sys.exit(1)

    md = Path(sys.argv[1]).read_text(encoding="utf-8")
    result = parse_issue(md)

    username = result.get("username") or "output"
    output_file = f"content/maintainers/{username}.json"
    json_output = json.dumps(result, indent=2, ensure_ascii=False)

    Path(output_file).write_text(json_output + "\n", encoding="utf-8")
    print(json_output)

    try:
        subprocess.run(
            ["check-jsonschema", "--schemafile", "maintainer.schema.json", output_file],
            check=True,
        )
        print(f"✓ Validation passed. Saved to {output_file}", file=sys.stderr)
    except subprocess.CalledProcessError:
        print("✗ Validation failed. Fix errors above and re-run.", file=sys.stderr)
        sys.exit(1)
    except FileNotFoundError:
        print("[WARN] check-jsonschema not found, skipping validation", file=sys.stderr)

    try:
        subprocess.run(["python3", "sync-image.py", f"{username}.json"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"[WARN] Image sync failed: {e}", file=sys.stderr)
