// Updated AdminDashboard.jsx (remplace ton fichier entier)
import { useEffect, useState, useCallback, useMemo } from "react";  // + useMemo pour filtre
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [allPlayers, setAllPlayers] = useState([]);
  const [activeTab, setActiveTab] = useState("unapproved");
  const [searchQuery, setSearchQuery] = useState("");  // Nouveau : state recherche
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModal, setEditModal] = useState({ open: false, player: null });
  const [formData, setFormData] = useState({});

  // Derived lists from allPlayers
  const unapprovedPlayers = allPlayers.filter(p => !p.user.is_approved);
  const approvedPlayers = allPlayers.filter(p => p.user.is_approved);

  // 🔍 Filtrage avec recherche (useMemo pour perf)
  const filteredPlayers = useMemo(() => {
    const current = activeTab === "unapproved" ? unapprovedPlayers : approvedPlayers;
    if (!searchQuery.trim()) return current;
    const lowerQuery = searchQuery.toLowerCase();
    return current.filter(player =>
      player.user.username.toLowerCase().includes(lowerQuery) ||
      player.user.email.toLowerCase().includes(lowerQuery) ||
      player.user.role.toLowerCase().includes(lowerQuery)
    );
  }, [activeTab, searchQuery, unapprovedPlayers, approvedPlayers]);

  // Debounce pour recherche (optionnel, simple setTimeout)
  const debouncedSearch = useCallback((query) => {
    const timer = setTimeout(() => setSearchQuery(query), 300);  // 300ms debounce
    return () => clearTimeout(timer);
  }, []);

  // 🔐 Logout logic
  const handleLogout = useCallback(() => {
    localStorage.clear();
    navigate("/");
  }, [navigate]);

  // Voir evenet
  const handleEvent = useCallback(() => {
    navigate("/admin/events");
  }, [navigate]);

  // ✅ Approve player with error-based redirection
  const handleApprove = async (playerId) => {
    // const access = localStorage.getItem("access");

  // ✅ Approve player
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
            state: { code: 401, message: "La session a expiré. Veuillez vous reconnecter." },
          });
          break;
        case 403:
          navigate("/error", {
            state: { code: 403, message: "Vous n'avez pas la permission d'effectuer cette action." },
          });
          break;
        case 404:
          navigate("/error", { state: { code: 404, message: "Utilisateur non trouvé." } });
          break;
        default:
          navigate("/error", {
            state: { code: 500, message: "Une erreur s'est produite. Veuillez réessayer." },
          });
          break;
      }
    }
  };

  // 🖊️ Open edit modal (only for approved)
  const handleEdit = (player) => {
    if (!player.user.is_approved) {
      toast.error("Seuls les joueurs approuvés peuvent être modifiés.");
      return;
    }
    setFormData({
      team_name: player.team_name || '',
      position: player.position || '',
      jersey_number: player.jersey_number || '',
      is_available: player.is_available || false,
      phone_number: player.user?.phone_number || '',
      bio: player.user?.bio || '',
    });
    setEditModal({ open: true, player });
  };

  // 🖊️ Submit edit
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editModal.player?.id) return toast.error("ID joueur manquant");
    try {
      await axiosInstance.put(`/admin/players/${editModal.player.id}/`, formData);
      toast.success("Joueur mis à jour !");
      setEditModal({ open: false, player: null });
      fetchAllPlayers();
    } catch (error) {
      toast.error("Erreur mise à jour joueur");
      console.error(error);
    }
  };

  // 🔄 Handle search input with debounce
  const handleSearchChange = (e) => {
    const query = e.target.value;
    debouncedSearch(query);
  };

  // 🔄 Clear search on tab switch
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSearchQuery("");  // Clear search
  };

  // 🔄 Fetch on mount
  useEffect(() => {
    fetchAllPlayers();
  }, []);

  if (loading) return <div className="p-6 text-center">Chargement...</div>;
  if (error) return <div className="p-6 text-red-500">Erreur: {error}</div>;

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Accueil de l'Admin 👑</h1>
      <p className="mb-4">Gérez les joueurs de l'équipe :</p>

      {/* Tabs */}
      <div className="flex mb-4 bg-gray-800 rounded overflow-hidden">
        <button
          onClick={() => handleTabSwitch("unapproved")}
          className={`px-6 py-2 font-medium ${activeTab === "unapproved" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
        >
          Non Approuvés ({unapprovedPlayers.length})
        </button>
        <button
          onClick={() => handleTabSwitch("approved")}
          className={`px-6 py-2 font-medium ${activeTab === "approved" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
        >
          Approuvés ({approvedPlayers.length})
        </button>
      </div>

      {/* 🔍 Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder={`Rechercher dans ${activeTab === "unapproved" ? "non approuvés" : "approuvés"}... (nom, email, rôle)`}
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-2 border border-gray-500 rounded bg-gray-700 text-white placeholder-gray-400"
        />
        
      </div>

      <table className="min-w-full border bg-gray-800 rounded-lg overflow-hidden mb-6">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-4 py-2 text-left">Nom d'utilisateur</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Rôle</th>
            <th className="px-4 py-2 text-left">Approuvé</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPlayers.map((player) => (
            <tr key={player.id} className="border-t bg-gray-800 hover:bg-gray-700">
              <td className="px-4 py-2">{player.user.username || "—"}</td>
              <td className="px-4 py-2 text-blue-400">{player.user.email || "—"}</td>
              <td className="px-4 py-2">{player.user.role || "—"}</td>
              <td className="px-4 py-2">{player.user.is_approved ? "✅" : "❌"}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => {
                    if (!user.id || typeof user.id !== "string") {
                      toast.error("ID utilisateur invalide ou manquant.");
                      return;
                    }
                    handleApprove(user.id);
                  }}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Approuver
                </button>
              </td>
            </tr>
          ))}
          {filteredPlayers.length === 0 && (
            <tr>
              <td colSpan="5" className="px-4 py-2 text-center text-gray-400">
                {searchQuery ? `Aucun résultat pour "${searchQuery}".` : `Aucun joueur dans cette catégorie.`}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 🖊️ Dark Modal Edit (inchangé) */}
      {editModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 text-white border border-gray-600">
            <h2 className="text-xl font-bold mb-4">Modifier Joueur</h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-300">Équipe</label>
                <input
                  type="text"
                  value={formData.team_name}
                  onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                  className="w-full p-2 border border-gray-500 rounded bg-gray-700 text-white placeholder-gray-400"
                  placeholder="Nom de l'équipe"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-300">Position</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full p-2 border border-gray-500 rounded bg-gray-700 text-white placeholder-gray-400"
                  placeholder="Ex: Attaquant"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-300">Numéro</label>
                <input
                  type="number"
                  value={formData.jersey_number}
                  onChange={(e) => setFormData({ ...formData, jersey_number: parseInt(e.target.value) || '' })}
                  className="w-full p-2 border border-gray-500 rounded bg-gray-700 text-white placeholder-gray-400"
                  placeholder="Ex: 10"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-300">Disponible</label>
                <select
                  value={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.value === 'true' })}
                  className="w-full p-2 border border-gray-500 rounded bg-gray-700 text-white"
                >
                  <option value={true}>Oui</option>
                  <option value={false}>Non</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-300">Téléphone</label>
                <input
                  type="text"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full p-2 border border-gray-500 rounded bg-gray-700 text-white placeholder-gray-400"
                  placeholder="Ex: +33 1 23 45 67 89"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-300">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full p-2 border border-gray-500 rounded bg-gray-700 text-white placeholder-gray-400"
                  placeholder="Brève description..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditModal({ open: false, player: null })}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                >
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="mt-6 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Se Déconnecter
      </button>

      <button
        onClick={handleEvent}
        className="m-6 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Événements
      </button>
    </div>
  );
}