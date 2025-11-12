import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import PlayerStatsChart from "./PlayerStatsChart";

export default function MyStatsTable() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("/player/my-season-stats/");
        setStats(res.data);
      } catch (error) {
        toast.error("Erreur lors du chargement de vos statistiques.");
      }
    };

    fetchStats();
  }, []);

  const getGlobalStats = () => {
    if (stats.length === 0) return null;

    const season = stats[0].season_year;
    const total_goals = stats.reduce((sum, s) => sum + (s.goals || 0), 0);
    const total_assists = stats.reduce((sum, s) => sum + (s.assists || 0), 0);
    const total_yellow_cards = stats.reduce(
      (sum, s) => sum + (s.yellow_cards || 0),
      0
    );
    const total_red_cards = stats.reduce(
      (sum, s) => sum + (s.red_cards || 0),
      0
    );
    const max_games_played = Math.max(...stats.map((s) => s.games_played || 0));
    const average_rating =
      stats.length > 0
        ? (
            stats.reduce(
              (sum, s) => sum + (Number(s.notes_moyenne_saison) || 0),
              0
            ) / stats.length
          ).toFixed(2)
        : 0;

    return {
      season,
      total_goals,
      total_assists,
      total_yellow_cards,
      total_red_cards,
      max_games_played,
      average_rating,
    };
  };
  const getImprovementPoints = () => {
    if (stats.length === 0) return [];

    const points = [];

    const avgNote =
      stats.reduce((sum, s) => sum + (Number(s.average_rating) || 0), 0) /
      stats.length;
    const totalYellow = stats.reduce(
      (sum, s) => sum + (s.yellow_cards || 0),
      0
    );
    const totalRed = stats.reduce((sum, s) => sum + (s.red_cards || 0), 0);
    const totalAssists = stats.reduce((sum, s) => sum + (s.assists || 0), 0);
    const totalGoals = stats.reduce((sum, s) => sum + (s.goals || 0), 0);

    if (avgNote < 6)
      points.push(
        "📉 Améliorer la régularité pour obtenir une meilleure note moyenne."
      );
    if (totalYellow >= 3)
      points.push("⚠️ Réduire les fautes pour éviter les cartons jaunes.");
    if (totalRed >= 1)
      points.push(
        "🟥 Éviter les comportements à risque menant à des cartons rouges."
      );
    if (totalAssists < 2)
      points.push(
        "🤝 Participer davantage au jeu collectif avec plus de passes décisives."
      );
    if (totalGoals < 2)
      points.push("🎯 Travailler la finition pour marquer davantage.");

    return points;
  };
  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold mb-14">
        📊 Mes statistiques par saison
      </h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100 text-center">
            <tr>
              <th className="p-2">Saison</th>
              <th className="p-2">Poste</th>
              <th className="p-2">Matchs</th>
              <th className="p-2">Buts</th>
              <th className="p-2">Passes</th>
              <th className="p-2">🟨</th>
              <th className="p-2">🟥</th>
              <th className="p-2">Note moyenne</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s, index) => (
              <tr key={index} className="border-t text-center">
                <td className="p-2">{s.season_year}</td>
                <td className="p-2">{s.player_position}</td>
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
      {stats.length > 0 && (
        <div className="mt-20">
          <PlayerStatsChart stats={getGlobalStats()} />
        </div>
      )}
      {getImprovementPoints().length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-yellow-100 to-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-yellow-800 mb-4 flex items-center gap-2">
            <span>📌</span> Points à améliorer
          </h3>
          <ul className="space-y-3 text-sm text-yellow-900">
            {getImprovementPoints().map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1 text-yellow-600"></span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
