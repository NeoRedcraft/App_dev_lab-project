import { useState } from "react";
import "./BooksEncoding.css";
import { supabase } from "../../database/client";
import { NavLink, useNavigate } from "react-router-dom";

const BooksEncoding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    course_code: "",
    publisher: "",
    year: "",
    edition: "",
  });

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log("Error logging out:", error.message);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('books')
        .insert([formData]);

      if (error) throw error;

      alert("Book added successfully!");
      setFormData({
        title: "",
        author: "",
        course_code: "",
        publisher: "",
        year: "",
        edition: "",
      });
    } catch (error: any) {
      alert("Error adding book: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="layout">
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

          <section className="panel">
            <form className="be-card" onSubmit={handleAdd}>
              <div className="be-field">
                <label className="be-label">Title</label>
                <input
                  className="be-input"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="be-field">
                <label className="be-label">Author</label>
                <input
                  className="be-input"
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="be-field">
                <label className="be-label">Course Code</label>
                <input
                  className="be-input"
                  type="text"
                  name="course_code"
                  value={formData.course_code}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="be-field">
                <label className="be-label">Publisher</label>
                <input
                  className="be-input"
                  type="text"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="be-field">
                <label className="be-label">Year</label>
                <input
                  className="be-input"
                  type="text"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="be-field">
                <label className="be-label">Edition</label>
                <input
                  className="be-input"
                  type="text"
                  name="edition"
                  value={formData.edition}
                  onChange={handleChange}
                  required
                />
              </div>

              <button className="be-add" type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add"}
              </button>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
};

export default BooksEncoding;
