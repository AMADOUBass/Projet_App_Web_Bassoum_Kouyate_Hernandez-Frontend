// ✅ AdminDashboard.jsx — version fusionnée finale (avec gestion d'événements + formulaire complet)
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [allPlayers, setAllPlayers] = useState([]);
  const [activeTab, setActiveTab] = useState("unapproved");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModal, setEditModal] = useState({ open: false, player: null });
  const [formData, setFormData] = useState({
    team_name: "",
    position: "",
    jersey_number: "",
    is_available: true,
    height: "",
    weight: "",
  });


  const unapprovedPlayers = allPlayers.filter((p) => !p.user.is_approved);
  const approvedPlayers = allPlayers.filter((p) => p.user.is_approved);

  // Filtrage avec recherche
  const filteredPlayers = useMemo(() => {
    const current =
      activeTab === "unapproved" ? unapprovedPlayers : approvedPlayers;
    if (!searchQuery.trim()) return current;
    const lower = searchQuery.toLowerCase();
    return current.filter(
      (p) =>
        p.user.username?.toLowerCase().includes(lower) ||
        p.user.email?.toLowerCase().includes(lower) ||
        p.user.role?.toLowerCase().includes(lower)
    );
  }, [activeTab, searchQuery, unapprovedPlayers, approvedPlayers]);

 
  const handleLogout = useCallback(() => {
    localStorage.clear();
    navigate("/");
  }, [navigate]);

  
  const handleEvent = useCallback(() => {
    navigate("/admin/events");
  }, [navigate]);

 
  const fetchAllPlayers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/admin/players/");
      setAllPlayers(response.data);
    } catch (err) {
      setError("Erreur lors du chargement des joueurs");
      toast.error("Erreur chargement joueurs");
    } finally {
      setLoading(false);
    }
  };

 
  const handleApprove = async (playerId) => {
    try {
      await axiosInstance.post(`/admin/approve-player/${playerId}/`);
      toast.success("Joueur approuvé !");
      fetchAllPlayers();
    } catch (error) {
      const status = error.response ? error.response.status : null;
      switch (status) {
        case 401:
          localStorage.clear();
          navigate("/error", {
            state: {
              code: 401,
              message: "La session a expiré. Veuillez vous reconnecter.",
            },
          });
          break;
        case 403:
          navigate("/error", {
            state: {
              code: 403,
              message:
                "Vous n'avez pas la permission d'effectuer cette action.",
            },
          });
          break;
        case 404:
          navigate("/error", {
            state: { code: 404, message: "Utilisateur non trouvé." },
          });
          break;
        default:
          navigate("/error", {
            state: {
              code: 500,
              message: "Une erreur s'est produite. Veuillez réessayer.",
            },
          });
          break;
      }
    }
  };

  
  const handleEdit = (player) => {
    if (!player.user.is_approved) {
      toast.error("Seuls les joueurs approuvés peuvent être modifiés.");
      return;
    }
    setFormData({
      team_name: player.team_name || "",
      position: player.position || "",
      jersey_number: player.jersey_number || "",
      is_available: player.is_available ?? true,
      height: player.height || "",
      weight: player.weight || "",
    });
    setEditModal({ open: true, player });
  };


  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editModal.player?.id) return toast.error("ID joueur manquant");
    try {
      await axiosInstance.put(
        `/admin/players/${editModal.player.id}/`,
        formData
      );
      toast.success("Joueur mis à jour !");
      setEditModal({ open: false, player: null });
      fetchAllPlayers();
    } catch (error) {
      toast.error("Erreur mise à jour joueur");
      console.error(error);
    }
  };


  useEffect(() => {
    fetchAllPlayers();
  }, []);

  if (loading) return <div className="p-6 text-center">Chargement...</div>;
  if (error) return <div className="p-6 text-red-500">Erreur: {error}</div>;

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Accueil de l'Admin 👑</h1>
      <p className="mb-4">Gérez les joueurs et vos événements :</p>

      {/* Onglets */}
      <div className="flex mb-4 bg-gray-800 rounded overflow-hidden">
        <button
          onClick={() => setActiveTab("unapproved")}
          className={`px-6 py-2 font-medium ${
            activeTab === "unapproved"
              ? "bg-blue-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          Non Approuvés ({unapprovedPlayers.length})
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          className={`px-6 py-2 font-medium ${
            activeTab === "approved"
              ? "bg-blue-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          Approuvés ({approvedPlayers.length})
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-4">
        <input
          type="text"
          placeholder={`Rechercher dans ${
            activeTab === "unapproved" ? "non approuvés" : "approuvés"
          }...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border border-gray-500 rounded bg-gray-700 text-white placeholder-gray-400"
        />
      </div>

      {/* Tableau */}
      <table className="min-w-full border bg-gray-800 rounded-lg overflow-hidden mb-6">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-4 py-2 text-left">Nom d'utilisateur</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Équipe</th>
            <th className="px-4 py-2 text-left">Rôle</th>
            <th className="px-4 py-2 text-left">Approuvé</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPlayers.map((player) => (
            <tr
              key={player.id}
              className="border-t bg-gray-800 hover:bg-gray-700"
            >
              <td className="px-4 py-2">{player.user.username || "—"}</td>
              <td className="px-4 py-2 text-blue-400">
                {player.user.email || "—"}
              </td>
              <td className="px-4 py-2">{player.team_name || "—"}</td>
              <td className="px-4 py-2">{player.user.role || "—"}</td>
              <td className="px-4 py-2">
                {player.user.is_approved ? "✅" : "❌"}
              </td>
              <td className="px-4 py-2 space-x-2">
                {!player.user.is_approved && (
                  <button
                    onClick={() => handleApprove(player.user.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Approuver
                  </button>
                )}
                {player.user.is_approved && (
                  <button
                    onClick={() => handleEdit(player)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Modifier
                  </button>
                )}
              </td>
            </tr>
          ))}
          {filteredPlayers.length === 0 && (
            <tr>
              <td colSpan="6" className="px-4 py-2 text-center text-gray-400">
                Aucun joueur trouvé.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal d'édition */}
      {editModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 text-white border border-gray-600">
            <h2 className="text-xl font-bold mb-4 text-center">
              Modifier le profil du joueur ⚽
            </h2>
            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Nom d'équipe
                </label>
                <input
                  type="text"
                  value={formData.team_name}
                  onChange={(e) =>
                    setFormData({ ...formData, team_name: e.target.value })
                  }
                  className="w-full p-2 border border-gray-500 rounded bg-gray-700 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Position
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  className="w-full p-2 border border-gray-500 rounded bg-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Numéro de maillot
                </label>
                <input
                  type="number"
                  value={formData.jersey_number}
                  onChange={(e) =>
                    setFormData({ ...formData, jersey_number: e.target.value })
                  }
                  className="w-full p-2 border border-gray-500 rounded bg-gray-700 text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) =>
                    setFormData({ ...formData, is_available: e.target.checked })
                  }
                />
                <label className="text-gray-300">Disponible</label>
              </div>

              <hr className="my-3 border-gray-600" />

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Taille (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({ ...formData, height: e.target.value })
                  }
                  className="w-full p-2 border border-gray-500 rounded bg-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Poids (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                  className="w-full p-2 border border-gray-500 rounded bg-gray-700 text-white"
                />
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setEditModal({ open: false, player: null })}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

     
      <div className="flex space-x-4">
        <button
          onClick={handleEvent}
          className="mt-6 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
        Événements
        </button>
        <button
          onClick={handleLogout}
          className="mt-6 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Se Déconnecter
        </button>
      </div>
    </div>
  );
}
