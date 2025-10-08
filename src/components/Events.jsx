import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { Pencil, Trash2, PlusCircle, X } from "lucide-react"; // Icônes modernes

export default function Event() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    eventId: null,
    title: "",
  });
  const [newEvent, setNewEvent] = useState({
    title: "",
    event_type: "",
    date_event: "",
    location: "",
    description: "",
    opponent: "",
    is_cancelled: false,
  });

  const fetchEvents = async () => {
    try {
      const response = await axiosInstance.get("/events/");
      setEvents(response.data);
    } catch (error) {
      console.error("Erreur de chargement des événements:", error);
      toast.error("Impossible de charger les événements");
    }
  };

  const handleDeleteClick = (id, title) => {
    setConfirmModal({ show: true, eventId: id, title });
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/events/${confirmModal.eventId}/`);
      toast.success("Événement supprimé !");
      setConfirmModal({ show: false, eventId: null, title: "" });
      fetchEvents();
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("Impossible de supprimer");
    }
  };

  const cancelDelete = () => {
    setConfirmModal({ show: false, eventId: null, title: "" });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/events/", newEvent);
      toast.success("Événement ajouté !");
      setShowModal(false);
      setNewEvent({
        title: "",
        event_type: "",
        date_event: "",
        location: "",
        description: "",
        opponent: "",
        is_cancelled: false,
      });
      fetchEvents();
    } catch (error) {
      console.error("Erreur lors de l’ajout:", error);
      toast.error("Erreur lors de l’ajout de l’événement");
    }
  };

  const handleEdit = (id) => {
    toast("Fonction modifier à implémenter !");
  };

  const handleDelete = async (id, title) => {
    setConfirmModal({ show: true, eventId: id, title });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">📅 Événements</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          <PlusCircle size={20} /> Ajouter
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border bg-gray-900 text-white rounded-lg">
          <thead>
            <tr className="bg-gray-800 text-left">
              <th className="px-4 py-2">Titre</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Lieu</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-400">
                  Aucun événement trouvé.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="border-t border-gray-700">
                  <td className="px-4 py-2">{event.title}</td>
                  <td className="px-4 py-2">{event.event_type}</td>
                  <td className="px-4 py-2">{event.date_event}</td>
                  <td className="px-4 py-2">{event.location}</td>
                  <td className="px-4 py-2 flex gap-3 justify-center">
                    <button
                      onClick={() => handleEdit(event.id)}
                      className="text-yellow-400 hover:text-yellow-300"
                      title="Modifier"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id, event.title)}
                      className="text-red-500 hover:text-red-400"
                      title="Supprimer"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmation */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg w-80">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Confirmation</h2>
              <button
                onClick={cancelDelete}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm mb-6">
              Voulez-vous vraiment supprimer{" "}
              <span className="font-semibold text-red-400">
                {confirmModal.title}
              </span>{" "}
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1 rounded bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl shadow-xl w-96 text-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Ajouter un événement</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <input
                type="text"
                placeholder="Titre de l'événement"
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                required
              />

              <select
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
                value={newEvent.event_type}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, event_type: e.target.value })
                }
                required
              >
                <option value="">-- Sélectionnez un type --</option>
                <option value="Entrainement">Entraînement</option>
                <option value="Match">Match</option>
                <option value="Tournoi">Tournoi</option>
                <option value="Amical">Amical</option>
              </select>

              <input
                type="datetime-local"
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
                value={newEvent.date_event}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, date_event: e.target.value })
                }
                required
              />

              <input
                type="text"
                placeholder="Lieu"
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
                value={newEvent.location}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, location: e.target.value })
                }
                required
              />

              <textarea
                placeholder="Description"
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
                rows="3"
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
              ></textarea>

              <input
                type="text"
                placeholder="Adversaires"
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
                value={newEvent.opponent}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, opponent: e.target.value })
                }
              />

              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={newEvent.is_cancelled}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, is_cancelled: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                Événement annulé
              </label>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
              >
                Enregistrer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
