import "./BooksEncoding.css";
import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { NavLink, useNavigate } from "react-router-dom";

const BooksEncoding = () => {
  const navigate = useNavigate();

  // Form state (UI only)
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [department, setDepartment] = useState("");
  const [program, setProgram] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [publisher, setPublisher] = useState("");
  const [year, setYear] = useState("");
  const [edition, setEdition] = useState("");

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log("Error logging out:", error.message);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Added (UI only for now)");
  };

  return (
    <div className="app">
      <div className="layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="brand">
            <img className="logo" src="/images/logo.png" alt="Mapúa" />
          </div>

          <nav className="nav">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span className="nav-ic">🏠</span>
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/program-course"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span className="nav-ic">⭐</span>
              <span>Program & Course view</span>
            </NavLink>

            <NavLink
              to="/editions"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span className="nav-ic">📖</span>
              <span>Editions</span>
            </NavLink>

            <NavLink
              to="/report-summary"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
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

        {/* MAIN */}
        <main className="main">
          <div className="main-header">
            <div className="search">
              <span className="search-ic">≡</span>
              <input type="text" placeholder="Search Here" />
              <span className="search-ic">🔍</span>
            </div>

            <button className="log-btn" onClick={() => navigate("/dashboard")}>
              <span className="plus">+</span>
              Log New Book/s
            </button>
          </div>

          {/* FORM */}
          <section className="panel">
            <form className="be-card" onSubmit={handleAdd}>
              <div className="be-field">
                <label className="be-label">Title</label>
                <input
                  className="be-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="be-field">
                <label className="be-label">Author</label>
                <input
                  className="be-input"
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>

              {/* ✅ NEW FIELD */}
              <div className="be-field">
                <label className="be-label">Department</label>
                <input
                  className="be-input"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>

              {/* ✅ NEW FIELD */}
              <div className="be-field">
                <label className="be-label">Program</label>
                <input
                  className="be-input"
                  type="text"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                />
              </div>

              <div className="be-field">
                <label className="be-label">Course Code</label>
                <input
                  className="be-input"
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                />
              </div>

              <div className="be-field">
                <label className="be-label">Publisher</label>
                <input
                  className="be-input"
                  type="text"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                />
              </div>

              <div className="be-field">
                <label className="be-label">Year</label>
                <input
                  className="be-input"
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>

              <div className="be-field">
                <label className="be-label">Edition</label>
                <input
                  className="be-input"
                  type="text"
                  value={edition}
                  onChange={(e) => setEdition(e.target.value)}
                />
              </div>

              <button className="be-add" type="submit">
                Add
              </button>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
};

export default BooksEncoding;
