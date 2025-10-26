import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { Pencil, Trash2, PlusCircle, X, Users } from "lucide-react";

export default function Event() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editEventId, setEditEventId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    eventId: null,
    title: "",
  });

  // ✅ Modal pour afficher les joueurs
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [players, setPlayers] = useState([]);
  const [selectedEventTitle, setSelectedEventTitle] = useState("");

  const [newEvent, setNewEvent] = useState({
    title: "",
    event_type: "",
    date_event: "",
    location: "",
    description: "",
    opponent: "",
    is_cancelled: false,
  });

  const [errors, setErrors] = useState({});

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

  const handleDelete = (id, title) => {
    setConfirmModal({ show: true, eventId: id, title });
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/events/${confirmModal.eventId}/`);
      toast.success("Événement supprimé avec succès !");
      setEvents(events.filter((ev) => ev.id !== confirmModal.eventId));
      setConfirmModal({ show: false, eventId: null, title: "" });
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("Impossible de supprimer l'événement");
    }
  };

  const cancelDelete = () => {
    setConfirmModal({ show: false, eventId: null, title: "" });
  };

  const handleEdit = (event) => {
    setIsEdit(true);
    setEditEventId(event.id);
    setNewEvent({
      title: event.title,
      event_type: event.event_type,
      date_event: event.date_event?.slice(0, 16) || "",
      location: event.location,
      description: event.description,
      opponent: event.opponent || "",
      is_cancelled: event.is_cancelled,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleShowPlayers = async (event) => {
    try {
      const response = await axiosInstance.get(
        `/admin/event/${event.id}/participations/`
      );
      setPlayers(response.data);
      setSelectedEventTitle(event.title);
      setShowPlayersModal(true);
    } catch (error) {
      console.error("Erreur de chargement des joueurs:", error);
      toast.error("Impossible de charger la liste des joueurs");
    }
  };

  const validateEvent = () => {
    const newErrors = {};
    if (!newEvent.title.trim()) newErrors.title = "Le titre est requis.";
    if (!newEvent.event_type)
      newErrors.event_type = "Le type d'événement est requis.";
    if (!newEvent.date_event)
      newErrors.date_event = "La date de l'événement est requise.";
    if (!newEvent.location.trim()) newErrors.location = "Le lieu est requis.";
    if (
      ["Match", "Tournoi", "Amical"].includes(newEvent.event_type) &&
      !newEvent.opponent.trim()
    ) {
      newErrors.opponent = "L’adversaire est requis pour ce type d’événement.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEvent()) return;

    const dateISO = newEvent.date_event
      ? new Date(newEvent.date_event).toISOString()
      : null;

    const payload = {
      ...newEvent,
      date_event: dateISO,
      opponent: newEvent.opponent || "",
    };

    try {
      if (isEdit) {
        await axiosInstance.put(`/events/${editEventId}/`, payload);
        toast.success("Événement modifié !");
      } else {
        await axiosInstance.post("/events/", payload);
        toast.success("Événement ajouté !");
      }

      setShowModal(false);
      setIsEdit(false);
      setEditEventId(null);
      setErrors({});
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
      if (error.response && error.response.status === 400) {
        const apiErrors = {};
        Object.entries(error.response.data).forEach(([field, messages]) => {
          apiErrors[field] = messages.join(" ");
        });
        setErrors(apiErrors);
      } else {
        console.error("Erreur lors de l’envoi :", error);
        toast.error("Erreur lors de l’opération");
      }
    }
  };

  return (
    <div className="p-6">
      {/* --- En-tête --- */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">📅 Événements</h2>
        <button
          onClick={() => {
            setShowModal(true);
            setErrors({});
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          <PlusCircle size={20} /> Ajouter
        </button>
      </div>

      {/* --- Tableau des événements --- */}
      <div className="overflow-x-auto">
        <table className="min-w-full border bg-gray-900 text-white rounded-lg">
          <thead>
            <tr className="bg-gray-800 text-left">
              <th className="px-4 py-2">Titre</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Lieu</th>
              <th className="px-4 py-2">Adversaire</th>
              <th className="px-4 py-2">État</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-400">
                  Aucun événement trouvé.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="border-t border-gray-700">
                  <td className="px-4 py-2">{event.title}</td>
                  <td className="px-4 py-2">{event.event_type}</td>
                  <td className="px-4 py-2">
                    {event.date_event
                      ? new Date(event.date_event).toLocaleString("fr-FR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-2">{event.location}</td>
                  <td className="px-4 py-2">{event.opponent || "—"}</td>
                  <td className="px-4 py-2 text-center">
                    {event.is_cancelled ? (
                      <span className="text-red-400 font-bold">Annulé ❌</span>
                    ) : (
                      <span className="text-green-400 font-bold">Actif ✅</span>
                    )}
                  </td>
                  <td className="px-4 py-2 flex gap-3 justify-center">
                    <button
                      onClick={() => handleShowPlayers(event)}
                      className="text-blue-400 hover:text-blue-300"
                      title="Voir joueurs"
                    >
                      <Users size={20} />
                    </button>
                    <button
                      onClick={() => handleEdit(event)}
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
      {/* --- Modal d’ajout / modification d’événement --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-2xl w-[600px] max-h-[90vh] overflow-y-auto">
            {/* --- En-tête --- */}
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
              <h3 className="text-xl font-semibold">
                {isEdit ? "✏️ Modifier l’événement" : "➕ Nouvel événement"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setIsEdit(false);
                  setEditEventId(null);
                  setNewEvent({
                    title: "",
                    event_type: "",
                    date_event: "",
                    location: "",
                    description: "",
                    opponent: "",
                    is_cancelled: false,
                  });
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            {/* --- Formulaire --- */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* --- Titre --- */}
              <div>
                <label className="block text-sm font-medium mb-1 text-left">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  className={`w-full bg-gray-800 p-2 rounded-lg text-white border ${
                    errors.title
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-700 focus:border-blue-500"
                  } outline-none transition-colors`}
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* --- Type d’événement --- */}
              <div>
                <label className="block text-sm font-medium mb-1 text-left">
                  Type d’événement <span className="text-red-500">*</span>
                </label>
                <select
                  value={newEvent.event_type}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, event_type: e.target.value })
                  }
                  className={`w-full bg-gray-800 p-2 rounded-lg text-white border ${
                    errors.event_type
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-700 focus:border-blue-500"
                  } outline-none transition-colors`}
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="Entrainement">Entraînement</option>
                  <option value="Match">Match</option>
                  <option value="Tournoi">Tournoi</option>
                  <option value="Amical">Amical</option>
                </select>
                {errors.event_type && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.event_type}
                  </p>
                )}
              </div>

              {/* --- Date et heure --- */}
              <div>
                <label className="block text-sm font-medium mb-1 text-left">
                  Date et heure <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={newEvent.date_event}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, date_event: e.target.value })
                  }
                  className={`w-full bg-gray-800 p-2 rounded-lg text-white border ${
                    errors.date_event
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-700 focus:border-blue-500"
                  } outline-none transition-colors`}
                />
                {errors.date_event && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.date_event}
                  </p>
                )}
              </div>

              {/* --- Lieu --- */}
              <div>
                <label className="block text-sm font-medium mb-1 text-left">
                  Lieu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, location: e.target.value })
                  }
                  className={`w-full bg-gray-800 p-2 rounded-lg text-white border ${
                    errors.location
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-700 focus:border-blue-500"
                  } outline-none transition-colors`}
                />
                {errors.location && (
                  <p className="text-red-400 text-sm mt-1">{errors.location}</p>
                )}
              </div>

              {/* --- Adversaire --- */}
              <div>
                <label className="block text-sm font-medium mb-1 text-left">
                  Adversaire
                </label>
                <input
                  type="text"
                  value={newEvent.opponent}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, opponent: e.target.value })
                  }
                  className={`w-full bg-gray-800 p-2 rounded-lg text-white border ${
                    errors.opponent
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-700 focus:border-blue-500"
                  } outline-none transition-colors`}
                />
                {errors.opponent && (
                  <p className="text-red-400 text-sm mt-1">{errors.opponent}</p>
                )}
              </div>

              {/* --- Description --- */}
              <div>
                <label className="block text-sm font-medium mb-1 text-left">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  className="w-full bg-gray-800 p-2 rounded-lg text-white border border-gray-700 focus:border-blue-500 outline-none"
                />
              </div>

              {/* --- Événement annulé --- */}
              {isEdit && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newEvent.is_cancelled}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        is_cancelled: e.target.checked,
                      })
                    }
                    className="accent-blue-600"
                  />
                  <span className="text-sm">Événement annulé</span>
                </div>
              )}

              {/* --- Boutons --- */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setIsEdit(false);
                    setEditEventId(null);
                  }}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white"
                >
                  {isEdit ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Modal des joueurs --- */}
      {showPlayersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-2xl w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
            {/* --- En-tête du modal --- */}
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
              <h3 className="text-xl font-semibold">
                Liste des participants à l’événement –{" "}
                <span className="text-blue-400">{selectedEventTitle}</span>
              </h3>
            </div>

            {/* --- Corps du modal --- */}
            <div className="flex-1 overflow-y-auto pr-2">
              {players.length === 0 ? (
                <p className="text-gray-400 text-center mt-8">
                  Aucun joueur inscrit à cet événement.
                </p>
              ) : (
                <table className="w-full border border-gray-800 rounded-lg overflow-hidden">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left">Nom</th>
                      <th className="px-4 py-2 text-left">Position</th>
                      <th className="px-4 py-2 text-left">Disponible</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((participation) => (
                      <tr
                        key={participation.id}
                        className="border-t border-gray-700 hover:bg-gray-800 transition"
                      >
                        <td className="px-4 py-2">
                          {participation.player_name}
                        </td>
                        <td className="px-4 py-2">
                          {participation.player_position || "-"}
                        </td>
                        <td className="px-4 py-2">
                          {participation.will_attend ? "Non" : "Oui"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* --- Pied du modal --- */}
            <div className="mt-6 flex justify-end border-t border-gray-700 pt-4">
              <button
                onClick={() => setShowPlayersModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-80 text-center">
            <h3 className="text-lg font-semibold mb-4">
              Supprimer l’événement ?
            </h3>
            <p className="text-gray-400 mb-6">
              Êtes-vous sûr de vouloir supprimer{" "}
              <span className="text-red-400 font-semibold">
                {confirmModal.title}
              </span>{" "}
              ?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Supprimer
              </button>
              <button
                onClick={cancelDelete}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
