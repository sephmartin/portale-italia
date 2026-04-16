#!/usr/bin/env python3
"""Deploy to Cloudflare Pages via Direct Upload API."""
import hashlib, json, os, sys, requests

EMAIL = "giuseppepetrini38@gmail.com"
API_KEY = "2d4ec410142b3f842520a9de1154d8ab4bef0"
ACCOUNT = "33c80b67edba9d6a0df22e1d28ba5fa2"
PROJECT = "demo-portale-italia"
BUILD_DIR = "/home/ubuntu/portale-italia-src/dist/public"

BASE = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/pages/projects/{PROJECT}"
HEADERS = {
    "X-Auth-Email": EMAIL,
    "X-Auth-Key": API_KEY,
}

def file_hash(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()

# 1. Build manifest
print("1. Building manifest...")
manifest = {}
files_to_upload = {}
for root, dirs, files in os.walk(BUILD_DIR):
    for f in files:
        full = os.path.join(root, f)
        rel = "/" + os.path.relpath(full, BUILD_DIR)
        h = file_hash(full)
        manifest[rel] = h
        files_to_upload[h] = full

print(f"   {len(manifest)} files")

# 2. Create deployment
print("2. Creating deployment...")
resp = requests.post(
    f"{BASE}/deployments",
    headers=HEADERS,
    json={"manifest": manifest}
)
data = resp.json()

if not data.get("success"):
    print(f"   ERROR: {data.get('errors')}")
    # Try to extract upload URL from error
    print(json.dumps(data, indent=2)[:500])
    sys.exit(1)

result = data.get("result", {})
upload_url = result.get("upload_url")
deployment_id = result.get("id")
print(f"   Deployment: {deployment_id}")
print(f"   Upload URL: {upload_url[:80]}...")

# 3. Upload missing files
print("3. Checking which files to upload...")
# The response might tell us which hashes are needed
# Check for "missing" field
missing = result.get("missing_hashes", [])
if not missing:
    # Try alternate field names
    missing_map = result.get("missing", [])
    if missing_map:
        missing = missing_map if isinstance(missing_map, list) else list(missing_map.keys())

if not missing:
    # Upload all files to the upload URL
    print("   Uploading all files...")
    for i, (h, path) in enumerate(files_to_upload.items()):
        with open(path, "rb") as f:
            r = requests.put(
                f"{upload_url}/{h}",
                data=f.read(),
                headers={"Content-Type": "application/octet-stream"}
            )
        if r.status_code not in (200, 201):
            print(f"   FAIL {h[:12]}: {r.status_code}")
        if (i + 1) % 20 == 0:
            print(f"   Uploaded {i+1}/{len(files_to_upload)}...")
else:
    print(f"   Uploading {len(missing)} missing files...")
    for i, h in enumerate(missing):
        if h not in files_to_upload:
            print(f"   WARN: hash {h[:12]} not found locally")
            continue
        with open(files_to_upload[h], "rb") as f:
            r = requests.put(
                f"{upload_url}/{h}",
                data=f.read(),
                headers={"Content-Type": "application/octet-stream"}
            )
        if r.status_code not in (200, 201):
            print(f"   FAIL {h[:12]}: {r.status_code}")

print(f"4. Done! Deployment ID: {deployment_id}")
print(f"   URL: https://{PROJECT}.pages.dev")
