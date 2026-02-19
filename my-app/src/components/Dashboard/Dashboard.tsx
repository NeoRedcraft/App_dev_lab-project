import "./Dashboard.css";
import { supabase } from "../../database/client";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log("Error logging out:", error.message);
  };

  return (
    <div className="dash-page">
      <header className="dash-topbar">
        <img className="dash-toplogo" src="/images/logo2.webp" alt="MAPUA LIBRARY" />
      </header>

      <div className="dash-body">
        <aside className="dash-sidebar">
          <nav className="dash-nav">
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
              Dashboard
            </NavLink>

            <NavLink to="/program-course" className={({ isActive }) => (isActive ? "active" : "")}>
              Program &amp; <br />
              Course view
            </NavLink>

            <NavLink to="/editions" className={({ isActive }) => (isActive ? "active" : "")}>
              Editions
            </NavLink>

            <NavLink to="/report-summary" className={({ isActive }) => (isActive ? "active" : "")}>
              Report <br />
              Summary
            </NavLink>
          </nav>

          <button className="dash-signout" onClick={handleLogout}>
            ↩ Sign Out
          </button>
        </aside>

        <main className="dash-main">
          <div className="dash-main-head">
            <h1 className="dash-title">Dashboard Summary</h1>

            <div className="dash-search">
              <input type="text" placeholder="Search Book" />
              <span className="dash-search-ic">🔍</span>
            </div>
          </div>

          <div className="dash-actions">
            <button
              type="button"
              className="dash-logbtn"
              onClick={() =>
                navigate("/books-encoding", {
                  state: { openModal: true, from: location.pathname },
                })
              }
            >
              + Log New Book/s
            </button>
          </div>
          <section className="dash-canvas" />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;