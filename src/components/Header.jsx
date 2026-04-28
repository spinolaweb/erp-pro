import { useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const pageNames = {
  '/': 'Tableau de Bord',
  '/entry': 'Nouvelle Entrée',
  '/history': 'Historique',
  '/analytics': 'Analytiques',
  '/products': 'Produits',
  '/suppliers': 'Fournisseurs',
  '/customers': 'Clients',
  '/settings': 'Paramètres',
  '/break-even': 'Calculateur Seuil Rentabilité'
};

export function Header() {
  const location = useLocation();
  const title = pageNames[location.pathname] || 'ERP-Pro';

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Accueil</span>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-gray-900">{title}</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mt-2">{title}</h2>
    </header>
  );
}
