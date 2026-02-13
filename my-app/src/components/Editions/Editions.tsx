import "./Edition.css";
import { useState, useMemo } from "react";
import { supabase } from "../../database/client";
import { NavLink, useNavigate } from "react-router-dom";

const Editions = () => {
  const navigate = useNavigate();
  const [editionYear, setEditionYear] = useState<number | "">("");

  const CURRENT_YEAR = new Date().getFullYear();
  const OUTDATED_AFTER_YEARS = 5;

  const editionStatus = useMemo(() => {
    if (editionYear === "") return "";
    if (editionYear < 1500 || editionYear > CURRENT_YEAR) {
      return "Invalid year";
    }

    const age = CURRENT_YEAR - editionYear;

    return age >= OUTDATED_AFTER_YEARS
      ? "Outdated"
      : "Up-to-date";
  }, [editionYear]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log("Error logging out:", error.message);
  };

  return (
    <div className="app">
      <div className="layout">
        <aside className="sidebar">
          <div className="brand">
            <img className="logo" src="/images/logo.png" alt="Mapúa" />
          </div>

          <nav className="nav">
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
              <span className="nav-ic">🏠</span>
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/program-course" className={({ isActive }) => (isActive ? "active" : "")}>
              <span className="nav-ic">⭐</span>
              <span>Program & Course view</span>
            </NavLink>

            <NavLink to="/editions" className={({ isActive }) => (isActive ? "active" : "")}>
              <span className="nav-ic">📖</span>
              <span>Editions</span>
            </NavLink>

            <NavLink to="/report-summary" className={({ isActive }) => (isActive ? "active" : "")}>
              <span className="nav-ic">📄</span>
              <span>Report Summary</span>
            </NavLink>
          </nav>

          <div className="spacer" />

          <button className="signout-btn" onClick={handleLogout}>
            <span className="nav-ic">↩</span>
            <span>Sign Out</span>
          </button>
        </aside>

        <main className="main">
          <div className="main-header">
            <div className="search">
              <span className="search-ic">≡</span>
              <input type="text" placeholder="Search Here" />
              <span className="search-ic">🔍</span>
            </div>

            <button className="log-btn" onClick={() => navigate("/books-encoding")}>
              <span className="plus">+</span>
              Log New Book/s
            </button>
          </div>

          <section className="panel">
            <div className="pc-top">
              <div className="pc-title">(Course Code) Library</div>

              <button className="pc-sort" type="button">
                SORT <span className="pc-sort-ic">⇅</span>
              </button>
            </div>

            <div className="pc-grid">
              <div className="pc-left">
                <label className="pc-label">Department</label>

                <div className="pc-selectWrap">
                  <select className="pc-select" defaultValue="">
                    <option value="" disabled>
                      Select Department
                    </option>
                  </select>
                  <span className="pc-caret">⌄</span>
                </div>

                <label className="pc-label">Program</label>

                <div className="pc-selectWrap">
                  <select className="pc-select" defaultValue="">
                    <option value="" disabled>
                      Select Program
                    </option>
                  </select>
                  <span className="pc-caret">⌄</span>
                </div>

                <div className="pc-subjectBox" />
              </div>

              <div className="pc-right">
                <div style={{ marginBottom: "12px" }}>
                  <input
                    type="number"
                    placeholder="Enter Edition Year (e.g. 2020)"
                    value={editionYear}
                    onChange={(e) =>
                      setEditionYear(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    style={{
                      padding: "8px",
                      width: "220px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                    }}
                  />
                </div>

                <table className="pc-table">
                  <thead>
                    <tr>
                      <th style={{ width: 90 }}>ID</th>
                      <th>Title</th>
                      <th style={{ width: 120 }}>Author</th>
                      <th style={{ width: 140 }}>Publisher</th>
                      <th style={{ width: 70 }}>Year</th>
                      <th style={{ width: 90 }}>Edition</th>
                      <th style={{ width: 90 }}>Status</th>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Editions;
