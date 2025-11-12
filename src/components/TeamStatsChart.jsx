import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

export default function TeamStatsChart({ stats }) {
  if (!stats) return null;

  const data = {
    labels: [
      "Matchs joués",
      "Buts",
      "Passes",
      "🟨 Jaunes",
      "🟥 Rouges",
      "Note moyenne",
    ],
    datasets: [
      {
        label: `Équipe – ${stats.season}`,
        data: [
          stats.max_games_played,
          stats.total_goals,
          stats.total_assists,
          stats.total_yellow_cards,
          stats.total_red_cards,
          stats.average_rating,
        ],
        backgroundColor: [
          "#3b82f6", // blue
          "#10b981", // green
          "#f59e0b", // amber
          "#eab308", // yellow
          "#ef4444", // red
          "#6366f1", // indigo
        ],
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `📊 Statistiques globales – ${stats.season}`,
        font: { size: 18 },
        padding: { top: 10, bottom: 20 },
      },
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 5 },
        grid: { color: "#e5e7eb" },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <Bar data={data} options={options} />
    </div>
  );
}
