import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);

  // 🔐 Logout logic
  const handleLogout = useCallback(() => {
    localStorage.clear();
    navigate("/");
  }, [navigate]);

  // ✅ Approve player with error-based redirection
  const handleApprove = async (playerId) => {
    // const access = localStorage.getItem("access");

    try {
      console.log("Axios ", axiosInstance);
      await axiosInstance.post(`/admin/approve-player/${playerId}/`);
      toast.success("Player approved!");
      fectchUnapprovedPlayers();
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
  const fectchUnapprovedPlayers = async () => {
    try {
      const response = await axiosInstance.get("/admin/unapproved-users/");
      console.log("Unapproved players:", response.data);
      setPlayers(response.data);
    } catch (error) {
      console.error("Error fetching unapproved players:", error);
    }
  };

  // 🔄 Fetch players with token refresh fallback
  useEffect(() => {
    fectchUnapprovedPlayers();
  }, [handleLogout]);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Accueil de l'Admin 👑</h1>
      <p>
        Bienvenue, Admin! Voici la liste des joueurs qui attendent votre
        approbation :
      </p>

      <table className="min-w-full border bg-gray-900 mt-6">
        <thead className="bg-gray-900">
          <tr>
            <th className="px-4 py-2 text-left">Nom d'utilisateur</th>
            <th className="px-4 py-2 text-left">L'Email</th>
            <th className="px-4 py-2 text-left">Rôle</th>
            <th className="px-4 py-2 text-left">Approuvé</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {players.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="px-4 py-2">{user.username || "—"}</td>
              <td className="px-4 py-2 text-blue-600">{user.email || "—"}</td>
              <td className="px-4 py-2">{user.role || "—"}</td>
              <td className="px-4 py-2">{user.is_approved ? "✅" : "❌"}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => {
                    if (!user.id || typeof user.id !== "string") {
                      toast.error("ID utilisateur invalide ou manquant.");
                      return;
                    }
                    handleApprove(user.id);
                  }}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
                  Approuver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleLogout}
        className="mt-6 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
        Se Déconnecter
      </button>
    </div>
  );
}
