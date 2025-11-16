import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { Pencil, Trash2 } from "lucide-react";

export default function PlayerList() {
  const [players, setPlayers] = useState([]);
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    position: "",
    jersey_number: "",
    is_available: true,
    user: {
      id: "",
      first_name: "",
      last_name: "",
      phone_number: "",
    },
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await axiosInstance.get("/admin/players/");
      setPlayers(response.data);
    } catch (error) {
      toast.error("Erreur lors de la récupération des joueurs.");
    }
  };

  const startEditing = (player) => {
    setEditingPlayerId(player.id);
    setEditForm({
      position: player.position || "",
      jersey_number: player.jersey_number || "",
      is_available: player.is_available,
      user: {
        id: player.user.id,
        first_name: player.user.first_name || "",
        last_name: player.user.last_name || "",
        phone_number: player.user.phone_number || "",
      },
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const cancelEditing = () => {
    setEditingPlayerId(null);
    setIsModalOpen(false);
    setEditForm({
      position: "",
      jersey_number: "",
      is_available: true,
      user: {
        first_name: "",
        last_name: "",
        phone_number: "",
      },
    });
    setErrors({});
  };
  const hasInternalSpace = (text) => /\s/.test(text.trim());

  const isValidPhoneNumber = (number) => {
    const cleaned = number.trim();
    const regex = /^(\d{10}|\d{3}-\d{3}-\d{4})$/;
    return regex.test(cleaned);
  };

  const validateForm = () => {
    const trimmedForm = {
      ...editForm,
      position: editForm.position.trim(),
      jersey_number: editForm.jersey_number,
      user: {
        ...editForm.user,
        first_name: editForm.user.first_name.trim(),
        last_name: editForm.user.last_name.trim(),
        phone_number: editForm.user.phone_number.trim(),
      },
    };

    const newErrors = {};
    if (!trimmedForm.user.first_name || /\s/.test(trimmedForm.user.first_name))
      newErrors.first_name = "Prénom invalide";
    if (!trimmedForm.user.last_name || /\s/.test(trimmedForm.user.last_name))
      newErrors.last_name = "Nom invalide";
    if (!trimmedForm.user.phone_number)
      newErrors.phone_number = "Téléphone requis";
    else if (!isValidPhoneNumber(trimmedForm.user.phone_number))
      newErrors.phone_number = "Format de téléphone invalide";
    if (!trimmedForm.position) newErrors.position = "Poste obligatoire";
    if (!trimmedForm.jersey_number || isNaN(trimmedForm.jersey_number))
      newErrors.jersey_number = "Numéro valide requis";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setEditForm(trimmedForm);
      return true;
    }

    return false;
  };

  const savePlayer = async (playerId) => {
    if (!validateForm()) return;

    try {
      await axiosInstance.put(`/admin/players/${playerId}/`, {
        position: editForm.position,
        jersey_number: editForm.jersey_number,
        is_available: editForm.is_available,
      });
      const formData = new FormData();
      formData.append("first_name", editForm.user.first_name);
      formData.append("last_name", editForm.user.last_name);
      formData.append("phone_number", editForm.user.phone_number);
      if (editForm.user.profile_picture instanceof File) {
        formData.append("profile_picture", editForm.user.profile_picture);
      }

      await axiosInstance.put(`/admin/users/${editForm.user.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchPlayers();
      cancelEditing();
      toast.success("Joueur mis à jour !");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  const handleConfirmedDelete = async (playerId) => {
    try {
      await axiosInstance.delete(`/admin/players/${playerId}/delete-both/`);
      setPlayers(players.filter((p) => p.id !== playerId));
      toast.success("Joueur et compte utilisateur supprimés avec succès.");
    } catch (error) {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setConfirmDeleteId(null);
    }
  };
  const footballPositions = [
    "Gardien",
    "Défenseur central",
    "Latéral gauche",
    "Latéral droit",
    "Milieu défensif",
    "Milieu central",
    "Milieu offensif",
    "Ailier gauche",
    "Ailier droit",
    "Attaquant",
  ];

  return (
    <div className="p-4 bg-white rounded shadow">
      <h1 className="text-4xl font-bold mb-11"> 🏃‍♂️ Liste des Joueurs</h1>

      <table className="min-w-full border mt-4">
        <thead className="bg-gray-600 text-white">
          <tr>
            <th className="px-4 py-2 text-left">Nom</th>
            <th className="px-4 py-2 text-left">Poste</th>
            <th className="px-4 py-2 text-left">N° Maillot</th>
            <th className="px-4 py-2 text-left">Disponible</th>
            <th className="px-4 py-2 text-left">Au Club Depuis</th>
            <th className="px-4 py-2 text-left">Numéro de Téléphone</th>
            <th className="px-4 py-2 text-left">Photo</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {players.map((player) => (
            <tr key={player.id} className="border-t">
              <td className="px-4 py-2">
                {player.user.first_name} {player.user.last_name}
              </td>
              <td className="px-4 py-2">{player.position || "—"}</td>
              <td className="px-4 py-2">{player.jersey_number ?? "—"}</td>
              <td className="px-4 py-2">
                {player.is_available ? "✅ Disponible" : "❌ Indisponible"}
              </td>
              <td className="px-4 py-2">
                {new Date(player.created_at).toLocaleDateString("fr-CA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </td>
              <td className="px-4 py-2">{player.user.phone_number || "—"}</td>
              <td className="px-4 py-2">
                {player.user.profile_picture ? (
                  <img
                    src={player.user.profile_picture}
                    alt="Photo de profil"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 italic">Aucune photo</span>
                )}
              </td>
              <td className="px-2 py-2 flex items-center justify-center space-x-2">
                <button
                  type="button"
                  onClick={() => startEditing(player)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(player.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal d'édition */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Modifier le joueur</h3>

            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  value={editForm.user.first_name}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      user: { ...editForm.user, first_name: e.target.value },
                    })
                  }
                  placeholder="Prénom"
                  className="w-full border px-3 py-2 rounded"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-sm">{errors.first_name}</p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  value={editForm.user.last_name}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      user: { ...editForm.user, last_name: e.target.value },
                    })
                  }
                  placeholder="Nom"
                  className="w-full border px-3 py-2 rounded"
                />
                {errors.last_name && (
                  <p className="text-red-500 text-sm">{errors.last_name}</p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  value={editForm.user.phone_number}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      user: { ...editForm.user, phone_number: e.target.value },
                    })
                  }
                  placeholder="Téléphone"
                  className="w-full border px-3 py-2 rounded"
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-sm">{errors.phone_number}</p>
                )}
              </div>

              <div>
                <select
                  value={editForm.position}
                  onChange={(e) =>
                    setEditForm({ ...editForm, position: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded">
                  <option value="">Sélectionner un poste</option>
                  {footballPositions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
                {errors.position && (
                  <p className="text-red-500 text-sm">{errors.position}</p>
                )}
              </div>

              <div>
                <input
                  type="number"
                  value={editForm.jersey_number}
                  onChange={(e) =>
                    setEditForm({ ...editForm, jersey_number: e.target.value })
                  }
                  placeholder="Numéro de maillot"
                  className="w-full border px-3 py-2 rounded"
                />
                {errors.jersey_number && (
                  <p className="text-red-500 text-sm">{errors.jersey_number}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="profilePicture"
                  className="w-full border text-left px-4 py-2 rounded cursor-pointer inline-block">
                  Changer Photo de Profil
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setEditForm((prev) => ({
                      ...prev,
                      user: { ...prev.user, profile_picture: file },
                    }));
                  }}
                  className="hidden"
                />

                {editForm.user.profile_picture &&
                  typeof editForm.user.profile_picture === "object" && (
                    <p className="text-sm mt-1">
                      Fichier sélectionné: {editForm.user.profile_picture.name}
                    </p>
                  )}
              </div>

              <div>
                <select
                  value={editForm.is_available ? "true" : "false"}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      is_available: e.target.value === "true",
                    })
                  }
                  className="w-full border px-3 py-2 rounded">
                  <option value="true">✅ Disponible</option>
                  <option value="false">❌ Indisponible</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => savePlayer(editingPlayerId)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                Enregistrer
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal de confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              🗑️ Supprimer ce joueur ?
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Cette action est irréversible. Le compte et ses données seront
              définitivement supprimés.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded">
                Annuler
              </button>
              <button
                onClick={() => handleConfirmedDelete(confirmDeleteId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
