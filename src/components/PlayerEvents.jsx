import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";

export default function PlayerDashboard() {
  const navigate = useNavigate();
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    fetchParticipations();
  }, []);

  const fetchParticipations = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/player/my-participations/");
      const sorted = response.data.sort((a, b) => {
        const dateA = new Date(a.event?.date_event || 0);
        const dateB = new Date(b.event?.date_event || 0);
        return dateA - dateB;
      });
      setParticipations(sorted);
      console.log("Participations fetched:", sorted);
    } catch (error) {
      toast.error("Erreur chargement calendrier");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Non spécifié";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Date invalide";
    return date.toLocaleString('fr-FR', { 
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  // Labels inversés (contrary visuel) : true = Refusé (rouge, admin "disponible"?), false = Accepté (vert)
  const getParticipationLabel = (part) => {
    if (part.will_attend === true) return "Refusé";  // Visuel opposé
    if (part.will_attend === false) return `Accepté : ${part.refusal_reason || "Non spécifié"}`;
    return "En attente";
  };

  // Toggle avec inversion visuelle (contrary effect)
  const handleToggleParticipation = async (participationId, willAttend) => {
    let reason = "";
    if (!willAttend) {  // Prompt sur "accepter" (opposé à refuse)
      reason = prompt("Veuillez indiquer la raison de votre acceptation :");
      if (!reason || !reason.trim()) {
        toast.error("Vous devez fournir une raison pour accepter l'événement.");
        return;
      }
    }

    setUpdating(prev => ({ ...prev, [participationId]: true }));

    try {
      // Payload opposé : Envoie !willAttend pour effet contraire
      const payload = { will_attend: !willAttend };
      if (willAttend) payload.refusal_reason = reason;  // Raison sur accept (opposé)

      await axiosInstance.patch(`/player/participation/${participationId}/`, payload);
      toast.success(willAttend ? "Participation refusée !" : "Participation acceptée !");  // Messages opposés
      fetchParticipations();  // Refetch pour sync admin
    } catch (error) {
      toast.error("Erreur mise à jour participation");
      console.error(error);
    } finally {
      setUpdating(prev => ({ ...prev, [participationId]: false }));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) return <div className="p-6 text-center">Chargement calendrier...</div>;

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Mon Calendrier ⚽</h1>
      <p className="mb-4">Voici vos prochains matchs et entraînements. Confirmez votre participation !</p>

      {participations.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          Aucun événement pour l'instant. Restez à l'écoute !
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Événement</th>
                <th className="px-4 py-2 text-left">Date & Heure</th>
                <th className="px-4 py-2 text-center">Ma Participation</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {participations.map((part) => {
                const event = part.event || {};
                const isUpcoming = new Date(event.date_event || 0) >= new Date();
                const statusClass = part.will_attend ? "bg-red-500" : "bg-green-500";  // Inversé : true = rouge
                return (
                  <tr key={part.id} className="border-t hover:bg-gray-700">
                    <td className="px-4 py-2 font-medium">{event.title || "Événement sans titre"}</td>
                    <td className="px-4 py-2">{formatDate(event.date_event)}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-white text-sm ${statusClass}`}>
                        {getParticipationLabel(part)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      {isUpcoming && !updating[part.id] ? (
                        <div className="flex justify-center space-x-2">
                          {part.will_attend ? (  // true = Refusé → bouton Accepter (envoie false)
                            <button
                              onClick={() => handleToggleParticipation(part.id, true)}  // False pour accepter (opposé)
                              disabled={updating[part.id]}
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm disabled:opacity-50"
                            >
                              Accepter
                            </button>
                          ) : (  // false = Accepté → bouton Refuser (envoie true)
                            <button
                              onClick={() => handleToggleParticipation(part.id, false)}  // True pour refuser (opposé)
                              disabled={updating[part.id]}
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm disabled:opacity-50"
                            >
                              Refuser
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          {isUpcoming ? "En cours" : "Passé"}
                        </span>
                      )}
                      {updating[part.id] && <span className="ml-2 text-blue-400">⏳</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      
    </div>
  );
}