import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [modal, setModal] = useState({
    open: false,
    eventId: null,
    reason: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axiosInstance.get("/player/my-participations/");
      setEvents(response.data);
      console.log("Événements récupérés :", response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des événements :", error);
      toast.error("Impossible de charger vos événements.");
    }
  };

  // Refuser avec modal
  const handleRefuse = async () => {
    if (!modal.reason) {
      toast.error("Vous devez fournir un motif de refus.");
      return;
    }

    try {
      await axiosInstance.put(`/player/participation/${modal.eventId}/`, {
        will_attend: false,
        refusal_reason: modal.reason,
      });
      toast.success("Votre refus a été enregistré !");
      setModal({ open: false, eventId: null, reason: "" });
      fetchEvents();
    } catch (error) {
      console.error("Erreur lors du refus :", error);
      toast.error("Impossible de mettre à jour la participation.");
    }
  };

  const handleCancel = async (eventId) => {
    if (!confirm("Voulez-vous vraiment annuler votre choix ?")) return;
    try {
      await axiosInstance.put(`/player/participation/${eventId}/`, {
        will_attend: null,
        refusal_reason: "",
      });
      toast.success("Participation réinitialisée !");
      fetchEvents();
      toast.success("Votre réponse a été enregistrée !");
      fetchEvents();
    } catch (error) {
      console.error("Erreur lors de l’annulation :", error);
      toast.error("Impossible d’annuler la participation.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date invalide";
    const safeDate = dateString.replace(" ", "T");
    const date = new Date(safeDate);
    if (isNaN(date.getTime())) return "Date invalide";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Mes événements</h2>

      {events.length === 0 ? (
        <p>Aucun événement disponible.</p>
      ) : (
        <table className="w-full border border-gray-700 rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-2 align-middle">Titre</th>
              <th className="px-4 py-2 align-middle">Date</th>
              <th className="px-4 py-2 align-middle">Type</th>
              <th className="px-4 py-2 align-middle">Participation</th>
              <th className="px-4 py-2 align-middle">Note</th>
            </tr>
          </thead>

          <tbody>
            {events.map((participation) => (
              <tr
                key={participation.id}
                className="border-t border-gray-700 text-center align-middle"
              >
                {/* Titre */}
                <td className="px-4 py-3">{participation.event_title}</td>

                {/* Date */}
                <td className="px-4 py-3">
                  {formatDate(participation.event_date)}
                </td>

                {/* Type */}
                <td className="px-4 py-3">{participation.event_type}</td>

                {/* Participation */}
                <td className="px-4 py-3">
                  {participation.will_attend === null ? (
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() =>
                          handleParticipation(participation.id, true)
                        }
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white"
                      >
                        Accepter
                      </button>

                      <button
                        onClick={() =>
                          handleParticipation(participation.id, false)
                        }
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white"
                      >
                        Refuser
                      </button>
                    </div>
                  ) : participation.will_attend ? (
                    <span className="text-green-400 font-semibold">
                      Accepté
                    </span>
                  ) : (
                    <span className="text-red-400 font-semibold">
                      Refusé : {participation.refusal_reason || "Non spécifié"}
                    </span>
                  )}
                </td>

                {/* Note */}
                <td className="px-4 py-3 align-middle">15</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ---------------- Modal : Motif du refus ---------------- */}
      {modal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg relative">
            {/* Close */}
            <button
              onClick={() =>
                setModal({ open: false, eventId: null, reason: "", error: "" })
              }
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold"
            >
              &times;
            </button>

            <h3 className="text-xl font-bold mb-4 text-center text-gray-800">
              Refuser l'événement
            </h3>

            <p className="mb-2 text-gray-700">
              Veuillez indiquer la raison de votre refus :
            </p>

            <textarea
              value={modal.reason}
              onChange={(e) =>
                setModal({ ...modal, reason: e.target.value, error: "" })
              }
              placeholder="Motif de refus..."
              className="w-full border border-gray-300 rounded-lg p-3 mb-1 text-black resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
            />

            {modal.error && (
              <p className="text-red-600 text-sm mb-2">{modal.error}</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setModal({
                    open: false,
                    eventId: null,
                    reason: "",
                    error: "",
                  })
                }
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold"
              >
                Annuler
              </button>

              <button
                onClick={() => {
                  if (!modal.reason.trim()) {
                    setModal({ ...modal, error: "Veuillez saisir un motif." });
                    return;
                  }
                  handleRefuse();
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                Refuser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
