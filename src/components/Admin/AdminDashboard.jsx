// Updated AdminDashboard.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import Sidebar from "../Admin/SideBar";
import StatsBoard from "./StatsBoard";

const AdminDashboard = () => {
  return (
    <DashboardWrapper>
      <Sidebar />
      <MainContent>
        <Outlet />
      </MainContent>
    </DashboardWrapper>
  );
};

const DashboardWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: #0b0b0b;
`;

const MainContent = styled.main`
  flex: 1;
  overflow: auto;
`;

export default AdminDashboard;