"""Simple parser for maintainer issue markdown to JSON"""

import sys
import json
import re
from datetime import datetime
from pathlib import Path

try:
    import jsonschema
    HAS_JSONSCHEMA = True
except ImportError:
    HAS_JSONSCHEMA = False


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
    # Mixed case variants
    "Github": "GitHub",
    "Gitlab": "GitLab",
    "Linkedin": "LinkedIn",
    "Bluesky": "Bluesky",
    "Bitbucket": "BitBucket",
    # Common aliases
    "Website": "Web",
    "website": "Web",
    "Blog": "Web",
    "blog": "Web",
    "Mail": "Email",
    "mail": "Email",
    "X/Twitter": "X",
    "Twitter/X": "X",
}

# Valid labels as per schema
VALID_LABELS = {
    "GitHub", "GitLab", "Gitlab", "Codeberg", "BitBucket", "LinkedIn",
    "X", "Twitter", "Mastodon", "Bluesky", "Substack",
    "Discourse", "Email", "RSS", "Web"
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
    """Validate data against schema. Returns list of errors."""
    if not HAS_JSONSCHEMA:
        return []
    
    errors = []
    validator = jsonschema.Draft7Validator(schema, format_checker=jsonschema.FormatChecker())
    for error in validator.iter_errors(data):
        path = ".".join(str(p) for p in error.absolute_path) if error.absolute_path else "(root)"
        errors.append(f"  {path}: {error.message}")
    return errors

def parse_issue(md):
    # Remove HTML comments
    md = re.sub(r'<!--.*?-->', '', md, flags=re.DOTALL)
    
    data = {
        "username": "",
        "full_name": "",
        "photo": "",
        "designation": "",
        "socials": [],
        "projects": [],
        "form": [],
        "created_on": datetime.today().isoformat(),
    }
    
    # Parse basic fields (username, full_name, photo, designation)
    for field in ['username', 'full_name', 'photo', 'designation']:
        pattern = rf'\*\*{field}:\*\*\s*(.+?)(?=\n\*\*|\n---|\Z)'
        match = re.search(pattern, md, re.IGNORECASE | re.DOTALL)
        if match:
            data[field] = match.group(1).strip()
    
    # Parse socials
    socials_match = re.search(r'\*\*socials:\*\*\s*\n((?:^- .+\n?)+)', md, re.MULTILINE)
    if socials_match:
        for line in socials_match.group(1).strip().split('\n'):
            if ':' in line:
                line = line.lstrip('- ').strip()
                label, link = line.split(':', 1)
                # Normalize the label to match schema requirements
                normalized_label = normalize_label(label.strip())
                if normalized_label not in VALID_LABELS:
                    print(f"Warning: Unknown or invalid social label '{label.strip()}' (normalized: '{normalized_label}')", file=sys.stderr)
                data['socials'].append({
                    "label": normalized_label,
                    "link": link.strip()
                })
    
    # Parse projects
    project_blocks = re.findall(
        r'\*\*project:\*\*\s*\n((?:^- .+(?:\n(?:    .+)?)*\n?)+)',
        md,
        re.MULTILINE
    )
    
    for block in project_blocks:
        project = {
            "name": "",
            "project_link": "",
            "website_link": "",
            "logo": "",
            "short_description": "",
            "description": ""
        }
        
        for field in project.keys():
            # Match both single line and multi-line (with 4-space indent)
            pattern = rf'^- {field}:\s*(.+?)(?=\n- |\Z)'
            match = re.search(pattern, block, re.MULTILINE | re.DOTALL)
            if match:
                value = match.group(1).strip()
                # Clean up multi-line descriptions (remove leading spaces)
                value = re.sub(r'\n\s{4}', '\n', value)
                project[field] = value.strip()
        
        if project['name']:
            data['projects'].append(project)
    
    # Parse questions section
    questions_section = re.search(r'## Questions(.+)', md, re.DOTALL)
    if questions_section:
        question_blocks = re.findall(
            r'\*\*(.+?):\*\*\s*\n(.+?)(?=\n\*\*|\Z)',
            questions_section.group(1),
            re.DOTALL
        )
        
        for question, response in question_blocks:
            data['form'].append({
                "question": question.strip(),
                "response": response.replace("\n", "<br>").strip()
            })
    
    return data


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python parse_maintainer.py <input_file.md> [--validate]")
        print("Options:")
        print("  --validate    Validate output against JSON schema")
        sys.exit(1)
    
    args = sys.argv[1:]
    validate_mode = "--validate" in args
    if validate_mode:
        args.remove("--validate")
    
    input_file = args[0]
    
    with open(input_file, 'r', encoding='utf-8') as f:
        result = parse_issue(f.read())
    
    # Output JSON
    json_output = json.dumps(result, indent=2, ensure_ascii=False)
    print(json_output)
    
    # Write to file
    username = result.get('username', 'output') or 'output'
    output_file = f"{username}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(json_output)
        f.write("\n")
    
    print(f"\nSaved to {output_file}", file=sys.stderr)
    
    # Validate against schema if requested
    if validate_mode:
        schema = load_schema()
        if schema is None:
            print("Schema file not found, skipping validation", file=sys.stderr)
        elif not HAS_JSONSCHEMA:
            print("jsonschema not installed, skipping validation", file=sys.stderr)
            print("Install with: pip install jsonschema", file=sys.stderr)
        else:
            errors = validate_data(result, schema)
            if errors:
                print(f"\nValidation failed:", file=sys.stderr)
                for error in errors:
                    print(error, file=sys.stderr)
                sys.exit(1)
            else:
                print("Validation passed", file=sys.stderr)
