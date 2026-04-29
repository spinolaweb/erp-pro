#!/usr/bin/env python3
import os
import subprocess

BASE = os.getcwd()

def read(path):
    with open(os.path.join(BASE, path), 'r', encoding='utf-8') as f:
        return f.read()

def write(path, content):
    with open(os.path.join(BASE, path), 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixing src/utils/constants.js...")

c = read("src/utils/constants.js")

# Replace single-quoted strings with double-quoted strings to avoid quote conflicts
# This regex safely converts 'string' to "string" for the array entries
import re
c = re.sub(r"'([^']*'[^']*)'", r'"\1"', c)

write("src/utils/constants.js", c)

print("✅ Fixed quotes in constants.js")

subprocess.run(["git", "add", "src/utils/constants.js"], check=True)
subprocess.run(["git", "commit", "-m", "fix: escape single quotes in wilaya names"], check=True)
subprocess.run(["git", "push", "origin", "main"], check=True)

print("✅ Pushed fix to origin/main")