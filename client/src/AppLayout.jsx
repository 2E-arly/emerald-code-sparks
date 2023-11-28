import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar';

function AppLayout() {
  return (
    <div className="container nav-padding">
      <NavBar />
      <Outlet />
    </div>
  );
}

export default AppLayout;
