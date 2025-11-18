import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { Pencil, Trash2, PlusCircle, Users } from "lucide-react";

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

  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [players, setPlayers] = useState([]);
  const [selectedEventTitle, setSelectedEventTitle] = useState("");
  const [selectedEventDate, setSelectedEventDate] = useState(null);
  const [selectedEventType, setSelectedEventType] = useState(""); // <-- Ajouté

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

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axiosInstance.get("/events/");
      setEvents(response.data);
    } catch (error) {
      console.error("Erreur de chargement des événements:", error);
      toast.error("Impossible de charger les événements");
    }
  };

  // --- Gestion suppression ---
  const handleDelete = (id, title) =>
    setConfirmModal({ show: true, eventId: id, title });
  const cancelDelete = () =>
    setConfirmModal({ show: false, eventId: null, title: "" });

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/events/${confirmModal.eventId}/`);
      toast.success("Événement supprimé !");
      cancelDelete();
      fetchEvents();
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("Impossible de supprimer");
    }
  };

  // --- Gestion ajout / édition ---
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

  const validateEvent = () => {
    const newErrors = {};
    if (!newEvent.title.trim()) newErrors.title = "Le titre est requis.";
    if (!newEvent.event_type)
      newErrors.event_type = "Le type d'événement est requis.";
    if (!newEvent.date_event) newErrors.date_event = "La date est requise.";
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
    const payload = { ...newEvent, date_event: dateISO };

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
      console.error("Erreur lors de l’opération :", error);
      toast.error("Erreur lors de l’opération");
    }
  };

  const handleShowPlayers = async (event) => {
    try {
      const response = await axiosInstance.get(
        `/admin/event/${event.id}/participations/`
      );

      const attending = response.data.filter((p) => p.will_attend === true);
      setPlayers(attending);
      setSelectedEventTitle(event.title);
      setShowPlayersModal(true);
    } catch (error) {
      console.error("Erreur de chargement des joueurs:", error);
      toast.error("Impossible de charger la liste des joueurs");
    }
  };

  

  const handleStatChange = (index, field, value) => {
    if (value < 0) return;
    const updatedPlayers = [...players];
    updatedPlayers[index][field] = value;
    setPlayers(updatedPlayers);
  };

  const saveAllStats = async () => {
    if (new Date() < selectedEventDate) {
      toast.error(
        "Impossible de modifier les stats avant que l'événement soit passé !"
      );
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const p of players) {
      const payload = {
        performance: p.performance ?? 0,
        cartonJaune: p.cartonJaune ?? 0,
        cartonRouge: p.cartonRouge ?? 0,
        buts: p.buts ?? 0,
        passe: p.passe ?? 0,
      };
      try {
        await axiosInstance.put(
          `/admin/participation/${p.id}/update/`,
          payload
        );
        successCount++;
      } catch (error) {
        console.error("Erreur enregistrement stats:", error);
        errorCount++;
      }
    }

    if (successCount > 0)
      toast.success(`${successCount} joueur(s) mis à jour !`);
    if (errorCount > 0)
      toast.error(`${errorCount} erreur(s) lors de l'enregistrement.`);

    if (successCount > 0) {
      setShowPlayersModal(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header & Ajouter */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold mb-11">📅 Événements</h1>
        <button
          type="button"
          onClick={() => {
            setShowModal(true);
            setErrors({});
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg shadow hover:bg-gray-300 transition">
          <PlusCircle size={20} /> Ajouter
        </button>
      </div>

      {/* Table événements */}
      <div className="overflow-x-auto">
        <table className="min-w-full border mt-4">
          <thead className="bg-gray-600 text-white">
            <tr className="text-left">
              <th className="px-4 py-2">Titre</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Lieu</th>
              <th className="px-4 py-2">Opposition</th>
              <th className="px-4 py-2">État</th>
              <th className="px-4 py-2">Disponibles</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  Aucun événement trouvé.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="border-t">
                  <td className="px-4 py-2">{event.title}</td>
                  <td className="px-4 py-2">{event.event_type}</td>
                  <td className="px-4 py-2">
                    {event.date_event
                      ? new Date(event.date_event).toLocaleString("fr-FR")
                      : "—"}
                  </td>
                  <td className="px-4 py-2">{event.location}</td>
                  <td className="px-4 py-2">{event.opponent || "—"}</td>
                  <td className="px-4 py-2">
                    {event.is_cancelled ? "Annulé ❌" : "Actif ✅"}
                  </td>
                  <td className="px-4 py-2 flex gap-3 justify-center">
                    <button
                      onClick={() => handleShowPlayers(event)}
                      className="text-blue-600"
                      title="Voir joueurs"
                    >
                      <Users size={20} />
                    </button>
                    <button
                      onClick={() => handleEdit(event)}
                      className="text-yellow-500"
                      title="Modifier"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id, event.title)}
                      className="text-red-600"
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

      {/* Modal Ajout / Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 overflow-auto">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full shadow-lg">
            <h3 className="text-xl font-bold mb-4">
              {isEdit ? "Modifier l'événement" : "Ajouter un événement"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Titre */}
              <div className="flex flex-col">
                <label className="font-medium mb-1 text-left">Titre</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title}</p>
                )}
              </div>

              {/* Type */}
              <div className="flex flex-col">
                <label className="font-medium mb-1 text-left">Type</label>
                <select
                  value={newEvent.event_type}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, event_type: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Sélectionnez le type</option>
                  {["Entrainement", "Match", "Tournoi", "Amical"].map(
                    (type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    )
                  )}
                </select>
                {errors.event_type && (
                  <p className="text-red-500 text-sm">{errors.event_type}</p>
                )}
              </div>

              {/* Date */}
              <div className="flex flex-col">
                <label className="font-medium mb-1 text-left">
                  Date & Heure
                </label>
                <input
                  type="datetime-local"
                  value={newEvent.date_event}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, date_event: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
                {errors.date_event && (
                  <p className="text-red-500 text-sm">{errors.date_event}</p>
                )}
              </div>

              {/* Lieu */}
              <div className="flex flex-col">
                <label className="font-medium mb-1 text-left">Lieu</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, location: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
                {errors.location && (
                  <p className="text-red-500 text-sm">{errors.location}</p>
                )}
              </div>

              {/* Adversaire */}
              {["Match", "Tournoi", "Amical"].includes(newEvent.event_type) && (
                <div className="flex flex-col">
                  <label className="font-medium mb-1 text-left">
                    Adversaire
                  </label>
                  <input
                    type="text"
                    value={newEvent.opponent}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, opponent: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                  {errors.opponent && (
                    <p className="text-red-500 text-sm">{errors.opponent}</p>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="flex flex-col">
                <label className="font-medium mb-1 text-left">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>

              {/* Annulé */}
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
                />
                <label>Événement annulé</label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isEdit ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmation Suppression */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full shadow-lg">
            <h3 className="text-xl font-bold">
              Supprimer "{confirmModal.title}" ?
            </h3>
            <div className="flex gap-4 mt-4 justify-end">
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Supprimer
              </button>
              <button
                onClick={cancelDelete}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Joueurs */}
      {showPlayersModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 overflow-auto">
          <div className="bg-white p-6 rounded-lg max-w-5xl w-full shadow-lg">
            <h3 className="text-xl font-bold mb-4">
              Participation à {selectedEventTitle}
            </h3>

            <table className="w-full text-gray-800 border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-2 py-1 border text-left">Joueur</th>
                  <th className="px-2 py-1 border text-left">Performance</th>
                  <th className="px-2 py-1 border text-left">Carton Jaune</th>
                  <th className="px-2 py-1 border text-left">Carton Rouge</th>
                  <th className="px-2 py-1 border text-left">Buts</th>
                  <th className="px-2 py-1 border text-left">Passes</th>
                </tr>
              </thead>

              <tbody>
                {players.map((p, index) => {
                  const eventPassed = new Date() >= selectedEventDate;
                  const isTraining = selectedEventType === "Entrainement"; // type d'événement actuel

                  return (
                    <tr key={p.id}>
                      <td className="px-2 py-1 border font-medium">
                        #{p.player_number} {p.player_name}{" "}
                        <span className="text-gray-500">
                          ({p.player_position || "—"})
                        </span>
                      </td>

                      {/* Champs modifiables */}
                      {[
                        "performance",
                        "cartonJaune",
                        "cartonRouge",
                        "buts",
                        "passe",
                      ].map((field) => {
                        // Si c'est un entrainement, seul performance est modifiable
                        const isDisabled =
                          !eventPassed ||
                          (isTraining && field !== "performance");

                        return (
                          <td key={field} className="px-2 py-1 border">
                            <input
                              type="number"
                              step={field === "performance" ? "0.1" : "1"}
                              min={0}
                              max={
                                field === "cartonJaune"
                                  ? 2
                                  : field === "cartonRouge"
                                  ? 1
                                  : undefined
                              }
                              disabled={isDisabled}
                              value={p[field] ?? 0}
                              onChange={(e) => {
                                let value = parseFloat(e.target.value);
                                if (value < 0) value = 0;
                                if (field === "cartonJaune" && value > 2)
                                  value = 2;
                                if (field === "cartonRouge" && value > 1)
                                  value = 1;
                                handleStatChange(index, field, value);
                              }}
                              className={`w-full p-1 rounded border ${
                                isDisabled ? "bg-gray-200" : "bg-white"
                              }`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="flex gap-4 mt-4 justify-end">
              <button
                onClick={saveAllStats}
                disabled={new Date() < selectedEventDate}
                className={`px-4 py-2 rounded text-white ${
                  new Date() < selectedEventDate
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Enregistrer
              </button>

              <button
                onClick={() => setShowPlayersModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}