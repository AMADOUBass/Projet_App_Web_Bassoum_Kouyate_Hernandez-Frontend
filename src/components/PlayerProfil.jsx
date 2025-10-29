import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";

export default function PlayerProfile() {
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const res = await axiosInstance.get("/auth/current-user/");
        setPlayer(res.data);
      } catch (err) {
        toast.error("Erreur chargement profil joueur");
      }
    };
    fetchPlayer();
  }, []);

  if (!player) return <p className="text-white p-4">Chargement...</p>;

  const avatarUrl = player.profile_picture
    ? player.profile_picture
    : `https://api.dicebear.com/9.x/bottts/svg?seed=${player.id}`;

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-gray-900 text-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center space-x-4 mb-6">
        <img
          src={avatarUrl}
          alt="Photo de profil"
          className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
        />
        <div>
          <h2 className="text-2xl font-bold">
            {player.first_name} {player.last_name}
          </h2>
          <p className="text-sm text-gray-400">Joueur enregistré</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400">Email</label>
          <p className="text-lg">{player.email}</p>
        </div>
        <div>
          <label className="block text-sm text-gray-400">Téléphone</label>
          <p className="text-lg">{player.phone_number || "Non renseigné"}</p>
        </div>
        <div>
          <label className="block text-sm text-gray-400">Bio</label>
          <p className="text-lg italic">
            {player.bio || "Aucune bio pour le moment."}
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => toast("Fonction modifier à venir")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          ✏️ Modifier mon profil
        </button>
      </div>
    </div>
  );
}
