import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { Pencil, Trash2, PlusCircle, X } from "lucide-react"; // Icônes modernes

export default function Event() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    event_type: "",
    date_event: "",
    location: "",
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

  useEffect(() => {
    fetchEvents();
  }, []);

  // ✅ Ajouter un événement
  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/events/", newEvent);
      toast.success("Événement ajouté !");
      setShowModal(false);
      setNewEvent({ title: "", event_type: "", date_event: "", location: "" });
      fetchEvents();
    } catch (error) {
      console.error("Erreur lors de l’ajout:", error);
      toast.error("Erreur lors de l’ajout de l’événement");
    }
  };

  // ✏️ Modifier un événement (tu pourras l’implémenter plus tard)
  const handleEdit = (id) => {
    toast("Fonction modifier à implémenter !");
  };

  // 🗑️ Supprimer un événement
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet événement ?"))
      return;
    try {
      await axiosInstance.delete(`/events/${id}/`);
      toast.success("Événement supprimé !");
      fetchEvents();
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("Impossible de supprimer");
    }
  };

  return (
    <div className="p-6">
      {/* Titre + bouton ajouter */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">📅 Événements</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          <PlusCircle size={20} /> Ajouter
        </button>
      </div>

      {/* Tableau des événements */}
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
                      onClick={() => handleDelete(event.id)}
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

      {/* Modale d’ajout d’événement */}
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
                placeholder="Titre"
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Type (ex: Match, Entraînement...)"
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
                value={newEvent.event_type}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, event_type: e.target.value })
                }
                required
              />
              <input
                type="date"
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
