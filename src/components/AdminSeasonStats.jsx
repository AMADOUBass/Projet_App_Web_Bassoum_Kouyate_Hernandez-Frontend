import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";
import TeamStatsChart from "./TeamStatsChart";
import AddSeasonStatsModal from "./AddSeasonStatsModal";

export default function AdminSeasonStats() {
  const [teamStats, setTeamStats] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState("");
  const [availableSeasons, setAvailableSeasons] = useState([]);
  const [allSeasonsStats, setAllSeasonsStats] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchAvailableSeasons();
  }, []);

  useEffect(() => {
    if (seasonFilter) {
      fetchTeamStats();
    }
  }, [seasonFilter]);

  const fetchAvailableSeasons = async () => {
    try {
      const response = await axiosInstance.get("/admin/available-seasons/");
      setAvailableSeasons(response.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des saisons.");
    }
  };

  const fetchTeamStats = async () => {
    try {
      const response = await axiosInstance.get("/admin/team-season-stats/", {
        params: { season: seasonFilter },
      });
      setTeamStats(response.data);
      setAllSeasonsStats([response.data]);
    } catch (error) {
      toast.error("Erreur lors du chargement des stats globales.");
    }
  };

  // const handleSort = (key) => {
  //   let direction = "asc";
  //   if (sortConfig.key === key && sortConfig.direction === "asc") {
  //     direction = "desc";
  //   }
  //   setSortConfig({ key, direction });

  //   const sorted = [...allSeasonsStats].sort((a, b) => {
  //     if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
  //     if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
  //     return 0;
  //   });

  //   setAllSeasonsStats(sorted);
  // };

  const exportToCSV = () => {
    const headers = [
      "Saison",
      "Joueurs",
      "Matchs joués (équipe)",
      "Buts",
      "Passes",
      "Cartons jaunes",
      "Cartons rouges",
      "Note moyenne",
    ];

    const rows = allSeasonsStats.map((stat) => [
      stat.season,
      stat.players_count,
      stat.max_games_played,
      stat.total_goals,
      stat.total_assists,
      stat.total_yellow_cards,
      stat.total_red_cards,
      stat.average_rating,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "team_season_stats.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-11">
        📊 Statistiques globales par saison
      </h1>

      <div className="flex flex-col md:flex-row items-center gap-10 mb-6">
        <select
          value={seasonFilter}
          onChange={(e) => setSeasonFilter(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 w-full md:w-70">
          <option value="">Veuillez sélectionner une saison</option>
          {availableSeasons.map((season) => (
            <option key={season} value={season}>
              {season}
            </option>
          ))}
        </select>

        <button
          onClick={exportToCSV}
          className="border px-2 py-1 rounded bg-green-100 hover:bg-green-200">
          📥 Exporter en CSV
        </button>

        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          {showForm ? "❌ Fermer le formulaire" : "➕ Ajouter des statistiques"}
        </button>
      </div>

      {showForm && (
        <AddSeasonStatsModal
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchTeamStats();
          }}
        />
      )}

      {teamStats ? (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">
              🌐 Statistiques globales – {teamStats.season}
            </h3>
            <ul className="grid grid-cols-2 gap-4 text-sm">
              <li>
                <strong>Joueurs :</strong> {teamStats.players_count}
              </li>
              <li>
                <strong>Matchs joués (équipe) :</strong>{" "}
                {teamStats.max_games_played}
              </li>
              <li>
                <strong>Buts :</strong> {teamStats.total_goals}
              </li>
              <li>
                <strong>Passes :</strong> {teamStats.total_assists}
              </li>
              <li>
                <strong>Cartons jaunes :</strong> {teamStats.total_yellow_cards}
              </li>
              <li>
                <strong>Cartons rouges :</strong> {teamStats.total_red_cards}
              </li>
              <li>
                <strong>Note moyenne :</strong> {teamStats.average_rating}
              </li>
            </ul>
          </div>

          <TeamStatsChart stats={teamStats} />
        </>
      ) : (
        <p className="text-gray-600">
          Sélectionnez une saison pour voir les statistiques globales.
        </p>
      )}
    </div>
  );
}
