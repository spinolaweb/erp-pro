#!/usr/bin/env python3
import os, re, subprocess

BASE = os.getcwd()

def read(path):
    with open(os.path.join(BASE, path), 'r') as f:
        return f.read()

def write(path, content):
    with open(os.path.join(BASE, path), 'w') as f:
        f.write(content)

changed = False

# Fix root tailwind.config.js
if os.path.exists('tailwind.config.js'):
    t = read('tailwind.config.js')
    if './**/*.ts' in t or './**/*.js' in t:
        t = t.replace('"./**/*.ts"', '"./src/**/*.{js,jsx,ts,tsx}"')
        t = t.replace("'./**/*.ts'", '"./src/**/*.{js,jsx,ts,tsx}"')
        t = t.replace('"./**/*.js"', '"./src/**/*.{js,jsx,ts,tsx}"')
        t = t.replace("'./**/*.js'", '"./src/**/*.{js,jsx,ts,tsx}"')
        write('tailwind.config.js', t)
        print("✅ Fixed tailwind.config.js")
        changed = True

# Fix src/tailwind.config.js
if os.path.exists('src/tailwind.config.js'):
    t = read('src/tailwind.config.js')
    if './**/*.ts' in t or './**/*.js' in t:
        t = t.replace('"./**/*.ts"', '"./src/**/*.{js,jsx,ts,tsx}"')
        t = t.replace("'./**/*.ts'", '"./src/**/*.{js,jsx,ts,tsx}"')
        t = t.replace('"./**/*.js"', '"./src/**/*.{js,jsx,ts,tsx}"')
        t = t.replace("'./**/*.js'", '"./src/**/*.{js,jsx,ts,tsx}"')
        write('src/tailwind.config.js', t)
        print("✅ Fixed src/tailwind.config.js")
        changed = True

if changed:
    subprocess.run(["git", "add", "."], check=True)
    subprocess.run(["git", "commit", "-m", "fix: narrow tailwind content pattern"], check=True)
    subprocess.run(["git", "push", "origin", "main"], check=True)
    print("✅ Pushed fix")
else:
    print("⏭️  No tailwind fix needed")