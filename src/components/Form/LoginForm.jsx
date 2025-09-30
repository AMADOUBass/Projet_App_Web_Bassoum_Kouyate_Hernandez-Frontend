// Updated LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const LoginForm = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL_LOCAL}api/auth/token/`, form);
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // Fetch user info to check role
      const userResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL_LOCAL}api/auth/current-user/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      const { role } = userResponse.data;

      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/'); // Or to player dashboard if exists
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledWrapper>
      <form className="form" onSubmit={submit}>
        <div className="flex-column">
          <label>Email</label>
        </div>
        <div className="inputForm">
          <input
            type="email"
            name="email"
            className="input"
            placeholder="Entrer votre email"
            value={form.email}
            onChange={onChange}
            disabled={loading}
          />
        </div>

        <div className="flex-column">
          <label>Mot de passe</label>
        </div>
        <div className="inputForm">
          <input
            type="password"
            name="password"
            className="input"
            placeholder="Entrer votre mot de passe"
            value={form.password}
            onChange={onChange}
            disabled={loading}
          />
        </div>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <button className="button-submit" disabled={loading}>
          {loading ? 'Connexion...' : 'Connexion'}
        </button>
        <p className="p">
          Pas encore de compte ? <LinkSpan to="/register">Inscription</LinkSpan>
        </p>
      </form>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #0b1020;

  .form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: #1f1f1f;
    padding: 30px;
    width: 400px;
    border-radius: 20px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }
  .flex-column > label {
    color: #f1f1f1;
    font-weight: 600;
  }
  .inputForm {
    border: 1.5px solid #333;
    border-radius: 10px;
    height: 50px;
    display: flex;
    align-items: center;
    padding-left: 10px;
    background-color: #2b2b2b;
  }
  .input {
    margin-left: 10px;
    border: none;
    width: 100%;
    background-color: #2b2b2b;
    color: #f1f1f1;
  }
  .input:focus {
    outline: none;
  }
  .input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .button-submit {
    margin: 20px 0 10px 0;
    background-color: #2d79f3;
    border: none;
    color: white;
    font-size: 15px;
    font-weight: 500;
    border-radius: 10px;
    height: 50px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .button-submit:hover:not(:disabled) {
    background-color: #2563eb;
  }
  .button-submit:disabled {
    background-color: #6b7280;
    cursor: not-allowed;
  }
  .p {
    text-align: center;
    color: #f1f1f1;
    font-size: 14px;
    margin: 5px 0;
  }
  .span {
    color: #2d79f3;
    cursor: pointer;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 14px;
  text-align: center;
  margin: 10px 0;
`;

const LinkSpan = styled.span`
  color: #2d79f3;
  cursor: pointer;
  text-decoration: underline;
`;

export default LoginForm;