# ERP-Pro

Système ERP pour e-commerce Cash-on-Delivery (COD) en Algérie.

## Stack

- **Backend**: Node.js + Express + SQLite3
- **Frontend**: React 18 + Vite + Tailwind CSS + Recharts
- **Déploiement**: Render.com (Free Tier)

## Installation Locale

```bash
npm install
npm run dev
```

## Déploiement Render

1. Connecter ce repo à Render
2. Choisir "Web Service"
3. Build Command: `npm install && cd src && npm install && npm run build`
4. Start Command: `node server.js`
5. Ajouter les variables d'environnement depuis `.env.example`

## Calculatrice COD

Formule sacrée:
```
Profit = (Livrées × Prix_Vente) − (Livrées × Coût_Produit) − Dépenses_Pub_Total
Livrées = Commandes × Confirmation% × Livraison%
```

## Licence

MIT