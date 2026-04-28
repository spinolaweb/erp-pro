import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Entry } from './pages/Entry';
import { History } from './pages/History';
import { Analytics } from './pages/Analytics';
import { Products } from './pages/Products';
import { Suppliers } from './pages/Suppliers';
import { Customers } from './pages/Customers';
import { Settings } from './pages/Settings';
import { BreakEvenCalculator } from './pages/BreakEvenCalculator';

function App() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-0">
        <Header />
        <main className="pb-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/entry" element={<Entry />} />
            <Route path="/history" element={<History />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/products" element={<Products />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/break-even" element={<BreakEvenCalculator />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
