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
  
  
  // Fonction pour gérer les changements d'input (y compris les fichiers)
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    // Gérer spécifiquement l'input de type 'file'
    if (type === 'file' && name === 'profile_picture' && files.length > 0) {
        setProfileFile(files[0]);
        // Réinitialiser la valeur de l'URL dans formData pour ne pas l'envoyer comme une chaîne
        setFormData(prev => ({ ...prev, profile_picture: null })); 
        if (serverErrors.profile_picture) {
            setServerErrors(prev => ({ ...prev, profile_picture: null }));
        }
        return; 
    }
    
    // Gérer les autres inputs
    setFormData({ ...formData, [name]: value });
    if (serverErrors[name]) {
        setServerErrors(prev => ({ ...prev, [name]: null }));
    }
  };

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
  
  
const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServerErrors({});

    const formDataToSend = new FormData();
    
    // Ajoutez tous les champs du formulaire au FormData
    Object.keys(formData).forEach(key => {
        if (key !== 'profile_picture' && formData[key] !== initialData[key]) {
            formDataToSend.append(key, formData[key] || '');
        }
    });

    // Gestion spéciale pour l'image de profil
    if (profileFile) {
        formDataToSend.append('profile_picture', profileFile);
    }

    try {
        const response = await axiosInstance.patch("/player/profile/", formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        setPlayerData(response.data);
        setIsEditing(false);
        toast.success("Profil mis à jour avec succès!");
    } catch (error) {
        console.error("Update error:", error.response?.data);
        if (error.response?.status === 400) {
            setServerErrors(error.response.data);
            toast.error("Veuillez corriger les erreurs dans le formulaire.");
        } else {
            toast.error("Erreur lors de la mise à jour du profil.");
        }
    } finally {
        setLoading(false);
    }
};
  if (loading && !playerData) {
    return <p className="text-white p-4 text-center">Chargement du profil...</p>;
  }

  if (!playerData) {
     return <div className="max-w-4xl mx-auto mt-8 p-6 rounded-lg text-center text-red-500 bg-gray-900 shadow-2xl">
        <h1 className="text-xl">Profil non disponible.</h1>
        <p className="mt-2">Assurez-vous d'être connecté en tant que Joueur.</p>
    </div>;
  }
  
  const profileToDisplay = playerData;

  // Rendu du composant
  return (
    <div className="max-w-4xl mx-auto mt-8 bg-gray-900 text-white p-8 rounded-lg shadow-2xl">
      <h1 className="text-3xl font-bold mb-6 border-b border-gray-700 pb-3">
        {isEditing ? "Modifier mon Profil" : "Mon Profil Joueur"}
      </h1>

      <div className="mb-6 text-right">
        <button
          onClick={() => {
            setIsEditing(!isEditing);
            // Si on annule, réinitialiser le formulaire
            if (isEditing) {
                setFormData(initialData);
                setProfileFile(null);
            }
            setServerErrors({});
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors">
          {isEditing ? "Annuler l'édition" : "Modifier le Profil"}
        </button>
      </div>

      {!isEditing ? (
        <ViewMode player={profileToDisplay} /> 
      ) : (
        <form onSubmit={handleUpdateProfile} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-gray-400">Email</label>
                    <input
                      type="email"
                      value={profileToDisplay.email || ""} 
                      disabled
                      className="w-full p-2 border border-gray-500 bg-gray-700 disabled:opacity-70 cursor-not-allowed rounded-md"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInputField({ label: "Nom d'utilisateur", name: "username", value: formData.username, onChange: handleChange, error: serverErrors.username })}
                {renderInputField({ label: "Prénom", name: "first_name", value: formData.first_name, onChange: handleChange, error: serverErrors.first_name })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInputField({ label: "Nom de famille", name: "last_name", value: formData.last_name, onChange: handleChange, error: serverErrors.last_name })}
                {renderInputField({ label: "Numéro de téléphone", name: "phone_number", value: formData.phone_number, onChange: handleChange, error: serverErrors.phone_number })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {renderInputField({ label: "Position", name: "position", value: formData.position, onChange: handleChange, error: serverErrors.position })}
                 {renderInputField({ label: "N° de maillot", name: "jersey_number", type: "number", value: formData.jersey_number, onChange: handleChange, error: serverErrors.jersey_number })}
            </div>
            {/* Bio (Textarea) */}
            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio || ""}
                onChange={handleChange}
                rows={3}
                className={`w-full p-2 border bg-gray-700 ${serverErrors.bio ? 'border-red-500 focus:border-red-500' : 'border-gray-500'} rounded-md`}
              />
              {serverErrors.bio && (<div className="text-red-400 text-xs mt-1">{serverErrors.bio[0]}</div>)}
            </div>

            {/* Input de Fichier */}
            {renderFileInput({ 
                label: "Image de profil", 
                name: "profile_picture", 
                currentUrl: initialData.profile_picture, 
                selectedFile: profileFile,
                onFileChange: handleChange,
                onClear: () => { 
                    setProfileFile(null); 
                    setFormData(prev => ({ ...prev, profile_picture: null })); // Déclenche la suppression au PATCH
                }, 
                error: serverErrors.profile_picture 
            })}

            {/* Boutons d'action et erreurs globales */}
            <div className="flex space-x-4 pt-4">
              <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 rounded bg-gray-700 hover:bg-gray-600">Annuler</button>
              <button type="submit" disabled={loading} className="flex-1 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors">
                {loading ? "Sauvegarder..." : "Sauvegarder"}
              </button>
            </div>
            {serverErrors.non_field_errors && (<div className="text-red-400 text-sm mt-3 p-2 border border-red-500 rounded">{serverErrors.non_field_errors[0]}</div>)}
        </form>
      )}
    </div>
  );
}

// =======================================================
// Fonctions utilitaires
// =======================================================

const ViewMode = ({ player }) => {
 
    const fullName = `${player.first_name || ""} ${player.last_name || ""}`.trim();

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
                  <p className="text-sm text-gray-400">@{player.username || "Non défini"}</p>
                </div>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderDisplayField("Email", player.email)}
                {renderDisplayField("Téléphone", player.phone_number || "Non renseigné")}
                {renderDisplayField("Position", player.position || "Non renseigné")}
                {renderDisplayField("N° de maillot", player.jersey_number || "Non renseigné")}
            </div>
            {renderDisplayField("Bio", player.bio || "Aucune bio pour le moment.", true)}
        </div>
    );
}

const renderDisplayField = (label, value, isBio = false) => (
    <div key={label}>
        <label className="block text-sm text-gray-400 font-medium">{label}</label>
        <p className={`text-lg ${isBio ? 'italic mt-1' : 'mt-0'}`}>{value}</p>
    </div>
);

const renderFileInput = ({ label, name, currentUrl, selectedFile, onFileChange, onClear, error }) => (
    <div key={name}>
        <label className="block text-sm font-medium mb-2">{label}</label>
        <div className="flex items-center space-x-2">
            <input
              type="file"
              name={name}
              onChange={onFileChange}
              accept="image/*"
              className={`w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 hover:file:bg-blue-500 file:text-white transition-colors cursor-pointer ${error ? 'border-red-500' : 'border-gray-500'}`}
            />
            
            {(currentUrl || selectedFile) && (
                <button
                    type="button"
                    onClick={onClear}
                    className="p-2 text-sm rounded bg-red-600 hover:bg-red-500 transition-colors text-white whitespace-nowrap"
                    title="Supprimer l'image actuelle"
                >
                    Effacer
                </button>
            )}
        </div>
        
        {(currentUrl && !selectedFile) && (
             <p className="text-xs text-gray-400 mt-1">Image actuelle conservée.</p>
        )}
        {selectedFile && (
             <p className="text-xs text-green-400 mt-1">Fichier sélectionné : **{selectedFile.name}**</p>
        )}
        {(!currentUrl && !selectedFile && !error) && (
             <p className="text-xs text-gray-400 mt-1">Aucune image.</p>
        )}
        {error && (
          <div className="text-red-400 text-xs mt-1">
            {error[0]} 
          </div>
        )}
    </div>
);

const renderInputField = ({ label, name, value, onChange, error, type = "text" }) => (
  <div key={name}>
    <label className="block text-sm font-medium mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value || (type === "number" ? "" : "")}
      onChange={onChange}
      className={`w-full p-2 border bg-gray-700 rounded-md ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-500'}`}
    />
    {error && (
      <div className="text-red-400 text-xs mt-1">
        {error[0]} 
      </div>
    )}
  </div>
);