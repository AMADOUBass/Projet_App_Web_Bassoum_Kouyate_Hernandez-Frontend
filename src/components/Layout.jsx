// AdminLayout.jsx
import { useState } from "react";
import { X } from "lucide-react";
import AdminDashboard from "./AdminDashboard";
import Event from "./Event";

export default function AdminLayout() {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  // Contenu dynamique selon le menu sélectionné
  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <AdminDashboard />;
      case "events":
        return <Event />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-800 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 flex flex-col p-4">
        <h2 className="text-xl font-bold mb-6">Mon Projet</h2>
        <nav className="flex flex-col gap-2">
          <button
            className={`text-left px-3 py-2 rounded hover:bg-gray-700 ${
              activeMenu === "dashboard" ? "bg-gray-700" : ""
            }`}
            onClick={() => setActiveMenu("dashboard")}
          >
            Dashboard Admin
          </button>
          <button
            className={`text-left px-3 py-2 rounded hover:bg-gray-700 ${
              activeMenu === "events" ? "bg-gray-700" : ""
            }`}
            onClick={() => setActiveMenu("events")}
          >
            Événements
          </button>
          {/* Ajouter d'autres menus ici */}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex justify-end items-center p-4 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <span>👤 Admin</span>
            <button
              onClick={() => alert("Déconnexion à implémenter")}
              className="px-3 py-1 bg-red-500 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Contenu */}
        <main className="flex-1 overflow-auto p-6">{renderContent()}</main>
      </div>
    </div>
  );
}
