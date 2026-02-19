import "./ProgramCourse.css";
import { supabase } from "../../database/client";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

type BookRow = {
  id: number;
  Title: string | null;
  Author: string | null;
  Publisher: string | null;
  Year: string | null;
  Edition: string | null;
  Department: string | null;
  Program: string | null;
  Course_code: string | null;
};

const ProgramCourse = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);

  const [departments, setDepartments] = useState<string[]>([]);
  const [programs, setPrograms] = useState<string[]>([]);
  const [courseCodes, setCourseCodes] = useState<string[]>([]);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedCourseCode, setSelectedCourseCode] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState<BookRow[]>([]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log("Error logging out:", error.message);
  };

  useEffect(() => {
    const loadFilters = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from("books").select("Department, Program");
        if (error) throw error;

        const deptSet = new Set<string>();
        const progSet = new Set<string>();

        (data ?? []).forEach((row: any) => {
          if (row?.Department) deptSet.add(row.Department);
          if (row?.Program) progSet.add(row.Program);
        });

        setDepartments(Array.from(deptSet).sort());
        setPrograms(Array.from(progSet).sort());
      } catch (e: any) {
        console.log("Error loading filters:", e?.message || e);
      } finally {
        setLoading(false);
      }
    };

    loadFilters();
  }, []);

  useEffect(() => {
    const loadCourseCodes = async () => {
      if (!selectedDepartment || !selectedProgram) {
        setCourseCodes([]);
        setSelectedCourseCode("");
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("books")
          .select("Course_code")
          .eq("Department", selectedDepartment)
          .eq("Program", selectedProgram);

        if (error) throw error;

        const codesSet = new Set<string>();
        (data ?? []).forEach((row: any) => {
          if (row?.Course_code) codesSet.add(row.Course_code);
        });

        setCourseCodes(Array.from(codesSet).sort());
      } catch (e: any) {
        console.log("Error loading course codes:", e?.message || e);
        setCourseCodes([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourseCodes();
  }, [selectedDepartment, selectedProgram]);

  useEffect(() => {
    const loadBooks = async () => {
      if (!selectedDepartment || !selectedProgram || !selectedCourseCode) {
        setBooks([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("books")
          .select("id, Title, Author, Publisher, Year, Edition, Department, Program, Course_code")
          .eq("Department", selectedDepartment)
          .eq("Program", selectedProgram)
          .eq("Course_code", selectedCourseCode)
          .order("id", { ascending: true });

        if (error) throw error;

        setBooks((data ?? []) as BookRow[]);
      } catch (e: any) {
        console.log("Error loading books:", e?.message || e);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, [selectedDepartment, selectedProgram, selectedCourseCode]);

  const filteredBooks = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return books;

    return books.filter((b) => {
      const t = (b.Title ?? "").toLowerCase();
      const a = (b.Author ?? "").toLowerCase();
      return t.includes(q) || a.includes(q);
    });
  }, [books, searchTerm]);

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

          <button className="pc-signout" onClick={handleLogout}>
            ↩ Sign Out
          </button>
        </aside>

        {/* MAIN */}
        <main className="pc-main">
          <div className="pc-main-head">
            <h1 className="pc-title">Program &amp; Course view</h1>

            <div className="pc-head-right">
              <div className="pc-search">
                <input
                  type="text"
                  placeholder="Search Book"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="pc-search-ic">🔍</span>
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

          <section className="pc-grid">
            {/* LEFT FILTERS */}
            <div className="pc-leftCard">
              <label className="pc-label">Department</label>
              <div className="pc-selectWrap">
                <select
                  className="pc-select"
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setSelectedProgram("");
                    setSelectedCourseCode("");
                  }}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <span className="pc-caret">⌄</span>
              </div>

              <label className="pc-label">Program</label>
              <div className="pc-selectWrap">
                <select
                  className="pc-select"
                  value={selectedProgram}
                  onChange={(e) => {
                    setSelectedProgram(e.target.value);
                    setSelectedCourseCode("");
                  }}
                  disabled={!selectedDepartment}
                >
                  <option value="">Select Program</option>
                  {programs.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <span className="pc-caret">⌄</span>
              </div>

              <div className="pc-bigBox">
                {!selectedDepartment || !selectedProgram ? (
                  <div style={{ padding: 12, fontSize: 13, color: "#666" }}>
                    Select Department and Program first.
                  </div>
                ) : loading ? (
                  <div style={{ padding: 12, fontSize: 13 }}>Loading...</div>
                ) : courseCodes.length === 0 ? (
                  <div style={{ padding: 12, fontSize: 13 }}>No course codes found.</div>
                ) : (
                  <ul style={{ margin: 0, padding: 12, listStyle: "none" }}>
                    {courseCodes.map((code) => {
                      const active = code === selectedCourseCode;
                      return (
                        <li
                          key={code}
                          onClick={() => setSelectedCourseCode(code)}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 8,
                            cursor: "pointer",
                            marginBottom: 6,
                            border: "1px solid #eee",
                            background: active ? "#f4f4f4" : "#fff",
                            fontWeight: active ? 600 : 400,
                          }}
                        >
                          {code}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* RIGHT TABLE */}
            <div className="pc-rightCard">
              <div className="pc-tableTop">
                <div className="pc-tableTitle">
                  {selectedCourseCode || "Course Code"} Library
                </div>

                <button className="pc-sort" type="button" disabled>
                  SORT <span className="pc-sort-ic">⇅</span>
                </button>
              </div>

              <div className="pc-tableWrap">
                <table className="pc-table">
                  <thead>
                    <tr>
                      <th style={{ width: 90 }}>ID</th>
                      <th style={{ width: 200 }}>Title</th>
                      <th style={{ width: 120 }}>Author</th>
                      <th style={{ width: 140 }}>Publisher</th>
                      <th style={{ width: 70 }}>Year</th>
                      <th style={{ width: 130 }}>Course Code</th>
                      <th style={{ width: 90 }}>Edition</th>
                    </tr>
                  </thead>

                  <tbody>
                    {!selectedDepartment || !selectedProgram || !selectedCourseCode ? (
                      <tr>
                        <td colSpan={7} style={{ padding: 16, color: "#666" }}>
                          Select Department → Program → Course Code to view books.
                        </td>
                      </tr>
                    ) : loading ? (
                      <tr>
                        <td colSpan={7} style={{ padding: 16 }}>
                          Loading...
                        </td>
                      </tr>
                    ) : filteredBooks.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: 16 }}>
                          No books found for this course code.
                        </td>
                      </tr>
                    ) : (
                      filteredBooks.map((b) => (
                        <tr key={b.id}>
                          <td>{b.id}</td>
                          <td>{b.Title}</td>
                          <td>{b.Author}</td>
                          <td>{b.Publisher}</td>
                          <td>{b.Year}</td>
                          <td>{b.Course_code}</td>
                          <td>{b.Edition}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ProgramCourse;
