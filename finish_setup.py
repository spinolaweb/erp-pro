#!/usr/bin/env python3
import os
import re
import subprocess

BASE = os.getcwd()

def read(path):
    with open(os.path.join(BASE, path), 'r', encoding='utf-8') as f:
        return f.read()

def write(path, content):
    with open(os.path.join(BASE, path), 'w', encoding='utf-8') as f:
        f.write(content)

print("=" * 50)
print("  Finishing Dashboard + EntryForm patches")
print("=" * 50)

# =============================================================================
# 1. PATCH src/pages/Dashboard.jsx
# =============================================================================
dash = read("src/pages/Dashboard.jsx")
changed = False

# 1a. Ensure products state exists
if "const [products, setProducts]" not in dash:
    # Inject after entries state declaration
    dash = dash.replace(
        "const [entries, setEntries] = useState([]);",
        "const [entries, setEntries] = useState([]);\n  const [products, setProducts] = useState([]);"
    )
    print("✅ Dashboard: added products state")
    changed = True
else:
    print("⏭️  Dashboard: products state already exists")

# 1b. Ensure products fetch effect exists
if "fetch(`${API_URL}/api/products`)" not in dash:
    dash = dash.replace(
        "return (",
        "useEffect(() => {\n    fetch(`${API_URL}/api/products`).then(r => r.json()).then(setProducts);\n  }, []);\n\n  return (",
        1
    )
    print("✅ Dashboard: added products fetch effect")
    changed = True
else:
    print("⏭️  Dashboard: products fetch effect already exists")

# 1c. Ensure KPI cards exist
if "Valeur Stock (Actif)" not in dash:
    # Find the KPI grid area - look for the first KPICard or a grid div
    # We'll inject before "### Répartition des Coûts" if it exists
    if "### Répartition des Coûts" in dash:
        kpi_block = '''{/* Inventory KPIs */}
        <KPICard
          title="Valeur Stock (Actif)"
          value={products.reduce((sum, p) => sum + ((parseFloat(p.remaining_stock)||0)*(parseFloat(p.cost_price_dzd)||0)), 0)}
          prefix="DZD"
          type="neutral"
        />
        {products.length > 0 && (() => {
          const totalDelivered = products.reduce((s, p) => s + (parseFloat(p.total_delivered)||0), 0);
          const totalAdSpend = totals.adSpend || 0;
          const avgPrice = products.reduce((s, p) => s + (parseFloat(p.selling_price_dzd)||0), 0) / (products.length||1);
          const avgCost = products.reduce((s, p) => s + (parseFloat(p.cost_price_dzd)||0), 0) / (products.length||1);
          const beUnits = (avgPrice - avgCost) > 0 ? (totalAdSpend * exchangeRate) / (avgPrice - avgCost) : 0;
          const progress = beUnits > 0 ? Math.min(100, (totalDelivered / beUnits) * 100) : 0;
          return (
            <KPICard
              title="Progression Break-Even"
              value={`${formatNumber(progress, 0)}%`}
              subtitle={`${formatNumber(totalDelivered, 0)} / ${formatNumber(beUnits, 0)} livrées`}
              type={progress >= 100 ? 'profit' : 'warning'}
            />
          );
        })()}

        ### Répartition des Coûts'''
        dash = dash.replace("### Répartition des Coûts", kpi_block)
        print("✅ Dashboard: added inventory KPI cards")
        changed = True
    else:
        print("⚠️  Dashboard: could not find '### Répartition des Coûts' — please add KPIs manually")
else:
    print("⏭️  Dashboard: KPI cards already exist")

if changed:
    write("src/pages/Dashboard.jsx", dash)

# =============================================================================
# 2. PATCH src/components/EntryForm.jsx
# =============================================================================
entry = read("src/components/EntryForm.jsx")
changed2 = False

# 2a. Ensure products state + fetch effect
if "const [products, setProducts]" not in entry:
    entry = entry.replace(
        "const [toast, setToast] = useState(null);",
        "const [toast, setToast] = useState(null);\n  const [products, setProducts] = useState([]);\n  useEffect(() => {\n    fetch(`${API_URL}/api/products`).then(r => r.json()).then(setProducts);\n  }, []);"
    )
    print("✅ EntryForm: added products state + fetch")
    changed2 = True
else:
    print("⏭️  EntryForm: products state already exists")

# 2b. Ensure Product select exists
if "Produit" not in entry:
    # Find Campagne select block and insert after it
    # Look for the pattern: Campagne ... </select>
    pattern = r'(Campagne.*?</select>)'
    match = re.search(pattern, entry, re.DOTALL)
    if match:
        insert_pos = match.end()
        product_select = '''
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Produit</label>
            <select
              className="input w-full"
              value={form.product_id || ''}
              onChange={e => updateValue('product_id', e.target.value)}
            >
              <option value="">-- Sélectionner --</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>'''
        entry = entry[:insert_pos] + product_select + entry[insert_pos:]
        print("✅ EntryForm: added Product select")
        changed2 = True
    else:
        print("⚠️  EntryForm: could not find Campagne select — please add Product select manually")
else:
    print("⏭️  EntryForm: Product select already exists")

if changed2:
    write("src/components/EntryForm.jsx", entry)

# =============================================================================
# 3. Git add / commit / push
# =============================================================================
print()
print("Staging and committing...")

subprocess.run(["git", "add", "."], check=True)
subprocess.run([
    "git", "commit", "-m",
    "feat: inventory tracking, stock purchases, dual break-even calculator"
], check=True)
subprocess.run(["git", "push", "origin", "main"], check=True)

print()
print("=" * 50)
print("✅ Done! Pushed to origin/main")
print("=" * 50)
print("Render will auto-deploy. The inventory_purchases table")
print("will be created automatically on the next server start.")