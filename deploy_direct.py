#!/usr/bin/env python3
"""Direct upload to Cloudflare Pages - multipart form with files."""
import hashlib, json, os, requests

EMAIL = "giuseppepetrini38@gmail.com"
API_KEY = "2d4ec410142b3f842520a9de1154d8ab4bef0"
ACCOUNT = "33c80b67edba9d6a0df22e1d28ba5fa2"
PROJECT = "demo-portale-italia"
BUILD_DIR = "/home/ubuntu/portale-italia-src/dist/public"

BASE = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/pages/projects/{PROJECT}/deployments"

# Build manifest
manifest = {}
files = {}
for root, dirs, fnames in os.walk(BUILD_DIR):
    for f in fnames:
        full = os.path.join(root, f)
        rel = "/" + os.path.relpath(full, BUILD_DIR)
        with open(full, "rb") as fh:
            data = fh.read()
        h = hashlib.sha256(data).hexdigest()
        manifest[rel] = h
        files[h] = (rel, data)

print(f"Files: {len(files)}")

# Prepare multipart: manifest as JSON field + file payloads
manifest_json = json.dumps(manifest)

# Build multipart form parts
parts = []
# Add manifest
parts.append(("manifest", (None, manifest_json, "application/json")))

# Add each file as a separate form field
for h, (rel, data) in files.items():
    fname = rel.lstrip("/").replace("/", "_")
    parts.append(("files", (fname, data, "application/octet-stream")))

print("Uploading deployment...")
resp = requests.post(BASE, 
    headers={"X-Auth-Email": EMAIL, "X-Auth-Key": API_KEY},
    files=parts,
    timeout=120
)

result = resp.json()
print(f"Status: {resp.status_code}")
print(f"Success: {result.get('success')}")

if result.get("success"):
    r = result.get("result", {})
    print(f"Deployment ID: {r.get('id')}")
    print(f"URL: {r.get('url')}")
    stages = r.get("stages", [])
    for s in stages:
        print(f"  Stage: {s.get('name')} -> {s.get('status')}")
else:
    print(f"Errors: {json.dumps(result.get('errors'), indent=2)}")
