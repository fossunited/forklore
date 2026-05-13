#!/usr/bin/env python3
"""GitHub issue form submission → maintainer JSON"""

import json, os, re, subprocess, sys
from datetime import datetime
from pathlib import Path

QUESTIONS = [
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
    "github": "GitHub", "Github": "GitHub", "gitlab": "GitLab", "Gitlab": "GitLab",
    "codeberg": "Codeberg", "bitbucket": "BitBucket", "linkedin": "LinkedIn",
    "Linkedin": "LinkedIn", "mastodon": "Mastodon", "bluesky": "Bluesky",
    "substack": "Substack", "twitter": "Twitter", "rss": "RSS",
    "web": "Web", "website": "Web", "blog": "Web", "reddit": "Reddit",
    "medium": "Medium", "youtube": "Youtube", "YouTube": "Youtube", "email": "Email",
}

PROJ_FIELDS = ("name", "project_link", "website_link", "logo", "short_description", "description")


def sections(md):
    parts = re.split(r"^### (.+)$", md, flags=re.MULTILINE)
    return {parts[i].strip(): parts[i+1].strip() for i in range(1, len(parts), 2) if i+1 < len(parts)}


def parse_socials(text):
    result = []
    for line in text.splitlines():
        line = line.lstrip("- ").strip()
        if ":" in line and not line.startswith("#"):
            label, _, link = line.partition(":")
            if link := link.strip():
                result.append({"label": LABEL_MAP.get(label.strip(), label.strip()), "link": link})
    return result


def parse_projects(text):
    projects = []
    for block in re.findall(r"project:\s*\n((?:^- .+\n?)+)", text, re.MULTILINE):
        proj = {f: "" for f in PROJ_FIELDS}
        for line in block.splitlines():
            if line.startswith("- "):
                key, _, val = line[2:].partition(":")
                if key.strip() in proj:
                    proj[key.strip()] = val.strip()
        if proj["name"]:
            projects.append(proj)
    return projects


def parse(md):
    s = sections(md)
    return {
        "username": s.get("GitHub Username", ""),
        "full_name": s.get("Full Name", ""),
        "photo": s.get("Photo URL", ""),
        "designation": s.get("Designation / Role", ""),
        "socials": parse_socials(s.get("Socials", "")),
        "projects": parse_projects(s.get("Projects", "")),
        "form": [{"question": q, "response": s.get(q, "")} for q in QUESTIONS],
        "created_on": datetime.now().astimezone().isoformat(),
    }


if __name__ == "__main__":
    if os.getenv("CI") == "true":
        sys.exit(0)
    if len(sys.argv) < 2:
        print("Usage: python parse-maintainer.py <input.md>")
        sys.exit(1)

    result = parse(Path(sys.argv[1]).read_text(encoding="utf-8"))
    username = result["username"] or "output"
    out = f"content/maintainers/{username}.json"
    Path(out).write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2, ensure_ascii=False))

    try:
        subprocess.run(["check-jsonschema", "--schemafile", "maintainer.schema.json", out], check=True)
        print(f"✓ saved to {out}", file=sys.stderr)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("[WARN] schema validation skipped or failed", file=sys.stderr)

    try:
        subprocess.run(["python3", "sync-image.py", f"{username}.json"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"[WARN] image sync failed: {e}", file=sys.stderr)
