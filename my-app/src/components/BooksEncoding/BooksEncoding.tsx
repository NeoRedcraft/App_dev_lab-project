import "./BooksEncoding.css";
import { supabase } from "../../database/client";
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const BooksEncoding = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    Title: "",
    Author: "",
    Department: "",
    Program: "",
    Course_code: "",
    Publisher: "",
    Year: "",
    Edition: "",
  });

  const closeAndReturn = () => {
    const from = (location.state as any)?.from;
    setIsModalOpen(false);
    if (from) navigate(from, { replace: true });
  };

  useEffect(() => {
    if ((location.state as any)?.openModal) {
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAndReturn();
    };
    if (isModalOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log("Error logging out:", error.message);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("books").insert([formData]);
      if (error) throw error;

      alert("Book added successfully!");
      setFormData({
        Title: "",
        Author: "",
        Department: "",
        Program: "",
        Course_code: "",
        Publisher: "",
        Year: "",
        Edition: "",
      });

      closeAndReturn();
    } catch (error: any) {
      alert("Error adding book: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pc-page">
      {/* TOP BAR */}
      <header className="pc-topbar">
        <img className="pc-toplogo" src="/images/logo2.webp" alt="MAPUA LIBRARY" />
      </header>

      <div className="pc-body">
        {/* SIDEBAR */}
        <aside className="pc-sidebar">
          <nav className="pc-nav">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/program-course">
              Program & <br /> Course view
            </NavLink>
            <NavLink to="/editions">Editions</NavLink>
            <NavLink to="/report-summary">
              Report <br /> Summary
            </NavLink>
          </nav>

          <button className="pc-signout" onClick={handleLogout}>
            ↩ Sign Out
          </button>
        </aside>

        {/* MAIN */}
        <main className="pc-main">
          <div className="pc-main-head">
            <h1 className="pc-title">Books Encoding</h1>

            <div className="pc-head-right">
              <div className="pc-search">
                <input type="text" placeholder="Search Here" />
                <span className="pc-search-ic">🔍</span>
              </div>

              <button className="pc-logbtn" onClick={() => setIsModalOpen(true)}>
                Log New Book/s
              </button>
            </div>
          </div>

          <section className="pc-rightCard" />
        </main>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="be-overlay" onClick={closeAndReturn}>
          <div className="be-modal" onClick={(e) => e.stopPropagation()}>
            <button className="be-close" onClick={closeAndReturn}>
              x
            </button>

            <h2 className="be-title-modal">Book Encoding</h2>

            <form className="be-form-modal" onSubmit={handleAdd}>
              {[
                ["Title", "Book Title"],
                ["Author", "Author"],
                ["Department", "Department"],
                ["Program", "Program"],
                ["Course_code", "Course Code"],
                ["Publisher", "Publisher"],
                ["Year", "Year"],
                ["Edition", "Edition"],
              ].map(([name, label]) => (
                <div key={name}>
                  <label className="be-label-modal">{label}</label>
                  <input
                    className="be-input-modal"
                    name={name}
                    value={(formData as any)[name]}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}

              <button className="be-submit-modal" type="submit" disabled={loading}>
                {loading ? "Logging..." : "Log Books"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksEncoding;
