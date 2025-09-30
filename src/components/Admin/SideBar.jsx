// Updated SideBar.jsx - With navigation
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  FaUserPlus,
  FaUsers,
  FaCalendarAlt,
  FaFutbol,
  FaChartBar,
  FaSignOutAlt,
  FaChevronLeft,
} from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token'); // If used
    navigate('/login');
  };

  const menuItems = [
    { icon: FaUserPlus, label: 'Ajouter joueur', path: 'add-player' },
    { icon: FaUsers, label: 'Créer une équipe', path: 'create-team' },
    { icon: FaCalendarAlt, label: 'Événement à venir', path: 'upcoming-events' },
    { icon: FaFutbol, label: 'Match rencontre', path: 'matches' },
    { icon: FaChartBar, label: 'Consulter les stats', path: '' }, // Index for dashboard/stats
  ];

  const handleNav = (path) => {
    navigate(path ? `/admin/${path}` : '/admin');
  };

  return (
    <StyledSidebar collapsed={collapsed}>
      {/* Bouton toggle */}
      <div className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? <IoIosArrowForward /> : <FaChevronLeft />}
      </div>

      <ul>
        {menuItems.map((item, index) => (
          <li key={index} onClick={() => handleNav(item.path)}>
            <item.icon className="icon" />
            {!collapsed && <span>{item.label}</span>}
          </li>
        ))}
        <li className="logout" onClick={handleLogout}>
          <FaSignOutAlt className="icon" />
          {!collapsed && <span>Déconnexion</span>}
        </li>
      </ul>
    </StyledSidebar>
  );
};

const StyledSidebar = styled.div`
  width: ${(props) => (props.collapsed ? "70px" : "220px")};
  background: #1f1f1f;
  color: #f1f1f1;
  min-height: 100vh;
  padding: 20px 10px;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;

  .toggle-btn {
    align-self: ${(props) => (props.collapsed ? "center" : "flex-end")};
    margin-bottom: 20px;
    cursor: pointer;
    font-size: 20px;
    color: #2d79f3;
    transition: transform 0.3s ease;
  }

  ul {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  li {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    font-size: 15px;
    transition: 0.2s;
    padding: 8px;
    border-radius: 8px;
  }

  li:hover {
    background: #2b2b2b;
    color: #2d79f3;
  }

  .icon {
    font-size: 18px;
    min-width: 24px;
    text-align: center;
  }

  .logout {
    margin-top: auto;
    color: #ef4444;
  }
`;

export default Sidebar;