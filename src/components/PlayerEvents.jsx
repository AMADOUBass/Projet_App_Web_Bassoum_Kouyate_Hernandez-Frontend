import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";

export default function MyEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axiosInstance.get("/player/my-participations/");
      setEvents(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des événements :", error);
      toast.error("Impossible de charger vos événements.");
    }
  };

  const handleParticipation = async (eventId, willAttend) => {
    let reason = "";
    if (!willAttend) {
      reason = prompt("Veuillez indiquer la raison de votre refus :");
      if (!reason) {
        toast.error("Vous devez fournir une raison pour refuser l'événement.");
        return;
      }
    }

    try {
      await axiosInstance.put(`/player/participation/${eventId}/`, {
        will_attend: willAttend,
        refusal_reason: reason,
      });
      toast.success("Votre réponse a été enregistrée !");
      fetchEvents();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      toast.error("Impossible de mettre à jour votre participation.");
    }
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
                <td className="px-4 py-3 align-middle">
                  {participation.event_title}
                </td>
                <td className="px-4 py-3 align-middle">
                  {new Date(participation.date_event).toLocaleString()}
                </td>
                <td className="px-4 py-3 align-middle">
                  {participation.event.type_event}
                </td>
                <td className="px-4 py-3 align-middle">
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
                <td className="px-4 py-3 align-middle">15</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
