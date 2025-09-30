// Updated RegisterForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

export default function RegisterForm() {
  const [form, setForm] = useState({ 
    email: '', 
    password: '', 
    phone_number: '', 
    bio: '',
    role: 'player' 
  });
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL_LOCAL}api/auth/register/`, form);
      console.log(form);
      setMsg("Compte créé avec succès ! Redirection vers la connexion...");
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledWrapper>
      <div className="card">
        <h2>Créer un compte</h2>
        <form onSubmit={submit} className="form">
          <div className="form__group">
            <label>Email</label>
            <input 
              name="email" 
              type="email" 
              value={form.email} 
              onChange={onChange}
              disabled={loading}
              required 
            />
          </div>
          <div className="form__group">
            <label>Mot de passe</label>
            <input 
              name="password" 
              type="password" 
              value={form.password} 
              onChange={onChange}
              disabled={loading}
              required 
            />
          </div>
          <div className="form__group">
            <label>Numéro de téléphone (optionnel)</label>
            <input 
              name="phone_number" 
              type="tel" 
              value={form.phone_number} 
              onChange={onChange}
              disabled={loading}
            />
          </div>
          <div className="form__group">
            <label>Bio (optionnel)</label>
            <textarea 
              name="bio" 
              value={form.bio} 
              onChange={onChange}
              disabled={loading}
              rows={3}
            />
          </div>
          <div className="form__group">
            <label>Rôle</label>
            <select name="role" value={form.role} onChange={onChange} disabled={loading}>
              <option value="player">Joueur</option>
              {/* Admin role not available for self-registration */}
            </select>
          </div>
          <button className="btn btn--primary" disabled={loading}>
            {loading ? 'Création...' : 'Créer un compte'}
          </button>
        </form>
        {error && <ErrorMessage className="info error">{error}</ErrorMessage>}
        {msg && <SuccessMessage className="info">{msg}</SuccessMessage>}
        <p className="p">
          Déjà un compte ? <LinkSpan to="/login">Connexion</LinkSpan>
        </p>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #0b1020;
  padding: 20px;

  .card {
    background-color: #1f1f1f;
    padding: 30px;
    width: 400px;
    border-radius: 20px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    color: #f1f1f1;
  }

  h2 {
    text-align: center;
    margin-bottom: 20px;
    color: #f1f1f1;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .form__group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .form__group label {
    font-weight: 600;
    color: #f1f1f1;
  }

  .form__group input,
  .form__group select,
  .form__group textarea {
    padding: 10px;
    border: 1.5px solid #333;
    border-radius: 10px;
    background-color: #2b2b2b;
    color: #f1f1f1;
    font-size: 14px;
  }

  .form__group input:focus,
  .form__group select:focus,
  .form__group textarea:focus {
    outline: none;
    border-color: #2d79f3;
  }

  .form__group input:disabled,
  .form__group select:disabled,
  .form__group textarea:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn {
    padding: 12px;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-top: 10px;
  }

  .btn--primary {
    background-color: #2d79f3;
    color: white;
  }

  .btn--primary:hover:not(:disabled) {
    background-color: #2563eb;
  }

  .btn--primary:disabled {
    background-color: #6b7280;
    cursor: not-allowed;
  }

  .info {
    text-align: center;
    margin-top: 10px;
    font-size: 14px;
    padding: 10px;
    border-radius: 5px;
  }

  .p {
    text-align: center;
    color: #f1f1f1;
    font-size: 14px;
    margin-top: 15px;
  }

  .span {
    color: #2d79f3;
    cursor: pointer;
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  background-color: #ef4444;
  color: white;
`;

const SuccessMessage = styled.div`
  background-color: #10b981;
  color: white;
`;

const LinkSpan = styled.span`
  color: #2d79f3;
  cursor: pointer;
  text-decoration: underline;
`;