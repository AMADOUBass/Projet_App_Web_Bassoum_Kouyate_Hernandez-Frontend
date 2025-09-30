// Updated StatsBoard.jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { FaEdit, FaTrash, FaCheck } from "react-icons/fa";

const StatsBoard = () => {
  const [data, setData] = useState({
    num_players: 0,
    num_events: 0,
    num_reports: 0,
  });
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModal, setEditModal] = useState({ open: false, player: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, playerId: null });
  const [approveModal, setApproveModal] = useState({ open: false, userId: null });
  const [form, setForm] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        console.log("Using token:", token);

        // Fetch counts using AdminStatsView
        // const statsResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL_LOCAL}api/admin/stats/`, {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        // setData(statsResponse.data);

        // Fetch players using PlayerListView
        const playersResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL_LOCAL}api/admin/players/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPlayers(playersResponse.data);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (player) => {
    setForm({
      team_name: player.team_name || '',
      position: player.position || '',
      jersey_number: player.jersey_number || '',
      is_available: player.is_available || false,
      phone_number: player.user?.phone_number || '',
      bio: player.user?.bio || '',
    });
    setEditModal({ open: true, player });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      // Update player fields using PlayerDetailView
      await axios.put(`${import.meta.env.VITE_API_BASE_URL_LOCAL}api/admin/players/${editModal.player.id}/`, {
        team_name: form.team_name,
        position: form.position,
        jersey_number: parseInt(form.jersey_number) || null,
        is_available: form.is_available,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update user fields (assuming a UserDetailView or similar; adjust endpoint if needed)
      await axios.put(`${import.meta.env.VITE_API_BASE_URL_LOCAL}api/users/${editModal.player.user.id}/`, {
        phone_number: form.phone_number,
        bio: form.bio,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditModal({ open: false, player: null });
      // Refetch players
      const playersResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL_LOCAL}api/admin/players/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlayers(playersResponse.data);
    } catch (err) {
      setError('Erreur lors de la mise à jour');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('access_token');
      // Delete using PlayerDetailView
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL_LOCAL}api/admin/players/${deleteModal.playerId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteModal({ open: false, playerId: null });
      // Refetch players
      const playersResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL_LOCAL}api/admin/players/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlayers(playersResponse.data);
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error(err);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const token = localStorage.getItem('access_token');
      // Approve using ApproveUserView
      await axios.post(`${import.meta.env.VITE_API_BASE_URL_LOCAL}api/admin/approve-player/${userId}/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApproveModal({ open: false, userId: null });
      // Refetch players
      const playersResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL_LOCAL}api/admin/players/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlayers(playersResponse.data);
    } catch (err) {
      setError('Erreur lors de l\'approbation');
      console.error(err);
    }
  };

  if (loading) return <Loading>Chargement...</Loading>;
  if (error) return <Error>{error}</Error>;

  return (
    <StyledStats>
      {/* 3 Info Cards */}
      <div className="info-cards">
        <div className="card">
          Nombre de joueurs: <span>{data.num_players}</span>
        </div>
        <div className="card">
          Nombre d'événements: <span>{data.num_events}</span>
        </div>
        <div className="card">
          Nombre de rapports: <span>{data.num_reports}</span>
        </div>
      </div>

      {/* Players List Table */}
      <div className="players-section">
        <h3>Liste des Joueurs</h3>
        <Table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Équipe</th>
              <th>Position</th>
              <th>Numéro</th>
              <th>Disponible</th>
              <th>Approuvé</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => {
              const fullName = `${player.user.first_name || ''} ${player.user.last_name || ''}`.trim() || player.user.username || player.user.email;
              const isApproved = player.user.is_approved;
              return (
                <tr key={player.id}>
                  <td>{fullName}</td>
                  <td>{player.user.email}</td>
                  <td>{player.user.phone_number || 'N/A'}</td>
                  <td>{player.team_name || 'N/A'}</td>
                  <td>{player.position || 'N/A'}</td>
                  <td>{player.jersey_number || 'N/A'}</td>
                  <td>{player.is_available ? 'Oui' : 'Non'}</td>
                  <td>{isApproved ? 'Oui' : 'Non'}</td>
                  <td>
                    <ActionButton onClick={() => handleEdit(player)} title="Modifier">
                      <FaEdit />
                    </ActionButton>
                    <ActionButton onClick={() => setDeleteModal({ open: true, playerId: player.id })} title="Supprimer" danger>
                      <FaTrash />
                    </ActionButton>
                    {!isApproved && (
                      <ActionButton onClick={() => setApproveModal({ open: true, userId: player.user.id })} title="Approuver">
                        <FaCheck />
                      </ActionButton>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {/* Edit Modal */}
      {editModal.open && (
        <Modal>
          <ModalContent>
            <h4>Modifier {form.team_name}</h4>
            <form onSubmit={handleUpdate}>
              <InputGroup>
                <label>Équipe</label>
                <input value={form.team_name} onChange={(e) => setForm({ ...form, team_name: e.target.value })} required />
              </InputGroup>
              <InputGroup>
                <label>Position</label>
                <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
              </InputGroup>
              <InputGroup>
                <label>Numéro de maillot</label>
                <input type="number" value={form.jersey_number} onChange={(e) => setForm({ ...form, jersey_number: e.target.value })} />
              </InputGroup>
              <InputGroup>
                <label>Disponible</label>
                <select value={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.value === 'true' })}>
                  <option value={true}>Oui</option>
                  <option value={false}>Non</option>
                </select>
              </InputGroup>
              <InputGroup>
                <label>Téléphone</label>
                <input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
              </InputGroup>
              <InputGroup>
                <label>Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} />
              </InputGroup>
              <ButtonGroup>
                <button type="submit">Sauvegarder</button>
                <button type="button" onClick={() => setEditModal({ open: false })}>Annuler</button>
              </ButtonGroup>
            </form>
          </ModalContent>
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteModal.open && (
        <Modal>
          <ModalContent>
            <h4>Confirmer la suppression</h4>
            <p>Êtes-vous sûr de vouloir supprimer ce joueur ? Cette action est irréversible.</p>
            <ButtonGroup>
              <button onClick={handleDelete} danger>Supprimer</button>
              <button onClick={() => setDeleteModal({ open: false })}>Annuler</button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}

      {/* Approve Modal */}
      {approveModal.open && (
        <Modal>
          <ModalContent>
            <h4>Confirmer l'approbation</h4>
            <p>Approuver cet utilisateur ?</p>
            <ButtonGroup>
              <button onClick={() => handleApprove(approveModal.userId)}>Approuver</button>
              <button onClick={() => setApproveModal({ open: false })}>Annuler</button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}
    </StyledStats>
  );
};

const StyledStats = styled.div`
  padding: 30px;
  background: #121212;
  color: #f1f1f1;
  min-height: 100vh;

  .info-cards {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
  }

  .card {
    background: #1f1f1f;
    padding: 20px;
    border-radius: 12px;
    flex: 1;
    font-size: 16px;
    font-weight: 500;
  }

  .card span {
    display: block;
    font-size: 22px;
    font-weight: bold;
    margin-top: 8px;
    color: #2d79f3;
  }

  .players-section {
    margin-top: 40px;
  }

  .players-section h3 {
    margin-bottom: 20px;
    color: #f1f1f1;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #1f1f1f;
  border-radius: 12px;
  overflow: hidden;

  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #333;
  }

  th {
    background: #2b2b2b;
    font-weight: 600;
    color: #f1f1f1;
  }

  tr:hover {
    background: #2b2b2b;
  }

  td {
    color: #aaa;
  }
`;

const ActionButton = styled.button`
  background: ${props => props.danger ? '#ef4444' : '#2d79f3'};
  border: none;
  color: white;
  padding: 6px 10px;
  margin-right: 8px;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;

  &:hover {
    opacity: 0.8;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #1f1f1f;
  padding: 30px;
  border-radius: 12px;
  width: 500px;
  max-width: 90%;
  color: #f1f1f1;

  h4 {
    margin-bottom: 15px;
  }

  p {
    color: #aaa;
    margin-bottom: 20px;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 15px;

  label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    color: #f1f1f1;
  }

  input, select, textarea {
    width: 100%;
    padding: 10px;
    border: 1.5px solid #333;
    border-radius: 6px;
    background: #2b2b2b;
    color: #f1f1f1;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;

  button {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    color: white;
  }

  button:first-child {
    background: #2d79f3;
  }

  button[danger] {
    background: #ef4444;
  }

  button:last-child {
    background: #6b7280;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 20px;
  color: #aaa;
`;

const Error = styled.div`
  text-align: center;
  padding: 20px;
  color: #ef4444;
`;

export default StatsBoard;