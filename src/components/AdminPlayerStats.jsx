import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

export default function AdminPlayerStats() {
  const [playerStats, setPlayerStats] = useState([]);
  const [filteredStats, setFilteredStats] = useState([]);
  const [seasonFilter, setSeasonFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPlayerStats();
  }, [seasonFilter]);

  const fetchPlayerStats = async () => {
    try {
      const response = await axiosInstance.get("/admin/season-stats/", {
        params: seasonFilter ? { season: seasonFilter } : {},
      });
      setPlayerStats(response.data);
      setFilteredStats(response.data);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Erreur lors du chargement des statistiques joueurs.");
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredStats].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredStats(sorted);
  };

  const exportToCSV = () => {
    const headers = [
      "Joueur",
      "Poste",
      "Saison",
      "Matchs",
      "Buts",
      "Passes",
      "🟨",
      "🟥",
      "Note moyenne",
    ];

    const rows = filteredStats.map((stat) => [
      stat.player_name,
      stat.player_position || "",
      stat.season_year,
      stat.games_played,
      stat.goals,
      stat.assists,
      stat.yellow_cards,
      stat.red_cards,
      stat.notes_moyenne_saison,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "player_stats.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredByPosition = positionFilter
    ? filteredStats.filter((stat) => stat.player_position === positionFilter)
    : filteredStats;

  const totalPages = Math.ceil(filteredByPosition.length / itemsPerPage);
  const paginatedStats = filteredByPosition.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const uniquePositions = [
    ...new Set(playerStats.map((s) => s.player_position)),
  ].filter(Boolean);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        📋 Statistiques individuelles des joueurs
      </h2>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <input
          type="text"
          value={seasonFilter}
          onChange={(e) => setSeasonFilter(e.target.value)}
          placeholder="Filtrer par saison (ex: 2025-2026)"
          className="border border-gray-300 rounded px-4 py-2 w-full md:w-64"
        />
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 w-full md:w-48">
          <option value="">Tous les postes</option>
          {uniquePositions.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
        <button
          onClick={exportToCSV}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition">
          📥 Exporter en CSV
        </button>
      </div>

      {filteredByPosition.length === 0 ? (
        <p className="text-gray-600">Aucune statistique trouvée.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    className="px-4 py-2 cursor-pointer"
                    onClick={() => handleSort("player_name")}>
                    Joueur
                  </th>
                  <th className="px-4 py-2">Poste</th>
                  <th className="px-4 py-2">Saison</th>
                  <th
                    className="px-4 py-2 cursor-pointer"
                    onClick={() => handleSort("games_played")}>
                    Matchs
                  </th>
                  <th
                    className="px-4 py-2 cursor-pointer"
                    onClick={() => handleSort("goals")}>
                    Buts
                  </th>
                  <th
                    className="px-4 py-2 cursor-pointer"
                    onClick={() => handleSort("assists")}>
                    Passes
                  </th>
                  <th className="px-4 py-2">🟨</th>
                  <th className="px-4 py-2">🟥</th>
                  <th
                    className="px-4 py-2 cursor-pointer"
                    onClick={() => handleSort("notes_moyenne_saison")}>
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedStats.map((stat) => (
                  <tr key={stat.id} className="text-center border-t">
                    <td className="px-4 py-2">
                      <Link
                        to={`/admin/player/${stat.player_id}`}
                        className="text-blue-600 underline">
                        {stat.player_name}
                      </Link>
                    </td>
                    <td className="px-4 py-2">{stat.player_position}</td>
                    <td className="px-4 py-2">{stat.season_year}</td>
                    <td className="px-4 py-2">{stat.games_played}</td>
                    <td className="px-4 py-2">{stat.goals}</td>
                    <td className="px-4 py-2">{stat.assists}</td>
                    <td className="px-4 py-2">{stat.yellow_cards}</td>
                    <td className="px-4 py-2">{stat.red_cards}</td>
                    <td className="px-4 py-2">{stat.notes_moyenne_saison}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">
              ◀ Précédent
            </button>
            <span className="text-sm font-medium">
              Page {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">
              Suivant ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
}
