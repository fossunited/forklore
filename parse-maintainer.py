"""Simple parser for maintainer issue markdown to JSON"""

import sys
import json
import re
from datetime import datetime

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
                data['socials'].append({
                    "label": label.strip(),
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
                "response": response.rstrip("\n").replace("\n", "<br>")
            })
    
    return data


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python parse_maintainer.py <input_file.md>")
        sys.exit(1)
    
    with open(sys.argv[1], 'r', encoding='utf-8') as f:
        result = parse_issue(f.read())
    
    # Output JSON
    json_output = json.dumps(result, indent=2, ensure_ascii=False)
    print(json_output)
    
    # Write to file
    username = result.get('username', 'output') or 'output'
    output_file = f"{username}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(json_output)
    
    print(f"\nSaved to {output_file}", file=sys.stderr)
