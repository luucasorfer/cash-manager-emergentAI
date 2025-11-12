import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Tag,
  CreditCard,
  FileText,
  ShoppingCart,
  DollarSign,
  Shield,
  Target,
  Menu,
  X,
  Settings,
} from "lucide-react";

const Layout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/fixed-expenses", icon: CreditCard, label: "Gastos Fixos" },
    {
      path: "/variable-expenses",
      icon: ShoppingCart,
      label: "Gastos Variáveis",
    },
    { path: "/incomes", icon: DollarSign, label: "Receitas" },
    {
      path: "/emergency-reserve",
      icon: Shield,
      label: "Reserva de Emergência",
    },
    { path: "/savings-goals", icon: Target, label: "Metas" },
    /*Categorias deve ficar em configurações*/
    //{ path: "/categories", icon: Tag, label: "Categorias" },

    /*Templates deve ficar em configurações*/
    //{ path: "/fixed-expense-templates", icon: FileText, label: "Templates" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-white shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl text-center font-bold text-slate-800">
                  Cash Monitor
                </h1>
                <p className="text-sm text-center text-slate-500 mt-1">
                  Seu controle financeiro simplificado!
                </p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-slate-500 hover:text-slate-700"
                data-testid="close-sidebar-btn"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg
                        transition-all duration-200
                        ${
                          isActive
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }
                      `}
                      data-testid={`nav-${item.label
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Settings Section */}
          <div className="p-4 border-t border-slate-200">
            <Link
              to="/settings"
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200
                ${
                  location.pathname === "/settings"
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }
              `}
              data-testid="nav-settings"
            >
              <Settings size={20} />
              <span className="font-medium">Configurações</span>
            </Link>
          </div>

          {/* Footer */}
          <div className="p-4">
            <p className="text-xs text-slate-500 text-center">
              © 2025 Cash Monitor
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar 
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-600 hover:text-slate-900"
              data-testid="open-sidebar-btn"
            >
              <Menu size={24} />
            </button>
            <div className="flex-1 lg:flex-none">
              <h2 className="text-xl font-semibold text-slate-800 text-center lg:text-left">
                {menuItems.find((item) => item.path === location.pathname)
                  ?.label || "Dashboard"}
              </h2>
            </div>
          </div>
        </header>
        */}
        {/* Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
