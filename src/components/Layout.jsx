export default function MainLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar gauche */}
      <aside className="w-64 bg-gray-800 p-4 flex flex-col">
        <h2 className="text-2xl font-bold mb-6">MyTeam</h2>
        <nav className="flex-1">
          <ul className="space-y-2">
            <li className="hover:bg-gray-700 p-2 rounded">Tableau de bord</li>
            <li className="hover:bg-gray-700 p-2 rounded">Événements</li>
          </ul>
        </nav>
      </aside>

      {/* Content principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center bg-gray-800 p-4 shadow">
          <h1 className="text-xl font-semibold">Événements</h1>
          <div className="flex items-center gap-2">
            <span>Amadou K.</span>
            <img
              src="https://via.placeholder.com/32"
              alt="Profil"
              className="w-8 h-8 rounded-full"
            />
          </div>
        </header>

        {/* Zone de contenu */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
