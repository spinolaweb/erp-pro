#!/usr/bin/env python3
import os, subprocess

BASE = os.getcwd()

def read(path):
    with open(os.path.join(BASE, path), 'r') as f:
        return f.read()

def write(path, content):
    with open(os.path.join(BASE, path), 'w') as f:
        f.write(content)

print("Fixing API_URL export in src/utils/constants.js...")

c = read("src/utils/constants.js")

# Add API_URL export at the top if not present
if "API_URL" not in c:
    c = 'export const API_URL = import.meta.env.VITE_API_URL || \'\';\n\n' + c
    write("src/utils/constants.js", c)
    print("✅ Added API_URL export")
else:
    print("⏭️  API_URL already exists")

subprocess.run(["git", "add", "src/utils/constants.js"], check=True)
subprocess.run(["git", "commit", "-m", "fix: add API_URL export to constants.js"], check=True)
subprocess.run(["git", "push", "origin", "main"], check=True)

print("✅ Pushed fix")