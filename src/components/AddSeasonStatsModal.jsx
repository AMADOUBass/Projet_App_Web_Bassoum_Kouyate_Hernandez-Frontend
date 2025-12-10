import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";

export default function AddSeasonStatsModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    player: "",
    season_year: new Date().getFullYear().toString(),
    games_played: "",
    goals: "",
    assists: "",
    yellow_cards: "",
    red_cards: "",
    notes_moyenne_saison: "",
  });

  const [errors, setErrors] = useState({});
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seasonFilter, setSeasonFilter] = useState(new Date().getFullYear().toString());  

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axiosInstance.get(
          "/admin/players-without-stats/",
          {
            params: { season: seasonFilter },
          }
        );
        setPlayers(response.data);
      } catch (error) {
        toast.error("Erreur lors du chargement des joueurs sans stats.");
      }
    };
    fetchPlayers();
  }, [seasonFilter]);

  const validate = () => {
    const newErrors = {};
    const year = parseInt(formData.season_year);
    const currentYear = new Date().getFullYear();

    if (!formData.player.trim()) newErrors.player = "Le joueur est requis.";
    if (!formData.season_year.trim()) {
      newErrors.season_year = "La saison est requise.";
    } else if (isNaN(year)) {
      newErrors.season_year = "La saison doit être un nombre.";
    } else if (year < currentYear || year > currentYear + 1) {
      newErrors.season_year = `La saison doit être ${currentYear} ou ${
        currentYear + 1
      }.`;
    }

    [
      "games_played",
      "goals",
      "assists",
      "yellow_cards",
      "red_cards",
      "notes_moyenne_saison",
    ].forEach((field) => {
      const value = formData[field];
      if (value === "") newErrors[field] = "Ce champ est requis.";
      else if (isNaN(value)) newErrors[field] = "Doit être un nombre.";
      else if (parseFloat(value) < 0)
        newErrors[field] = "Ne peut pas être négatif.";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await axiosInstance.post("/admin/create-season-stats/", formData);
      toast.success("Statistiques ajoutées !");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("❌ Erreur lors de l'ajout.");
    } finally {
      setFormData({
        player: "",
        season_year: new Date().getFullYear().toString(),
        games_played: "",
        goals: "",
        assists: "",
        yellow_cards: "",
        red_cards: "",
        notes_moyenne_saison: "",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl font-bold">
          ×
        </button>
        <h3 className="text-lg font-semibold mb-4">
          ➕ Ajouter des statistiques
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Sélecteur de joueur */}
          <div>
            <select
              name="player"
              value={formData.player}
              onChange={handleChange}
              className={`w-full border px-3 py-2 rounded ${
                errors.player ? "border-red-500" : ""
              }`}>
              <option value="">-- Sélectionner un joueur --</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.user?.first_name} {p.user?.last_name || p.user?.email}
                </option>
              ))}
            </select>
            {errors.player && (
              <p className="text-red-500 text-sm mt-1">{errors.player}</p>
            )}
          </div>

          {/* Champs numériques */}
          {[
            { name: "season_year", label: "Saison" },
            { name: "games_played", label: "Matchs joués", type: "number" },
            { name: "goals", label: "Buts", type: "number" },
            { name: "assists", label: "Passes", type: "number" },
            { name: "yellow_cards", label: "🟨 Jaunes", type: "number" },
            { name: "red_cards", label: "🟥 Rouges", type: "number" },
            {
              name: "notes_moyenne_saison",
              label: "Note moyenne",
              type: "number",
              step: "0.01",
            },
          ].map(({ name, label, type = "text", step }) => (
            <div key={name}>
              <label className="block mb-1 font-medium text-left">
                {label}
              </label>
              <input
                name={name}
                type={type}
                step={step}
                // placeholder={label}
                value={formData[name]}
                onChange={handleChange}
                className={`w-full border px-3 py-2 rounded ${
                  errors[name] ? "border-red-500" : ""
                }`}
              />
              {errors[name] && (
                <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
              )}
            </div>
          ))}

          <div className="flex justify-end gap-4 mt-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Ajouter
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
