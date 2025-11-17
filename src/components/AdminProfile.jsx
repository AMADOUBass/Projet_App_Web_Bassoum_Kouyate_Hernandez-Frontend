import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";
import logo from "../assets/logo1.webp";

const avatarUrl = logo;

export default function AdminProfile() {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axiosInstance.get("/auth/current-user/");
        setAdmin(res.data);
      } catch (err) {
        toast.error("Erreur chargement profil administrateur");
      }
    };
    fetchAdmin();
  }, []);

  if (!admin) return <p className="text-white p-4">Chargement...</p>;

  const avatarUrl = logo;

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-gray-900 text-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center space-x-4 mb-6">
        <img
          src={avatarUrl}
          alt="Photo de profil"
          className="w-20 h-20 rounded-full object-cover border-2 border-yellow-500"
        />
        <div>
          <h2 className="text-2xl font-bold">
            {admin.first_name} {admin.last_name}
          </h2>
          <p className="text-sm text-gray-400">Administrateur</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400">Email</label>
          <p className="text-lg">{admin.email}</p>
        </div>
        <div>
          <label className="block text-sm text-gray-400">Téléphone</label>
          <p className="text-lg">{admin.phone_number || "Non renseigné"}</p>
        </div>
        <div>
          <label className="block text-sm text-gray-400">Fonction</label>
          <p className="text-lg">Gestion des événements et des utilisateurs</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => toast("Fonction admin à venir")}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
        >
          ⚙️ Accéder à l’espace admin
        </button>
      </div>
    </div>
  );
}
