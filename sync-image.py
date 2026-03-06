import os
import json
import hashlib
import requests
import argparse
from urllib.parse import urlparse
from pathlib import Path
from mimetypes import guess_extension

# --- Config ---
DATA_DIR = 'content/maintainers/'
CACHE_FILE = '.image-cache.json'
IMAGES_DIR = 'public/images/'

Path(IMAGES_DIR).mkdir(parents=True, exist_ok=True)

# --- CLI Argument Parser ---
parser = argparse.ArgumentParser(description="Sync or check remote images to local. If not present, download it and update json. If exists check the hash if updated.")
parser.add_argument("json_file", nargs="?", help="Specific JSON file to process (inside content/maintainers/)")
parser.add_argument("--sync", action="store_true", help="Check and prompt if any image is out of sync")
parser.add_argument("--debug", action="store_true", help="Show debug logs")
parser.add_argument("--verify-cache", action="store_true", help="Verify existing image cache hashes")

args = parser.parse_args()

class Colors:
    RESET = "\033[0m"
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    CYAN = "\033[96m"

# --- Load image cache ---
if os.path.exists(CACHE_FILE):
    with open(CACHE_FILE, 'r') as f:
        cache = json.load(f)
else:
    cache = {}

# --- Helpers ---
def log(msg):
    if args.debug:
        print(msg)

def get_ext_from_url_or_content_type(url, headers):
    path = urlparse(url).path
    ext = os.path.splitext(path)[-1]
    if ext:
        return ext.split("?")[0]
    
    content_type = headers.get('Content-Type', '')
    if content_type:
        return guess_extension(content_type.split(';')[0]) or '.img'
    
    return '.img'

def get_hash(content):
    return hashlib.sha256(content).hexdigest()

def get_hash_from_file(filepath):
    with open(filepath, 'rb') as f:
        return hashlib.sha256(f.read()).hexdigest()

def download_image(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.content, response.headers
    except Exception as e:
        print(f"[ERROR] Failed to download {url}: {e}")
        return None, None

def process_image(url, filename_base, force_download=False):
    if not url.strip():
        return ""

    cached = cache.get(url)

    for ext_guess in [".png", ".jpg", ".jpeg", ".svg", ".webp"]:
        full_filename = f"{filename_base}{ext_guess}"
        filepath = os.path.join(IMAGES_DIR, full_filename)
        if os.path.exists(filepath):
            local_hash = get_hash_from_file(filepath)
            if cached and cached["hash"] == local_hash:
                log(f"[SKIP] Up-to-date: {full_filename}")
                return full_filename
            elif args.sync:
                print(f"[CHECK] Needs update: {url} -> /images/{full_filename}")
                return full_filename
            else:
                break

    if args.sync and not force_download:
        return ""

    content, headers = download_image(url)
    if not content:
        return ""

    ext = get_ext_from_url_or_content_type(url, headers)
    full_filename = f"{filename_base}{ext}"
    filepath = os.path.join(IMAGES_DIR, full_filename)

    with open(filepath, 'wb') as f:
        f.write(content)

    hash_value = get_hash(content)
    cache[url] = {
        "hash": hash_value,
        "filename": full_filename
    }

    print(f"[UPDATE] Downloaded or replaced: {full_filename}")
    return full_filename

# --- Main File Processor ---
def process_json(file):
    json_path = os.path.join(DATA_DIR, file)
    with open(json_path, 'r', encoding="utf-8") as f:
        try:
            data = json.load(f)
        except Exception as e:
            print(f"[SKIP] Invalid JSON in {file}: {e}")
            return

    base_name = os.path.splitext(file)[0]

    # Photo
    if "photo" in data:
        url = data["photo"]
        if isinstance(url, str) and url.strip():
            if url.startswith("/images/"):
                local_path = os.path.join("public", url.lstrip("/"))
                if os.path.exists(local_path):
                    for original_url, entry in cache.items():
                        if entry["filename"] == os.path.basename(local_path):
                            actual_hash = get_hash_from_file(local_path)
                            if actual_hash != entry["hash"]:
                                print(f"{Colors.YELLOW}[MISMATCH] =====>{Colors.RESET} {url} differs from cache")
                                if args.sync:
                                    print(f"[CHECK] Needs update: {original_url} -> {url}")
                                else:
                                    filename = os.path.splitext(os.path.basename(local_path))[0]
                                    result = process_image(original_url, filename, force_download=True)
                                    data["photo"] = f"/images/{result}" if result else ""
                            break
                else:
                    print(f"[WARN] Local photo missing: {url}")
                    data["photo"] = ""
            else:
                filename = f"{base_name}_photo"
                result = process_image(url, filename)
                data["photo"] = f"/images/{result}" if result else ""
        else:
            data["photo"] = ""

    # Project logos
    for i, project in enumerate(data.get("projects", [])):
        url = project.get("logo", "")
        if isinstance(url, str) and url.strip():
            if url.startswith("/images/"):
                local_path = os.path.join("public", url.lstrip("/"))
                if os.path.exists(local_path):
                    for original_url, entry in cache.items():
                        if entry["filename"] == os.path.basename(local_path):
                            actual_hash = get_hash_from_file(local_path)
                            if actual_hash != entry["hash"]:
                                print(f"{Colors.YELLOW}[MISMATCH] ========>{Colors.RESET} {url} differs from cache")
                                if args.sync:
                                    print(f"[CHECK] Needs update: {original_url} -> {url}")
                                else:
                                    project_name = project.get("name", f"project_{i}")
                                    safe_name = project_name.replace(" ", "_").lower()
                                    filename = f"{base_name}_{safe_name}"
                                    result = process_image(original_url, filename, force_download=True)
                                    project["logo"] = f"/images/{result}" if result else ""
                            break
                else:
                    print(f"[WARN] Local logo missing: {url}")
                    project["logo"] = ""
            else:
                project_name = project.get("name", f"project_{i}")
                safe_name = project_name.replace(" ", "_").lower()
                filename = f"{base_name}_{safe_name}"
                result = process_image(url, filename)
                project["logo"] = f"/images/{result}" if result else ""
        else:
            project["logo"] = ""

    if not args.sync:
        with open(json_path, 'w', encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"[DONE] Updated: {file}")

# --- Verify cache integrity if requested ---
if hasattr(args, "verify_cache") and args.verify_cache:
    print("[INFO] Verifying image hashes from cache...")
    for url, info in cache.items():
        try:
            content, _ = download_image(url)
            if not content:
                print(f"[FAIL] Could not download: {url}")
                continue
            current_hash = get_hash(content)
            if current_hash == info["hash"]:
                print(f"[OK] Match: {url}")
            else:
                print(f"{Colors.YELLOW}[DIFF] ===========>{Colors.RESET} Hash mismatch: {url}")
        except Exception as e:
            print(f"[FAIL] {url}: {e}")
    exit(0)

# --- Process Files ---
if args.json_file:
    if not args.json_file.endswith(".json"):
        print("[ERROR] Please provide a valid .json file")
    else:
        process_json(args.json_file)
else:
    for file in os.listdir(DATA_DIR):
        if file.endswith(".json"):
            process_json(file)

# --- Save cache ---
if not args.sync:
    with open(CACHE_FILE, 'w', encoding="utf-8") as f:
        json.dump(cache, f, indent=2)

print("[OK] Image sync complete.")
