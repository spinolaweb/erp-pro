import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { 
  LayoutDashboard, PlusCircle, History, BarChart3, Package, 
  Truck, Users, Settings, Calculator, Menu, X, LogOut 
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Tableau de Bord', icon: LayoutDashboard },
  { path: '/entry', label: 'Nouvelle Entrée', icon: PlusCircle },
  { path: '/history', label: 'Historique', icon: History },
  { path: '/analytics', label: 'Analytiques', icon: BarChart3 },
  { path: '/products', label: 'Produits', icon: Package },
  { path: '/suppliers', label: 'Fournisseurs', icon: Truck },
  { path: '/customers', label: 'Clients', icon: Users },
  { path: '/break-even', label: 'Calculateur', icon: Calculator },
  { path: '/settings', label: 'Paramètres', icon: Settings },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-400">ERP-Pro</h1>
          <p className="text-xs text-slate-400 mt-1">Gestion COD Algérie</p>
        </div>

        <nav className="px-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button className="flex items-center gap-3 px-4 py-3 text-sm text-slate-400 hover:text-white w-full">
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}
