#!/usr/bin/env python3
"""
Validate maintainer JSON files against the schema.

Usage:
    python validate_maintainers.py [--fix] [file.json ...]
    
Options:
    --fix    Auto-fix common issues (case sensitivity, known aliases)
    
If no files are provided, validates all JSON files in content/maintainers/
"""

import json
import sys
from pathlib import Path

try:
    import jsonschema
except ImportError as e:
    sys.exit(f"Error: jsonschema not installed. Run: pip install jsonschema. Error: {e}")


# Mapping of incorrect/variant labels to correct ones
LABEL_FIXES = {
    # Case sensitivity fixes
    "github": "GitHub",
    "Github": "GitHub",
    "gitlab": "GitLab",
    "linkedin": "LinkedIn",
    "Linkedin": "LinkedIn",
    "bluesky": "BlueSky",
    "bitbucket": "BitBucket",
    "mastodon": "Mastodon",
    "substack": "Substack",
    "codeberg": "Codeberg",
    "discourse": "Discourse",
    "email": "Email",
    "rss": "RSS",
    "web": "Web",
    # Common aliases
    "Website": "Web",
    "website": "Web",
    "Blog": "Web",
    "blog": "Web",
    "X/Twitter": "X",
    "Twitter/X": "X",
}

# Mapping of incorrect project field names to correct ones
PROJECT_FIELD_FIXES = {
    "Website_link": "website_link",
    "Project_link": "project_link",
    "Description": "description",
    "Short_description": "short_description",
    "Name": "name",
    "Logo": "logo",
}


def load_schema():
    schema_path = Path(__file__).parent / "maintainer.schema.json"
    with open(schema_path, encoding="utf-8") as f:
        return json.load(f)


def auto_fix_data(data: dict) -> tuple[dict, list[str]]:
    """Auto-fix common issues in maintainer data. Returns (fixed_data, list of fixes made)."""
    fixes = []
    
    # Fix social labels
    if "socials" in data:
        for i, social in enumerate(data["socials"]):
            if "label" in social and social["label"] in LABEL_FIXES:
                old_label = social["label"]
                new_label = LABEL_FIXES[old_label]
                social["label"] = new_label
                fixes.append(f"  socials[{i}].label: '{old_label}' → '{new_label}'")
    
    # Fix project field names
    if "projects" in data:
        for i, project in enumerate(data["projects"]):
            for old_field, new_field in PROJECT_FIELD_FIXES.items():
                if old_field in project:
                    project[new_field] = project.pop(old_field)
                    fixes.append(f"  projects[{i}]: '{old_field}' → '{new_field}'")
    
    return data, fixes


def validate_file(file_path: Path, schema: dict) -> list[str]:
    """Validate a single JSON file against the schema. Returns list of errors."""
    errors = []
    try:
        with open(file_path, encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        return [f"Invalid JSON: {e}"]
    
    validator = jsonschema.Draft7Validator(schema, format_checker=jsonschema.FormatChecker())
    for error in validator.iter_errors(data):
        path = ".".join(str(p) for p in error.absolute_path) if error.absolute_path else "(root)"
        errors.append(f"  {path}: {error.message}")
    
    return errors


def fix_and_validate_file(file_path: Path, schema: dict) -> tuple[list[str], list[str]]:
    """Auto-fix and validate a file. Returns (fixes_made, remaining_errors)."""
    try:
        with open(file_path, encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        return [], [f"Invalid JSON: {e}"]
    
    # Apply auto-fixes
    data, fixes = auto_fix_data(data)
    
    # Save if fixes were made
    if fixes:
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write("\n")  # Add trailing newline
    
    # Validate the (potentially fixed) data
    errors = []
    validator = jsonschema.Draft7Validator(schema, format_checker=jsonschema.FormatChecker())
    for error in validator.iter_errors(data):
        path = ".".join(str(p) for p in error.absolute_path) if error.absolute_path else "(root)"
        errors.append(f"  {path}: {error.message}")
    
    return fixes, errors


def main():
    schema = load_schema()
    
    # Parse arguments
    args = sys.argv[1:]
    fix_mode = "--fix" in args
    if fix_mode:
        args.remove("--fix")
    
    if args:
        files = [Path(f) for f in args]
    else:
        maintainers_dir = Path(__file__).parent / "content" / "maintainers"
        files = list(maintainers_dir.glob("*.json"))
    
    if not files:
        print("No JSON files found to validate.")
        sys.exit(0)
    
    total_errors = 0
    total_fixes = 0
    
    for file_path in files:
        if fix_mode:
            fixes, errors = fix_and_validate_file(file_path, schema)
            if fixes:
                print(f"🔧 {file_path.name} (auto-fixed):")
                for fix in fixes:
                    print(fix)
                total_fixes += len(fixes)
            if errors:
                print(f"❌ {file_path.name}:")
                for error in errors:
                    print(error)
                total_errors += len(errors)
            elif not fixes:
                print(f"✓ {file_path.name}")
        else:
            errors = validate_file(file_path, schema)
            if errors:
                print(f"❌ {file_path.name}:")
                for error in errors:
                    print(error)
                total_errors += len(errors)
            else:
                print(f"✓ {file_path.name}")
    
    print()
    if total_fixes > 0:
        print(f"Auto-fixed {total_fixes} issue(s).")
    if total_errors > 0:
        print(f"Validation failed with {total_errors} error(s).")
        sys.exit(1)
    else:
        print(f"All {len(files)} file(s) validated successfully.")
        sys.exit(0)


if __name__ == "__main__":
    main()
