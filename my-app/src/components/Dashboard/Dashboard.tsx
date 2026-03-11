  import "./Dashboard.css";
  import { supabase } from "../../database/client";
  import { NavLink, useNavigate, useLocation } from "react-router-dom";
  import { useEffect, useState } from "react";

  type BookRow = {
    id: number; 
    Title: string | null;
    Author: string | null;
    Department: string | null;
    Program: string | null;
    Course_code: string | null;
    Created_at: string | null;
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const IconBooks = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );

  const IconCalendar = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );

  const IconBuilding = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  );

  const IconGraduationCap = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );

  const IconTag = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );

  const IconSearch = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  const IconFolder = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );

  const IconLayers = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );

  const IconBarChart = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );

  const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [books, setBooks] = useState<BookRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<BookRow[]>([]);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);

    const handleLogout = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) console.log("Error logging out:", error.message);
    };

    useEffect(() => {
      const loadBooks = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from("v_course_books")
            .select("book_id, title, author, department, program, course_code, created_at")
            .order("created_at", { ascending: false });

          if (error) throw error;

          const mapped: BookRow[] = (data ?? []).map((r: any) => ({
            id: r.book_id,                
            Title: r.title ?? null,
            Author: r.author ?? null,
            Department: r.department ?? null,
            Program: r.program ?? null,
            Course_code: r.course_code ?? null,
            Created_at: r.created_at ?? null,
          }));

          setBooks(mapped);
        } catch (e: any) {
          console.log("Error loading books:", e?.message || e);
        } finally {
          setLoading(false);
        }
      };
      loadBooks();
    }, []);

    useEffect(() => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        setShowSearchDropdown(false);
        return;
      }
      const term = searchTerm.toLowerCase();
      const filtered = books
        .filter(
          (b) =>
            b.Title?.toLowerCase().includes(term) ||
            b.Author?.toLowerCase().includes(term) ||
            b.Course_code?.toLowerCase().includes(term)
        )
        .slice(0, 6);
      setSearchResults(filtered);
      setShowSearchDropdown(filtered.length > 0);
    }, [searchTerm, books]);

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const booksThisMonth = books.filter((b) => {
      if (!b.Created_at) return false;
      const d = new Date(b.Created_at);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    const booksLastMonth = books.filter((b) => {
      if (!b.Created_at) return false;
      const d = new Date(b.Created_at);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    const totalBooks = books.length;
    const uniqueDepts = new Set(books.map((b) => b.Department).filter(Boolean)).size;
    const uniquePrograms = new Set(books.map((b) => b.Program).filter(Boolean)).size;
    const uniqueCourses = new Set(books.map((b) => b.Course_code).filter(Boolean)).size;

    const monthlyChange = booksThisMonth.length - booksLastMonth.length;
    const monthlyChangeLabel =
      monthlyChange > 0
        ? `+${monthlyChange} vs last month`
        : monthlyChange < 0
        ? `${monthlyChange} vs last month`
        : "Same as last month";

    const recentBooks = books.slice(0, 5);

    const last6Months: { label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(thisYear, thisMonth - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const count = books.filter((b) => {
        if (!b.Created_at) return false;
        const bd = new Date(b.Created_at);
        return bd.getMonth() === m && bd.getFullYear() === y;
      }).length;
      last6Months.push({ label: monthNames[m], count });
    }
    const maxCount = Math.max(...last6Months.map((m) => m.count), 1);

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
              <div className="dash-head-right">
                <div className="dash-search" style={{ position: "relative" }}>
                  <span className="dash-search-ic"><IconSearch /></span>
                  <input
                    type="text"
                    placeholder="Search book, author, course..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onBlur={() => setTimeout(() => setShowSearchDropdown(false), 180)}
                    onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                  />
                  {showSearchDropdown && (
                    <div className="dash-search-dropdown">
                      {searchResults.map((b) => (
                        <div
                          key={b.id}
                          className="dash-search-item"
                          onMouseDown={() => {
                            setSearchTerm(b.Title ?? "");
                            setShowSearchDropdown(false);
                          }}
                        >
                          <span className="dsi-title">{b.Title}</span>
                          <span className="dsi-meta">{b.Author} · {b.Course_code}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="pc-logbtn"
                  onClick={() =>
                    navigate("/books-encoding", {
                      state: { openModal: true, from: location.pathname },
                    })
                  }
                >
                Log Books
                </button>
              </div>
            </div>

            {loading ? (
              <div className="dash-loading">Loading data…</div>
            ) : (
              <>
                <section className="dash-stats">
                  <div className="stat-card stat-primary">
                    <div className="stat-icon"><IconBooks /></div>
                    <div className="stat-info">
                      <span className="stat-value">{totalBooks.toLocaleString()}</span>
                      <span className="stat-label">Total Books</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon"><IconCalendar /></div>
                    <div className="stat-info">
                      <span className="stat-value">{booksThisMonth.length}</span>
                      <span className="stat-label">Books This Month</span>
                      <span className={`stat-change ${monthlyChange >= 0 ? "pos" : "neg"}`}>
                        {monthlyChangeLabel}
                      </span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon"><IconBuilding /></div>
                    <div className="stat-info">
                      <span className="stat-value">{uniqueDepts}</span>
                      <span className="stat-label">Departments</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon"><IconGraduationCap /></div>
                    <div className="stat-info">
                      <span className="stat-value">{uniquePrograms}</span>
                      <span className="stat-label">Programs</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon"><IconTag /></div>
                    <div className="stat-info">
                      <span className="stat-value">{uniqueCourses}</span>
                      <span className="stat-label">Course Codes</span>
                    </div>
                  </div>
                </section>

                <section className="dash-bottom">
                  <div className="dash-chart-card">
                    <h2 className="dash-card-title">Books Logged — Last 6 Months</h2>
                    <div className="dash-bar-chart">
                      {last6Months.map((m) => (
                        <div className="bar-col" key={m.label}>
                          <span className="bar-value">{m.count}</span>
                          <div className="bar-wrap">
                            <div className="bar-fill" style={{ height: `${(m.count / maxCount) * 100}%` }} />
                          </div>
                          <span className="bar-label">{m.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="dash-recent-card">
                    <h2 className="dash-card-title">Recently Logged Books</h2>
                    {recentBooks.length === 0 ? (
                      <p className="dash-empty">No books logged yet.</p>
                    ) : (
                      <ul className="dash-recent-list">
                        {recentBooks.map((b) => {
                          const d = b.Created_at ? new Date(b.Created_at) : null;
                          const dateStr = d ? `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` : "—";
                          return (
                            <li key={b.id} className="dash-recent-item">
                              <div className="dri-left">
                                <span className="dri-title">{b.Title ?? "Untitled"}</span>
                                <span className="dri-meta">
                                  {b.Author ?? "Unknown Author"} · {b.Department ?? "—"} · {b.Course_code ?? "—"}
                                </span>
                              </div>
                              <span className="dri-date">{dateStr}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    <button className="dash-viewall" onClick={() => navigate("/report-summary")}>
                      View Full Report →
                    </button>
                  </div>
                </section>

                <section className="dash-quicknav">
                  <h2 className="dash-card-title">Quick Access</h2>
                  <div className="dash-qnav-grid">
                    <button className="qnav-card" onClick={() => navigate("/program-course")}>
                      <span className="qnav-icon"><IconFolder /></span>
                      <span className="qnav-label">Program &amp; Course View</span>
                      <span className="qnav-desc">Browse books by department, program, and course code</span>
                    </button>
                    <button className="qnav-card" onClick={() => navigate("/editions")}>
                      <span className="qnav-icon"><IconLayers /></span>
                      <span className="qnav-label">Editions</span>
                      <span className="qnav-desc">Browse and manage book editions</span>
                    </button>
                    <button className="qnav-card" onClick={() => navigate("/report-summary")}>
                      <span className="qnav-icon"><IconBarChart /></span>
                      <span className="qnav-label">Report Summary</span>
                      <span className="qnav-desc">Filter, view, and print monthly book reports</span>
                    </button>
                  </div>
                </section>
              </>
            )}
          </main>
        </div>
      </div>
    );
  };

  export default Dashboard;