
import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({}); 

  useEffect(() => {
    fetchEvents();
  }, []);

  // Safe date formatting
  const formatDate = (dateStr) => {
    if (!dateStr) return "Non spécifié";
    const date = new Date(dateStr);
    if (isNaN(date)) return "Date invalide";
    return date.toLocaleString('fr-FR', { 
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  // Safe participation label
  const getParticipationLabel = (part) => {
    if (part.will_attend === true) return "Accepté ✅";
    if (part.will_attend === false) return `Refusé : ${part.refusal_reason || "Non spécifié"} 😔`;
    return "En attente ❓";  // null or undefined
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/player/my-participations/");
      // Sort by date ascending (upcoming first)
      const sorted = response.data.sort((a, b) => {
        const dateA = new Date(a.event.date_event);
        const dateB = new Date(b.event.date_event);
        return isNaN(dateA) ? 1 : isNaN(dateB) ? -1 : dateA - dateB;
      });
      setEvents(sorted);
    } catch (error) {
      console.error("Erreur lors du chargement des événements :", error);
      toast.error("Impossible de charger vos événements.");
    } finally {
      setLoading(false);
    }
  };

  const handleParticipation = async (eventId, willAttend) => {
    let reason = "";
    if (!willAttend) {
      reason = prompt("Veuillez indiquer la raison de votre refus :");
      if (!reason || reason.trim() === "") {
        toast.error("Vous devez fournir une raison pour refuser l'événement.");
        return;
      }
    }

    setUpdating(prev => ({ ...prev, [eventId]: true }));

    try {
      await axiosInstance.put(`/player/participation/${eventId}/`, {
        will_attend: willAttend,
        refusal_reason: reason,
      });
      toast.success(willAttend ? "Participation acceptée ! 👏" : "Participation refusée. 😔");
      fetchEvents();  // Rafraîchir la liste
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      toast.error("Impossible de mettre à jour votre participation.");
    } finally {
      setUpdating(prev => ({ ...prev, [eventId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-400">Chargement de votre calendrier...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Mon Calendrier ⚽</h2>
      <p className="mb-4 text-gray-300">Consultez vos matchs et entraînements à venir et confirmez votre participation.</p>
      
      {events.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>Aucun événement pour l'instant.</p>
          <p className="mt-2">Restez à l'écoute pour les prochains !</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full bg-gray-800">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-white font-semibold">Titre</th>
                <th className="px-4 py-2 text-left text-white font-semibold">Date & Heure</th>
                <th className="px-4 py-2 text-left text-white font-semibold">Type</th>
                <th className="px-4 py-2 text-left text-white font-semibold">Lieu</th>
                <th className="px-4 py-2 text-center text-white font-semibold">Ma Participation</th>
                <th className="px-4 py-2 text-left text-white font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((participation) => {
                const event = participation.event || {};  // Safe access
                const isUpcoming = new Date(event.date_event) >= new Date();
                const statusClass = participation.will_attend === true ? "bg-green-600" : "bg-yellow-600";
                return (
                  <tr key={participation.id} className="border-t border-gray-700 hover:bg-gray-750">
                    <td className="px-4 py-2 font-medium">{event.title || "Événement sans titre"}</td>
                    <td className="px-4 py-2">{formatDate(event.date_event)}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.event_type === 'Match' ? 'bg-red-500 text-white' :
                        event.event_type === 'Entrainement' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {event.event_type || "Non spécifié"}
                      </span>
                    </td>
                    <td className="px-4 py-2">{event.location || "Non spécifié"}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${statusClass}`}>
                        {getParticipationLabel(participation)}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {isUpcoming && !updating[participation.id] ? (
                        <div className="flex space-x-2">
                          {participation.will_attend === null || participation.will_attend === false ? (
                            <button
                              onClick={() => handleParticipation(participation.id, true)}
                              disabled={updating[participation.id]}
                              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-3 py-1 rounded text-white text-sm font-medium transition"
                            >
                              Accepter
                            </button>
                          ) : (
                            <button
                              onClick={() => handleParticipation(participation.id, false)}
                              disabled={updating[participation.id]}
                              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-3 py-1 rounded text-white text-sm font-medium transition"
                            >
                              Refuser
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm italic">
                          {isUpcoming ? "En cours de traitement" : "Événement passé"}
                        </span>
                      )}
                      {updating[participation.id] && (
                        <span className="ml-2 inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Bouton Déconnexion (si besoin, ou dans NavBar) */}
      <div className="mt-6 text-center">
        <button
          onClick={() => window.location.href = "/logout"}  // Ou handleLogout si prop
          className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition"
        >
          Se Déconnecter
        </button>
      </div>
    </div>
  );
}