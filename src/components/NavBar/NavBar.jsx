import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useState } from "react";
import { FaBell, FaUserCircle } from "react-icons/fa";

export default function NavBar() {
  const navigate = useNavigate();
  const isAuth = Boolean(localStorage.getItem("access_token"));
  const role = localStorage.getItem("role");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Recherche :", search);
    // Implement search logic here if needed
  };

  return (
    <StyledNav>
      {/* Logo */}
      <div className="nav__brand" onClick={() => navigate("/")}>
        MyTeams
      </div>

      {/* Barre de recherche */}
      <form className="nav__search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search here!"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">🔍</button>
      </form>

      {/* Liens et icônes */}
      <div className="nav__links">
        {!isAuth && (
          <>
            <Link to="/login">Connexion</Link>
            <Link to="/register" className="btn btn--primary">
              Créer un compte
            </Link>
          </>
        )}
        {isAuth && (
          <>
            {role === "admin" && <Link to="/admin">Admin</Link>}
            <FaBell className="icon" />
            <div className="avatar-wrapper">
              <FaUserCircle
                className="avatar"
                onClick={() => setMenuOpen(!menuOpen)}
              />
              {menuOpen && (
                <div className="dropdown">
                  <p onClick={() => navigate("/profile")}>👤 Profil</p>
                  <p onClick={() => navigate("/settings")}>⚙️ Paramètres</p>
                  <p onClick={logout}>🚪 Déconnexion</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </StyledNav>
  );
}

const StyledNav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1f1f1f;
  color: #f1f1f1;
  padding: 12px 20px;
  position: relative;

  .nav__brand {
    font-weight: bold;
    font-size: 20px;
    cursor: pointer;
    color: #2d79f3;
    font-family: 'Oleo Script', cursive;
  }

  .nav__search {
    flex: 1;
    display: flex;
    justify-content: center;
    margin: 0 40px;
  }

  .nav__search input {
    width: 300px;
    padding: 8px 12px;
    border-radius: 20px 0 0 20px;
    border: none;
    outline: none;
    background: #2b2b2b;
    color: #f1f1f1;
  }

  .nav__search button {
    padding: 8px 12px;
    border-radius: 0 20px 20px 0;
    border: none;
    background: #2d79f3;
    color: white;
    cursor: pointer;
  }

  .nav__links {
    display: flex;
    align-items: center;
    gap: 15px;
    position: relative;
  }

  .btn {
    background: none;
    border: 1px solid #2d79f3;
    padding: 6px 12px;
    border-radius: 8px;
    color: #f1f1f1;
    cursor: pointer;
    text-decoration: none;
  }

  .btn--primary {
    background: #2d79f3;
    border: none;
    color: white;
  }

  .icon {
    font-size: 20px;
    cursor: pointer;
  }

  .avatar-wrapper {
    position: relative;
  }

  .avatar {
    font-size: 28px;
    cursor: pointer;
    color: #2d79f3;
  }

  .dropdown {
    position: absolute;
    right: 0;
    top: 40px;
    background: #2b2b2b;
    border-radius: 8px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 150px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    z-index: 10;
  }

  .dropdown p {
    margin: 0;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    color: #f1f1f1;
  }

  .dropdown p:hover {
    background: #2d79f3;
  }
`;