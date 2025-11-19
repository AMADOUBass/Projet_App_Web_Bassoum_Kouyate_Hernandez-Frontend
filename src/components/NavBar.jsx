import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import roleTraduction from "../utils/roleTraduction";
import { toast } from "react-hot-toast";
import { useCallback } from "react";
import Logo from "../assets/logo1.webp";

export default function NavBar({ user, onLogout }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileModal, setProfileModal] = useState({
    open: false,
    type: "view",
  }); // view/edit
  const [profileData, setProfileData] = useState({}); // Fetch user data
  const [formData, setFormData] = useState({}); // For edit
  const [loading, setLoading] = useState(false);

  // Fetch profile on mount/click
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/auth/current-user/");
      setProfileData(response.data);
      setFormData({
        first_name: response.data.first_name || "",
        last_name: response.data.last_name || "",
        phone_number: response.data.phone_number || "",
        bio: response.data.bio || "",
      });
    } catch (error) {
      toast.error("Erreur chargement profil");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 🔐 Logout logic
  const handleLogout = useCallback(() => {
    localStorage.clear();
    onLogout?.(); 
    navigate("/login");
  }, [navigate, onLogout]);

  var userRole = localStorage.getItem("role");
  const role = userRole;

  if (role === "admin") {
    var logo = Logo;
  } else {
    var userId = localStorage.getItem("user_id");
    const avatarUrl = `https://api.dicebear.com/9.x/bottts/svg?seed=${userId}`;
    logo = Logo;
    var JoueurLogo = profileData?.profile_picture || avatarUrl;
  }

  return (
    <nav className=" p-4 flex justify-between items-center shadow-lg">
      {/* Logo/Title */}
      <div className="flex items-center space-x-2">
        <img
          src={logo}
          alt="Logo"
          className="w-10 h-10 rounded-full cursor-pointer"
          onClick={() => navigate("/")}
        />
        <h1 className="text-xl pl-4 font-bold">MyTeams ⚽</h1>
        {role === "admin" ? (
          <>
            <button
              onClick={() => navigate("/admin/events")}
              className="ml-6 px-4 py-2   rounded hover:bg-gray-300">
              Événements
            </button>
            <button
              onClick={() => navigate("/admin/mes-joueurs")}
              className="ml-6 px-4 py-2   rounded hover:bg-gray-300">
              Mon Équipe
            </button>
            <button
              onClick={() => navigate("/admin/season-stats")}
              className="ml-6 px-4 py-2   rounded hover:bg-gray-300">
              Stats par Saison
            </button>
            <button
              onClick={() => navigate("/admin/players-stats")}
              className="ml-6 px-4 py-2   rounded hover:bg-gray-300">
              Stats des Joueurs
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/players/events")}
              className="ml-6 px-4 py-2 rounded hover:bg-gray-100">
              Voir Mes Événements
            </button>
            <button
              onClick={() => navigate("/players/my-stats")}
              className="ml-6 px-4 py-2 rounded hover:bg-gray-100">
              Mes Statistiques
            </button>
          </>
        )}
      </div>

      {/* Player Name Dropdown */}
      {user && (
        <div className="relative">
          <button
            onClick={() => {
              fetchProfile();
              setDropdownOpen(!dropdownOpen);
            }}
            className="flex items-center space-x-2  hover:text-blue-400">
            <img
              src={role === "admin" ? logo : JoueurLogo}
              alt="Profil"
              className="w-8 h-8 rounded-full object-cover" // Ajout de object-cover pour une meilleure gestion des proportions
              onError={(e) => {
                // Fallback vers l'avatar généré si l'image ne charge pas
                e.target.src = `https://api.dicebear.com/9.x/bottts/svg?seed=${userId}`;
              }}
            />

            {/* can i show name but if is player and admin i just show role */}
            <span>
              {role === "admin"
                ? "Bienvenue, Administrateur !"
                : user.first_name
                ? `Bienvenue, ${user.first_name} !`
                : "Bienvenue, Joueur !"}
            </span>
            <span>▼</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  if (role === "admin") {
                    navigate("/admin/profil");
                  } else {
                    navigate("/joueur/profil");
                  }
                }}
                className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700">
                👤 Consulter Profil
              </button>
              {/* <button
                onClick={() => {
                  setDropdownOpen(false);
                  setProfileModal({ open: true, type: "edit" });
                }}
                className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700">
                ✏️ Modifier Profil
              </button> */}
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-white hover:bg-red-600">
                🚪 Déconnexion
              </button>
            </div>
          )}
        </div>
      )}

      {/* Profile Modal */}
      {profileModal.open && (
        <div className="fixed  bg-gray-800 inset-0 rounded-md bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 text-white">
            <h2 className="text-xl font-bold mb-4">
              {profileModal.type === "view"
                ? "Mon Profil"
                : "Modifier Mon Profil"}
            </h2>
            {profileModal.type === "view" ? (
              <div className="space-y-4">
                <p>
                  <strong>Nom :</strong>{" "}
                  {profileData.first_name || "Non renseigné"}
                </p>
                <p>
                  <strong>Email :</strong> {profileData.email}
                </p>
                <p>
                  <strong>Téléphone :</strong>{" "}
                  {profileData.phone_number || "Non renseigné"}
                </p>
                <p>
                  <strong>Bio :</strong> {profileData.bio || "Aucune bio."}
                </p>
                <button
                  onClick={() => setProfileModal({ open: false, type: "view" })}
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    className="w-full p-2 border border-gray-500  bg-gray-700"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Nom</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    className="w-full p-2 border border-gray-500  bg-gray-700"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                    className="w-full p-2 border border-gray-500  bg-gray-700"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    rows={3}
                    className="w-full p-2 border border-gray-500  bg-gray-700"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() =>
                      setProfileModal({ open: false, type: "edit" })
                    }
                    className="flex-1  py-2 rounded hover:bg-red-600">
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 rounded hover:bg-blue-600 disabled:opacity-50">
                    {loading ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
