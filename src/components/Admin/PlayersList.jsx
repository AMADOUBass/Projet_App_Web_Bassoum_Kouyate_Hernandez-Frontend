// New component: PlayersList.jsx (create this file in the same directory as StatsBoard.jsx)
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { FaEdit, FaTrash, FaCheck } from "react-icons/fa";

const PlayersList = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModal, setEditModal] = useState({ open: false, player: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, playerId: null });
  const [approveModal, setApproveModal] = useState({ open: false, userId: null });
  const [form, setForm] = useState({});

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL_LOCAL}api/admin/players/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched players:", response.data);
      setPlayers(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des joueurs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      // Update player fields
      await axios.put(`${import.meta.env.VITE_API_BASE_URL_LOCAL}api/admin/players/${editModal.player.id}/`, {
        team_name: form.team_name,
        position: form.position,
        jersey_number: parseInt(form.jersey_number) || null,
        is_available: form.is_available,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update user fields
      await axios.put(`${import.meta.env.VITE_API_BASE_URL_LOCAL}api/users/${editModal.player.user.id}/`, {
        phone_number: form.phone_number,
        bio: form.bio,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditModal({ open: false, player: null });
      fetchPlayers();
    } catch (err) {
      setError('Erreur lors de la mise à jour');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL_LOCAL}api/admin/players/${deleteModal.playerId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteModal({ open: false, playerId: null });
      fetchPlayers();
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error(err);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${import.meta.env.VITE_API_BASE_URL_LOCAL}api/approve/${userId}/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApproveModal({ open: false, userId: null });
      fetchPlayers();
    } catch (err) {
      setError('Erreur lors de l\'approbation');
      console.error(err);
    }
  };

  if (loading) return <Loading>Chargement des joueurs...</Loading>;
  if (error) return <Error>{error}</Error>;

  return (
    <PlayersContainer>
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
            const fullName = `${player.user.first_name || ''} ${player.user.last_name || ''}`.trim() || player.user.username;
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
    </PlayersContainer>
  );
};

const PlayersContainer = styled.div`
  margin-top: 40px;
  h3 {
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

export default PlayersList;