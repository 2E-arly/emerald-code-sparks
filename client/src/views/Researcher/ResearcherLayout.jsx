import React from 'react';
import { Outlet } from 'react-router-dom';
import ResearcherNavbar from './ResearcherNavbar';
import '../../assets/style.less';

function ResearcherLayout() {
  return (
    <div className="container nav-padding">
      <ResearcherNavbar />
      <Outlet />
    </div>
  );
}

export default ResearcherLayout;
