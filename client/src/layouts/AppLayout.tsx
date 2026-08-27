import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FilterProvider } from "../context/FilterContext";

export const AppLayout = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("shopsphere-theme") === "dark";
  });

  const location = useLocation();

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("shopsphere-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="main-content" id="top">
        <FilterProvider>
          <Outlet context={{ darkMode, toggleTheme }} />
        </FilterProvider>
      </main>
    </div>
  );
};

export default AppLayout;
