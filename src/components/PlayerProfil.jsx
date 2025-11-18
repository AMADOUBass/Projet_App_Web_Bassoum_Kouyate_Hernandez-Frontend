import { useEffect, useState, useCallback } from "react";
// Assurez-vous d'importer votre instance Axios configurée
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";

export default function PlayerProfile() {
  // Définition des États
  const [playerData, setPlayerData] = useState(null);
  const [initialData, setInitialData] = useState({}); // État initial pour détecter les changements
  const [formData, setFormData] = useState({}); // Données du formulaire
  const [profileFile, setProfileFile] = useState(null); // Objet Fichier sélectionné
  const [loading, setLoading] = useState(true);
  const [serverErrors, setServerErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Fonction pour récupérer les données de profil (GET)
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/player/profile/");
      const data = response.data;

      setPlayerData(data);

      const initial = {
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        phone_number: data.phone_number || "",
        bio: data.bio || "",
        username: data.username || "",
        profile_picture: data.profile_picture || null, // URL ou null
        position: data.position || "",
        jersey_number: data.jersey_number || "",
      };
 
      setInitialData(initial);
      setFormData(initial);
      setProfileFile(null);
      setServerErrors({});
    } catch (error) {
      toast.error("Erreur chargement profil. Vous devez être connecté.");
      console.error("Fetch profile error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading && !playerData) {
    return (
      <p className="text-white p-4 text-center">Chargement du profil...</p>
    );
  }

  if (!playerData) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 rounded-lg text-center text-red-500 bg-gray-900 shadow-2xl">
        <h1 className="text-xl">Profil non disponible.</h1>
        <p className="mt-2">Assurez-vous d'être connecté en tant que Joueur.</p>
      </div>
    );
  }

  const profileToDisplay = playerData;
  return (
    <div className="max-w-4xl mx-auto mt-8 bg-gray-900 text-white p-8 rounded-lg shadow-2xl">
      <h1 className="text-3xl font-bold mb-6 border-b border-gray-700 pb-3">
        {isEditing ? "Modifier mon Profil" : "Mon Profil Joueur"}
      </h1>

      <div className="mb-6 text-right"></div>

      {!isEditing ? (
        <ViewMode player={profileToDisplay} />
      ) : (
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-400">
                Email
              </label>
              <input
                type="email"
                value={profileToDisplay.email || ""}
                disabled
                className="w-full p-2 border border-gray-500 bg-gray-700 disabled:opacity-70 cursor-not-allowed rounded-md"
              />
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

// =======================================================
// Fonctions utilitaires
// =======================================================

const ViewMode = ({ player }) => {
  const fullName = `${player.first_name || ""} ${
    player.last_name || ""
  }`.trim();

  const avatarUrl = player.profile_picture
    ? player.profile_picture
    : `https://api.dicebear.com/9.x/bottts/svg?seed=${player.id}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4 mb-6">
        <img
          src={avatarUrl}
          alt="Photo de profil"
          className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
        />
        <div>
          <h2 className="text-2xl font-bold">
            {fullName || "Nom non renseigné"}
          </h2>
          <p className="text-sm text-gray-400">
            @{player.username || "Non défini"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderDisplayField("Email", player.email)}
        {renderDisplayField(
          "Téléphone",
          player.phone_number || "Non renseigné"
        )}
        {renderDisplayField("Position", player.position || "Non renseigné")}
        {renderDisplayField(
          "N° de maillot",
          player.jersey_number || "Non renseigné"
        )}
      </div>
      {renderDisplayField(
        "Bio",
        player.bio || "Aucune bio pour le moment.",
        true
      )}
    </div>
  );
};

const renderDisplayField = (label, value, isBio = false) => (
  <div key={label}>
    <label className="block text-sm text-gray-400 font-medium">{label}</label>
    <p className={`text-lg ${isBio ? "italic mt-1" : "mt-0"}`}>{value}</p>
  </div>
);
