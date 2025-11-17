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

      {events.length === 0 ? (
        <p className="text-gray-600">Aucun événement disponible.</p>
      ) : (
        <table className="w-full border border-gray-300 rounded-lg shadow-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-2 text-left">Titre</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Statut</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {events.map((participation) => (
              <tr key={participation.id || participation.event}>
                <td className="px-4 py-2">{participation.event_title}</td>
                <td className="px-4 py-2">
                  {formatDate(participation.event_date)}
                </td>
                <td className="px-4 py-2">
                  {participation.will_attend === true ? (
                    <span className="text-red-400 font-semibold">
                      Refusé : {participation.refusal_reason || "Non spécifié"}
                    </span>
                  ) : (
                    <span className="text-green-400 font-semibold">
                      Accepté
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {/* Affiche Refuser si le joueur n'a pas encore refusé */}
                  {participation.will_attend !== true && (
                    <button
                      onClick={() =>
                        setModal({
                          open: true,
                          eventId: participation.id,
                          reason: "",
                        })
                      }
                      className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white">
                      Refuser
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal pour saisir le motif de refus */}
      {modal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg relative">
            {/* Close button */}
            <button
              onClick={() =>
                setModal({ open: false, eventId: null, reason: "", error: "" })
              }
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold">
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
              className="w-full border border-gray-300 rounded-lg p-3 mb-1 text-black resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={4}
            />

            {/* Message de validation */}
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
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold">
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
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold">
                Refuser
              </button>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
}