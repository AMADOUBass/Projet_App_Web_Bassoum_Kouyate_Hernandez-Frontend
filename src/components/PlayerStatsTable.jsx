import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";

export default function SeasonStatsTable() {
  const [stats, setStats] = useState([]);
  const [filteredStats, setFilteredStats] = useState([]);
  const [searchPlayer, setSearchPlayer] = useState("");
  const [sortField, setSortField] = useState("goals");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("/admin/season-stats/");
        setStats(res.data);
      } catch (error) {
        toast.error("Erreur lors du chargement des statistiques.");
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const filtered = stats.filter((s) =>
      s.player_name.toLowerCase().includes(searchPlayer.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      const valA = Number(a[sortField]) || 0;
      const valB = Number(b[sortField]) || 0;
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

    setFilteredStats(sorted);
  }, [stats, searchPlayer, sortField, sortOrder]);

  const exportToCSV = () => {
    const headers = [
      "Joueur",
      "Position",
      "Saison",
      "Matchs",
      "Buts",
      "Passes",
      "Jaunes",
      "Rouges",
      "Note moyenne",
    ];

    const rows = filteredStats.map((s) => [
      s.player_name,
      s.player_position,
      s.season_year,
      s.games_played,
      s.goals,
      s.assists,
      s.yellow_cards,
      s.red_cards,
      s.notes_moyenne_saison ? Number(s.notes_moyenne_saison).toFixed(2) : "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "stats_joueurs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const currentYear = new Date().getFullYear();
  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold mb-11">
        📊 Statistiques saisonnières {currentYear}
      </h1>

      {/* Barre de filtre et tri */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="🔍 Filtrer par joueur"
          value={searchPlayer}
          onChange={(e) => setSearchPlayer(e.target.value)}
          className="border px-2 py-1 rounded"
        />

        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="border px-2 py-1 rounded">
          <option value="goals">Buts</option>
          <option value="assists">Passes</option>
          <option value="games_played">Matchs</option>
          <option value="notes_moyenne_saison">Note moyenne</option>
        </select>

        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="border px-2 py-1 rounded">
          {sortOrder === "asc" ? "⬆️ Croissant" : "⬇️ Décroissant"}
        </button>

        <button
          onClick={exportToCSV}
          className="border px-2 py-1 rounded bg-green-100 hover:bg-green-200">
          📥 Exporter en CSV
        </button>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="min-w-full border mt-4">
          <thead className="bg-gray-600 text-white">
            <tr>
              <th className="p-2">Joueur</th>
              <th className="p-2">Position</th>
              <th className="p-2">Saison</th>
              <th className="p-2">Matchs</th>
              <th className="p-2">Buts</th>
              <th className="p-2">Passes</th>
              <th className="p-2">🟨</th>
              <th className="p-2">🟥</th>
              <th className="p-2">Note moyenne</th>
            </tr>
          </thead>
          <tbody>
            {filteredStats.map((s, index) => (
              <tr key={index} className="border-t text-center">
                <td className="p-2">{s.player_name}</td>
                <td className="p-2">{s.player_position}</td>
                <td className="p-2">{s.season_year}</td>
                <td className="p-2">{s.games_played}</td>
                <td className="p-2">{s.goals}</td>
                <td className="p-2">{s.assists}</td>
                <td className="p-2">{s.yellow_cards}</td>
                <td className="p-2">{s.red_cards}</td>
                <td className="p-2 font-semibold">
                  {s.notes_moyenne_saison
                    ? Number(s.notes_moyenne_saison).toFixed(2)
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
