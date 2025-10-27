import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";

export default function NavBar({ user, onLogout }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileModal, setProfileModal] = useState({ open: false, type: "view" });  // view/edit
  const [profileData, setProfileData] = useState({});  // Fetch user data
  const [formData, setFormData] = useState({});  // For edit
  const [loading, setLoading] = useState(false);

  // Fetch profile on mount/click
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/auth/current-user/");
      setProfileData(response.data);
      setFormData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        phone_number: response.data.phone_number || '',
        bio: response.data.bio || '',
      });
    } catch (error) {
      toast.error("Erreur chargement profil");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Submit edit
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put("/player/profile/", formData);
      toast.success("Profil mis à jour !");
      setProfileModal({ open: false, type: "view" });
      fetchProfile();  // Refresh data
    } catch (error) {
      toast.error("Erreur mise à jour profil");
      console.error(error);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.clear();
    onLogout?.();  // Prop callback si besoin
    navigate("/login");
  };

  // Random football image (Unsplash placeholder, change size if needed)
  const randomFootballImg = `https://source.unsplash.com/random/40x40/?football`;

  const fullName = `${profileData.first_name || ''} ${profileData.last_name || profileData.username || 'Joueur'}`.trim();

  return (
    <nav className="bg-gray-900 p-4 flex justify-between items-center shadow-lg">
      {/* Logo/Title */}
      <div className="flex items-center space-x-2">
        <img src={randomFootballImg} alt="Football" className="w-10 h-10 rounded-full" />
        <h1 className="text-xl font-bold text-white">MyTeams ⚽</h1>
      </div>

      {/* Player Name Dropdown */}
      {user && (
        <div className="relative">
          <button
            onClick={() => {
              fetchProfile();
              setDropdownOpen(!dropdownOpen);
            }}
            className="flex items-center space-x-2 text-white hover:text-blue-400"
          >
            <img src={profileData.profile_picture || randomFootballImg} alt="Profil" className="w-8 h-8 rounded-full" />
            <span>{fullName}</span>
            <span>▼</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setProfileModal({ open: true, type: "view" });
                }}
                className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700"
              >
                👤 Consulter Profil
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setProfileModal({ open: true, type: "edit" });
                }}
                className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700"
              >
                ✏️ Modifier Profil
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-white hover:bg-red-600"
              >
                🚪 Déconnexion
              </button>
            </div>
          )}
        </div>
      )}

      {/* Profile Modal */}
      {profileModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 text-white">
            <h2 className="text-xl font-bold mb-4">
              {profileModal.type === "view" ? "Mon Profil" : "Modifier Profil"}
            </h2>
            {profileModal.type === "view" ? (
              <div className="space-y-4">
                <p><strong>Nom :</strong> {fullName}</p>
                <p><strong>Email :</strong> {profileData.email}</p>
                <p><strong>Téléphone :</strong> {profileData.phone_number || "Non renseigné"}</p>
                <p><strong>Bio :</strong> {profileData.bio || "Aucune bio."}</p>
                <button
                  onClick={() => setProfileModal({ open: false, type: "view" })}
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Prénom</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full p-2 border border-gray-500 rounded bg-gray-700 text-white"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Nom</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full p-2 border border-gray-500 rounded bg-gray-700 text-white"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Téléphone</label>
                  <input
                    type="text"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full p-2 border border-gray-500 rounded bg-gray-700 text-white"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full p-2 border border-gray-500 rounded bg-gray-700 text-white"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setProfileModal({ open: false, type: "edit" })}
                    className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-500"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                  >
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