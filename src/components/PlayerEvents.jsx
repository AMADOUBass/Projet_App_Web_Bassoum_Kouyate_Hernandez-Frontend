import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";

export default function PlayerDashboard() {
  const navigate = useNavigate();
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [modal, setModal] = useState({ open: false, eventId: null, reason: "", error: "" });  

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

  const getParticipationLabel = (part) => {
    if (part.will_attend === true) return "Accepté";
    if (part.will_attend === false) return `Refusé : ${part.refusal_reason || "Non spécifié"}`;
    return "En attente";
  };



  const handleToggleParticipation = async (participationId, willAttend, reason = "") => {
    if (willAttend === false && (!reason || !reason.trim())) {
      toast.error("Vous devez fournir une raison pour refuser l'événement.");
      return;
    }

    setUpdating(prev => ({ ...prev, [participationId]: true }));

    try {
      const payload = { will_attend: willAttend };
      if (willAttend === false) payload.refusal_reason = reason; 

      console.log("PATCH payload:", payload);

     
      await axiosInstance.patch(`/player/participation/${participationId}/`, payload);

      toast.success(willAttend ? "Participation acceptée ! 👏" : "Participation refusée. 😔");
      fetchParticipations();
    } catch (error) {
    
      console.error("PATCH error:", error.response?.data || error);
      toast.error("Impossible de mettre à jour votre participation. Voir console pour détails.");
    } finally {
      setUpdating(prev => ({ ...prev, [participationId]: false }));
    }
  };



  const openRefuseModal = (eventId) => {
    setModal({ open: true, eventId, reason: "", error: "" });
  };

  const confirmRefuse = () => {
    if (!modal.reason || !modal.reason.trim()) {
      setModal(prev => ({ ...prev, error: "Veuillez saisir un motif." }));
      return;
    }
    handleToggleParticipation(modal.eventId, false, modal.reason);  
    setModal({ open: false, eventId: null, reason: "", error: "" });
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

              
                <th className="px-4 py-2 text-center">Stats</th>

                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {participations.map((part) => {
                const event = part.event || {};
                const isUpcoming = new Date(part.event_date || 0) >= new Date();
                const statusClass = part.will_attend ? "bg-green-500" : "bg-yellow-500";

               
                const perf = part.performance ?? 0;
                const buts = part.buts ?? 0;
                const passes = part.passe ?? 0;
                const jaune = part.cartonJaune ?? 0;
                const rouge = part.cartonRouge ?? 0;

                return (
                  <tr key={part.id} className="border-t hover:bg-gray-700">
                    <td className="px-4 py-2 font-medium">{part.event_title || "Événement sans titre"}</td>
                    <td className="px-4 py-2">{formatDate(part.event_date)}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-white text-sm ${statusClass}`}>
                        {getParticipationLabel(part)}
                      </span>
                    </td>

                    {/* Colonne unique des stats : images + valeur en dessous */}
                    <td className="px-4 py-2 text-center">
                      <div className="flex gap-4 justify-center items-center">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg">⭐</div>
                          <div className="text-sm mt-1">{Number(perf).toFixed(1)}</div>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg">🥅</div>
                          <div className="text-sm mt-1">{buts}</div>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg">👟</div>
                          
                          <div className="text-sm mt-1">{passes}</div>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg">🟨</div>
                          <div className="text-sm mt-1">{jaune}</div>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg">🟥</div>
                          <div className="text-sm mt-1">{rouge}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-2 text-center">
                      {isUpcoming && !updating[part.id] ? (
                        <div className="flex justify-center space-x-2">
                          {!part.will_attend ? (
                            <button
                              onClick={() => handleToggleParticipation(part.id, true)}
                              disabled={updating[part.id]}
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm disabled:opacity-50"
                            >
                              Accepter
                            </button>
                          ) : (
                            <button
                              onClick={() => openRefuseModal(part.id)}
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

      {/* Modal Raison Refus (comme collègue) */}
      {modal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Refuser l'événement</h3>
            <p className="mb-2 text-gray-300">Veuillez indiquer la raison de votre refus :</p>
            <textarea
              value={modal.reason}
              onChange={(e) => setModal({ ...modal, reason: e.target.value, error: "" })}
              placeholder="Motif de refus..."
              className="w-full p-3 border border-gray-500 bg-gray-700 rounded-md mb-2 text-white resize-none"
              rows={3}
            />
            {modal.error && <p className="text-red-400 text-sm mb-2">{modal.error}</p>}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setModal({ open: false, eventId: null, reason: "", error: "" })}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
              >
                Annuler
              </button>
              <button
                onClick={confirmRefuse}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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