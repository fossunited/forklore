"""Simple parser for maintainer issue markdown to JSON"""

import sys
import json
import re
from datetime import datetime
from pathlib import Path

import os

if os.getenv("CI") == "true":
    sys.exit(0)

try:
    import jsonschema

    HAS_JSONSCHEMA = True
except ImportError:
    HAS_JSONSCHEMA = False


# Exact questions that must appear in the form (in order)
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

# Mapping of user input labels to schema-valid labels
LABEL_NORMALIZATION = {
    # Lowercase variants
    "github": "GitHub",
    "gitlab": "GitLab",
    "codeberg": "Codeberg",
    "bitbucket": "BitBucket",
    "linkedin": "LinkedIn",
    "mastodon": "Mastodon",
    "bluesky": "Bluesky",
    "substack": "Substack",
    "discourse": "Discourse",
    "twitter": "Twitter",
    "email": "Email",
    "rss": "RSS",
    "web": "Web",
    "x": "X",
    "reddit": "Reddit",
    # Mixed case variants
    "Github": "GitHub",
    "Gitlab": "GitLab",
    "Linkedin": "LinkedIn",
    "Bluesky": "Bluesky",
    "Bitbucket": "BitBucket",
    "Reddit": "Reddit",
    # Common aliases
    "website": "Website",
    "web": "Web",
    "Blog": "Web",
    "blog": "Web",
    "Mail": "Email",
    "mail": "Email",
    "X/Twitter": "X",
    "Twitter/X": "X",
    "YouTube": "Youtube"
}

# Valid labels as per schema
VALID_LABELS = {
    "GitHub", "GitLab", "Gitlab", "Codeberg", "BitBucket", "LinkedIn",
    "X", "Twitter", "Mastodon", "Bluesky", "Substack",
    "Discourse", "Email", "RSS", "Web", "Reddit", "Youtube"
}


def normalize_label(label: str) -> str:
    """Normalize a social media label to match schema requirements."""
    label = label.strip()

    # Check if already valid
    if label in VALID_LABELS:
        return label

    # Try normalization map
    if label in LABEL_NORMALIZATION:
        return LABEL_NORMALIZATION[label]

    # Return as-is (will fail validation, but user will see error)
    return label


def load_schema():
    """Load the JSON schema for validation."""
    schema_path = Path(__file__).parent / "maintainer.schema.json"
    if not schema_path.exists():
        return None
    with open(schema_path, encoding="utf-8") as f:
        return json.load(f)


def validate_data(data: dict, schema: dict) -> list[str]:
    """Validate data against schema. Returns list of friendly error messages."""
    if not HAS_JSONSCHEMA:
        return ["jsonschema library not installed. Install with: pip install jsonschema"]

    errors = []
    validator = jsonschema.Draft7Validator(schema, format_checker=jsonschema.FormatChecker())

    for error in validator.iter_errors(data):
        path_parts = list(error.absolute_path)

        # Add context for questions
        if len(path_parts) >= 2 and path_parts[0] == "form":
            question_index = path_parts[1]
            try:
                question = data["form"][question_index]["question"]
                errors.append(f"  Question '{question}': {error.message}")
                continue
            except (IndexError, KeyError):
                pass

        # Add context for projects
        if len(path_parts) >= 2 and path_parts[0] == "projects":
            project_index = path_parts[1]
            try:
                project_name = data["projects"][project_index].get("name", f"Project #{project_index + 1}")
                field = path_parts[2] if len(path_parts) >= 3 else ""
                if field:
                    errors.append(f"  Project '{project_name}', field '{field}': {error.message}")
                else:
                    errors.append(f"  Project '{project_name}': {error.message}")
                continue
            except (IndexError, KeyError):
                pass

        # Default format
        path = ".".join(str(p) for p in path_parts) if path_parts else "(root)"
        errors.append(f"  {path}: {error.message}")

    return errors


def normalize_question(question: str) -> str:
    """Normalize question text by removing trailing colons and extra whitespace."""
    question = question.strip()
    if question.endswith(":"):
        question = question[:-1]
    return question


def parse_issue(md):
    """Parse markdown issue into JSON structure."""
    # Remove HTML comments
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

    # Parse basic fields (username, full_name, photo, designation)
    for field in ["username", "full_name", "photo", "designation"]:
        pattern = rf"\*\*{field}:\*\*\s*(.+?)(?=\n\*\*|\n---|\Z)"
        match = re.search(pattern, md, re.IGNORECASE | re.DOTALL)
        if match:
            data[field] = match.group(1).strip()

    # Parse socials
    socials_match = re.search(r"\*\*socials:\*\*\s*\n((?:^- .+\n?)+)", md, re.MULTILINE)
    if socials_match:
        for line in socials_match.group(1).strip().split("\n"):
            if ":" in line:
                line = line.lstrip("- ").strip()
                label, link = line.split(":", 1)
                # Normalize the label to match schema requirements
                normalized_label = normalize_label(label.strip())
                if normalized_label not in VALID_LABELS:
                    print(
                        f"Warning: Unknown or invalid social label '{label.strip()}' (normalized: '{normalized_label}')",
                        file=sys.stderr,
                    )
                data["socials"].append(
                    {"label": normalized_label, "link": link.strip()}
                )

    # Parse projects
    project_blocks = re.findall(
        r"\*\*project:\*\*\s*\n((?:^- .+(?:\n(?:    .+)?)*\n?)+)", md, re.MULTILINE
    )

    for block in project_blocks:
        project = {
            "name": "",
            "project_link": "",
            "website_link": "",
            "logo": "",
            "short_description": "",
            "description": "",
        }

        for field in project.keys():
            # Match both single line and multi-line (with 4-space indent)
            pattern = rf"^- {field}:\s*(.+?)(?=\n- |\Z)"
            match = re.search(pattern, block, re.MULTILINE | re.DOTALL)
            if match:
                value = match.group(1).strip()
                # Clean up multi-line descriptions (remove leading spaces)
                value = re.sub(r"\n\s{4}", "\n", value)
                project[field] = value.strip()

        if project["name"]:
            data["projects"].append(project)

    # Parse questions section
    questions_section = re.search(r"## Questions(.+)", md, re.DOTALL)
    if questions_section:
        question_blocks = re.findall(
            r"\*\*(.+?):\*\*\s*\n(.+?)(?=\n\*\*|\Z)",
            questions_section.group(1),
            re.DOTALL,
        )

        parsed_questions = {}
        for question, response in question_blocks:
            normalized_q = normalize_question(question)
            parsed_questions[normalized_q] = response.rstrip("\n").replace("\n", "<br>")

        # Ensure questions are in the correct order and match exactly
        for required_q in REQUIRED_QUESTIONS:
            if required_q in parsed_questions:
                data["form"].append(
                    {"question": required_q, "response": parsed_questions[required_q]}
                )
            else:
                # Add with empty response if missing
                data["form"].append({"question": required_q, "response": ""})
                print(
                    f"Warning: Missing required question: '{required_q}'",
                    file=sys.stderr,
                )

    return data


def validate_json_file(filepath: str) -> tuple[bool, list[str]]:
    """Validate a JSON file against the schema."""
    schema = load_schema()
    if schema is None:
        return False, ["Schema file 'maintainer.schema.json' not found"]

    if not HAS_JSONSCHEMA:
        return False, [
            "jsonschema library not installed. Install with: pip install jsonschema"
        ]

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        return False, [f"Invalid JSON: {e}"]
    except FileNotFoundError:
        return False, [f"File not found: {filepath}"]

    errors = validate_data(data, schema)
    return len(errors) == 0, errors


if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] == "--help":
        print("Usage: python parse_maintainer.py <input_file.md>")
        print(
            "       python parse_maintainer.py --validate <file1.json> [file2.json ...]"
        )
        print("")
        print("Options:")
        print(
            "  --validate    Validate JSON files against schema (for pre-commit hooks)"
        )
        sys.exit(1)

    # Check if we're in validation-only mode
    if sys.argv[1] == "--validate":
        if len(sys.argv) < 3:
            print("Error: --validate requires at least one JSON file", file=sys.stderr)
            sys.exit(1)

        json_files = sys.argv[2:]
        all_valid = True

        for json_file in json_files:
            print(f"Validating {json_file}...", file=sys.stderr)
            is_valid, errors = validate_json_file(json_file)

            if is_valid:
                print(f"✓ {json_file} is valid", file=sys.stderr)
            else:
                print(f"✗ {json_file} validation failed:", file=sys.stderr)
                for error in errors:
                    print(error, file=sys.stderr)
                all_valid = False

        sys.exit(0 if all_valid else 1)

    # Parse mode
    input_file = sys.argv[1]

    with open(input_file, "r", encoding="utf-8") as f:
        result = parse_issue(f.read())

    # Validate before saving
    schema = load_schema()
    if schema is None:
        print("Warning: Schema file not found, skipping validation", file=sys.stderr)
    elif not HAS_JSONSCHEMA:
        print("Warning: jsonschema not installed, skipping validation", file=sys.stderr)
        print("Install with: pip install jsonschema", file=sys.stderr)
    else:
        errors = validate_data(result, schema)
        if errors:
            print(f"\n❌ Validation failed - JSON not saved:", file=sys.stderr)
            for error in errors:
                print(error, file=sys.stderr)
            print(
                "\nPlease fix the errors in your markdown and try again.",
                file=sys.stderr,
            )
            sys.exit(1)

    # Output JSON to stdout
    json_output = json.dumps(result, indent=2, ensure_ascii=False)
    print(json_output)

    # Write to file
    username = result.get("username", "output") or "output"
    output_file = f"content/maintainers/{username}.json"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(json_output)
        f.write("\n")

    print(f"\n✓ Validation passed - Saved to {output_file}", file=sys.stderr)

    # sync images to local public dir
    import subprocess
    import os

    json_filename = os.path.basename(output_file)
    try:
        subprocess.run(["python3", "sync-image.py", json_filename], check=True)
    except subprocess.CalledProcessError as e:
        print(f"[WARN] Image sync failed: {e}", file=sys.stderr)
