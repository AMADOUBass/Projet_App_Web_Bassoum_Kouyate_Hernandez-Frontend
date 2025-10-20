import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { Pencil, Trash2, PlusCircle, X } from "lucide-react";

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
      opponent: event.opponent?.team || "",
      is_cancelled: event.is_cancelled,
    });
    setShowModal(true);
  };

  const validateEvent = () => {
    const errors = [];

    if (!newEvent.title.trim()) errors.push("Le titre est requis.");
    if (!newEvent.event_type) errors.push("Le type d'événement est requis.");
    if (!newEvent.date_event)
      errors.push("La date de l'événement est requise.");
    if (!newEvent.location.trim()) errors.push("Le lieu est requis.");

    if (
      ["Match", "Tournoi", "Amical"].includes(newEvent.event_type) &&
      !newEvent.opponent.trim()
    ) {
      errors.push("L’adversaire est requis pour ce type d’événement.");
    }

    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      return false;
    }
    return true;
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
      opponent: ["Match", "Tournoi", "Amical"].includes(newEvent.event_type)
        ? { team: newEvent.opponent || "À définir" }
        : {},
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
        const errors = error.response.data;
        Object.entries(errors).forEach(([field, messages]) => {
          messages.forEach((msg) => toast.error(`${field}: ${msg}`));
        });
      } else {
        console.error("Erreur lors de l’envoi :", error);
        toast.error("Erreur lors de l’opération");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">📅 Événements</h2>
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
                  <td className="px-4 py-2">{event.opponent?.team || "—"}</td>
                  <td className="px-4 py-2 text-center">
                    {event.is_cancelled ? (
                      <span className="text-red-400 font-bold">Annulé ❌</span>
                    ) : (
                      <span className="text-green-400 font-bold">Actif ✅</span>
                    )}
                  </td>
                  <td className="px-4 py-2 flex gap-3 justify-center">
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl shadow-xl w-96 text-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isEdit ? "Modifier l'événement" : "Ajouter un événement"}
              </h2>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                {
                  label: "Titre",
                  required: true,
                  type: "text",
                  key: "title",
                  placeholder: "Titre de l'événement",
                },
                {
                  label: "Type d'événement",
                  required: true,
                  type: "select",
                  key: "event_type",
                  options: ["Entrainement", "Match", "Tournoi", "Amical"],
                },
                {
                  label: "Date",
                  required: true,
                  type: "datetime-local",
                  key: "date_event",
                },
                {
                  label: "Lieu",
                  required: true,
                  type: "text",
                  key: "location",
                  placeholder: "Lieu de l'événement",
                },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-left mb-1">
                    {field.label}{" "}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === "select" ? (
                    <select
                      className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
                      value={newEvent[field.key]}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          [field.key]: e.target.value,
                        })
                      }
                    >
                      <option value="">-- Sélectionnez --</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      placeholder={field.placeholder || ""}
                      className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
                      value={newEvent[field.key]}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          [field.key]: e.target.value,
                        })
                      }
                    />
                  )}
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-left mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Description"
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
                  rows="3"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-left mb-1">
                  Adversaire{" "}
                  {["Match", "Tournoi", "Amical"].includes(
                    newEvent.event_type
                  ) && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  placeholder="Nom de l'adversaire"
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
                  value={newEvent.opponent}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, opponent: e.target.value })
                  }
                />
              </div>

              {isEdit && (
                <div>
                  <label className="block text-sm font-medium text-left mb-1">
                    Statut
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={newEvent.is_cancelled}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          is_cancelled: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    Événement annulé
                  </label>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg mt-3"
              >
                {isEdit ? "Modifier" : "Enregistrer"}
              </button>
            </form>
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
