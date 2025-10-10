"""
Script to parse maintainers data for Forklore PR
Intended for both Maintainer who want to self-contribute or simple anyone to help out!
"""

import sys
import re
import json
from html import escape

def is_image(url):
    return any(url.lower().endswith(ext) for ext in ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'])

def format_response(value: str) -> str:
    value = value.strip()

    # Convert Markdown image syntax ![alt](url)
    value = re.sub(
        r'!\[([^\]]*)\]\((https?://[^\)]+)\)',
        r'<img src="\2" alt="\1" />',
        value
    )

    # Convert Markdown link syntax [text](url)
    value = re.sub(
        r'\[([^\]]+)\]\((https?://[^\)]+)\)',
        r'<a href="\2">\1</a>',
        value
    )

    # skip existing tags to avoid breaking valid HTML
    # this regex will ignore any URL already inside an HTML tag
    def convert_url(match):
        url = match.group(0)
        # Only convert if not part of existing <a> or <img> tag
        if is_image(url):
            return f'<img src="{url}" alt="image" />'
        return f'<a href="{url}">{url}</a>'

    # Find raw URLs that are NOT already part of a Markdown or HTML link
    value = re.sub(
        r'(?<!["\'=\(\]>])\bhttps?://[^\s<>()"\']+',  # negative lookbehind to avoid href/src attributes
        convert_url,
        value
    )

    # Convert newlines to <br>
    value = value.replace('\n', '<br>')

    return value


def parse_multiline_field(lines, start_index):
    """Extract multiline field starting at start_index + 1 until next field or section."""
    value_lines = []
    i = start_index + 1
    while i < len(lines):
        line = lines[i]
        if line.startswith("**") and line.endswith("**"):  # Next field label
            break
        if line.startswith("### ") or line.startswith("## "):  # Next section heading
            break
        value_lines.append(line)
        i += 1
    return " ".join(value_lines).strip(), i


def parse_issue(markdown: str):
    # Remove all comments (<!-- ... -->)
    markdown = re.sub(r'<!--.*?-->', '', markdown, flags=re.DOTALL)

    lines = [line.strip() for line in markdown.strip().splitlines()]
    lines = [line for line in lines if line != '']  # remove empty lines

    data = {
        "username": "",
        "full_name": "",
        "photo": "",
        "designation": "",
        "socials": [],
        "projects": [],
        "form": []
    }

    # State machine parsing
    current_section = None
    current_project = {}
    project_fields = ["Name", "Project Link", "Website Link", "Logo URL", "Short Description", "Full Description"]
    form_questions = []

    i = 0
    while i < len(lines):
        line = lines[i]

        # ==== USER DETAILS ====
        if line.startswith("**Username:**"):
            data["username"] = lines[i + 1].strip()
            i += 2
            continue

        if line.startswith("**Full Name:**"):
            data["full_name"] = lines[i + 1].strip()
            i += 2
            continue

        if line.startswith("**Photo URL:**"):
            data["photo"] = lines[i + 1].strip()
            i += 2
            continue

        if line.startswith("**Designation / Role:**"):
            data["designation"] = lines[i + 1].strip()
            i += 2
            continue

        if line.startswith("**Social Profiles:**"):
            i += 1
            while i < len(lines) and ':' in lines[i]:
                label_link = lines[i].split(":", 1)
                if len(label_link) == 2:
                    label, link = label_link[0].strip(), label_link[1].strip()
                    data["socials"].append({"label": label, "link": link})
                i += 1
            continue

        # ==== PROJECTS ====
        if line.startswith("### Project"):
            if current_project:
                data["projects"].append(current_project)
                current_project = {}
            i += 1
            continue

        if any(line.startswith(f"**{field}:**") for field in project_fields):
            field = re.match(r"\*\*(.*?):\*\*", line).group(1).strip()
            value, i = parse_multiline_field(lines, i)
            current_project[field] = value
            continue

        # ==== FORM QUESTIONS ====
        question_match = re.match(r"\*\*(\d+\..*?)\*\*", line)
        if question_match:
            question = question_match.group(1).strip()
            # Capture all lines under this until we hit another bold or end
            i += 1
            response_lines = []
            while i < len(lines) and not lines[i].startswith("**"):
                response_lines.append(lines[i])
                i += 1
            response_text = "\n".join(response_lines).strip()
            formatted_response = format_response(response_text)
            form_questions.append({
                "question": re.sub(r"^\d+\.\s*", "", question),
                "response": formatted_response
            })
            continue

        i += 1

    # Append last project
    if current_project:
        # Rename keys to match JSON spec
        project_json = {
            "name": current_project.get("Name", ""),
            "project_link": current_project.get("Project Link", ""),
            "website_link": current_project.get("Website Link", ""),
            "logo": current_project.get("Logo URL", ""),
            "description": format_response(current_project.get("Full Description", "")),
            "short_description": current_project.get("Short Description", "")
        }
        data["projects"].append(project_json)

    # Append form Q&A
    data["form"] = form_questions

    return data


if __name__ == "__main__":

    if len(sys.argv) < 2:
        print("Usage: python parse_issue.py <input_file.md>")
        sys.exit(1)

    input_file = sys.argv[1]

    with open(input_file, "r", encoding="utf-8") as f:
        md = f.read()
        result = parse_issue(md)

    json_output = json.dumps(result, indent=2, ensure_ascii=False)
    print(json_output)

    # Use username from result
    file_username = result.get("username", "output") or "output"
    output_file = f"{file_username}.json"
    with open(output_file, "w", encoding="utf-8") as f_out:
        f_out.write(json_output)
    print(f"Output written to {output_file}")
