import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import Topbar from "../components/Topbar/Topbar";
import { SidebarProvider } from "../providers/SidebarProvider";

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <Sidebar />
      <Topbar />
      <main>
        <Outlet />
      </main>
    </SidebarProvider>
  );
};

export default DashboardLayout;
