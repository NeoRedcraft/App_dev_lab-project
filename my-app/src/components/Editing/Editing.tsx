import "./Editing.css";
import { supabase } from "../../database/client";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

type ViewRow = {
  department: string | null;
  program: string | null;
  course_code: string | null;
  course_title: string | null;

  book_id: number;
  acc_no: string | null;
  call_no: string | null;
  title: string | null;
  author: string | null;
  publisher: string | null;
  copyright_year: number | null;
  num_vols: number | null;
  isbn: string | null;
  supplier: string | null;
  year_purchase: number | null;
  apa_citation: string | null;
};

type BookRow = {
  id: number;
  acc_no: string | null;
  call_no: string | null;
  title: string | null;
  author: string | null;
  publisher: string | null;
  copyright_year: number | null;
  num_vols: number | null;
  isbn: string | null;
  supplier: string | null;
  year_purchase: number | null;
  apa_citation: string | null;
};

const normalizeText = (v: string) => v.trim();
const normalizeOrNull = (v: string) => {
  const t = v.trim();
  return t === "" ? null : t;
};
const toIntOrNull = (v: string) => {
  const t = v.trim();
  if (!t) return null;
  const n = parseInt(t, 10);
  return Number.isFinite(n) ? n : null;
};

const Editing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const bookId = useMemo(() => {
    const raw = params.bookId ?? "";
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  }, [params.bookId]);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    department: "",
    program: "",
    course_code: "",
    course_title: "",

    publisher: "",
    copyright_year: "",
    year_purchase: "",
    num_vols: "",

    acc_no: "",
    call_no: "",
    isbn: "",
    supplier: "",
    apa_citation: "",
  });

  const closeAndReturn = () => {
    const from = (location.state as any)?.from;
    setIsModalOpen(false);
    if (from) {
      navigate(from, { replace: true });
    } else {
      navigate("/program-course", { replace: true });
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAndReturn();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log("Error logging out:", error.message);
  };

  useEffect(() => {
    const load = async () => {
      if (!bookId) {
        alert("Invalid book id.");
        navigate("/program-course", { replace: true });
        return;
      }

      setPageLoading(true);
      try {
        const { data: viewRows, error: viewErr } = await supabase
          .from("v_course_books")
          .select(
            "department, program, course_code, course_title, book_id, acc_no, call_no, title, author, publisher, copyright_year, num_vols, isbn, supplier, year_purchase, apa_citation"
          )
          .eq("book_id", bookId)
          .limit(1);

        if (viewErr) throw viewErr;

        if (viewRows && viewRows.length > 0) {
          const r = viewRows[0] as ViewRow;
          setFormData({
            title: r.title ?? "",
            author: r.author ?? "",
            department: r.department ?? "",
            program: r.program ?? "",
            course_code: r.course_code ?? "",
            course_title: r.course_title ?? "",

            publisher: r.publisher ?? "",
            copyright_year: r.copyright_year?.toString() ?? "",
            year_purchase: r.year_purchase?.toString() ?? "",
            num_vols: r.num_vols?.toString() ?? "",

            acc_no: r.acc_no ?? "",
            call_no: r.call_no ?? "",
            isbn: r.isbn ?? "",
            supplier: r.supplier ?? "",
            apa_citation: r.apa_citation ?? "",
          });
          return;
        }

        const { data: book, error: bookErr } = await supabase
          .from("library_books")
          .select("id, acc_no, call_no, title, author, publisher, copyright_year, num_vols, isbn, supplier, year_purchase, apa_citation")
          .eq("id", bookId)
          .single();

        if (bookErr) throw bookErr;

        const b = book as BookRow;
        setFormData((prev) => ({
          ...prev,
          title: b.title ?? "",
          author: b.author ?? "",
          publisher: b.publisher ?? "",
          copyright_year: b.copyright_year?.toString() ?? "",
          year_purchase: b.year_purchase?.toString() ?? "",
          num_vols: b.num_vols?.toString() ?? "",
          acc_no: b.acc_no ?? "",
          call_no: b.call_no ?? "",
          isbn: b.isbn ?? "",
          supplier: b.supplier ?? "",
          apa_citation: b.apa_citation ?? "",
        }));
      } catch (e: any) {
        console.log("Error loading book:", e?.message || e);
        alert("Failed to load book data.");
        navigate("/program-course", { replace: true });
      } finally {
        setPageLoading(false);
      }
    };

    load();
  }, [bookId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookId) return;

    setLoading(true);
    try {
      const payload = {
        acc_no: normalizeOrNull(formData.acc_no),
        call_no: normalizeOrNull(formData.call_no),
        title: normalizeOrNull(formData.title),
        author: normalizeOrNull(formData.author),
        publisher: normalizeOrNull(formData.publisher),
        copyright_year: toIntOrNull(formData.copyright_year),
        num_vols: toIntOrNull(formData.num_vols),
        isbn: normalizeOrNull(formData.isbn),
        supplier: normalizeOrNull(formData.supplier),
        year_purchase: toIntOrNull(formData.year_purchase),
        apa_citation: normalizeOrNull(formData.apa_citation),
      };

      const { error: updErr } = await supabase
        .from("library_books")
        .update(payload)
        .eq("id", bookId);

      if (updErr) throw updErr;

      const dept = normalizeText(formData.department || "");
      const prog = normalizeText(formData.program || "");
      const code = normalizeText(formData.course_code || "");
      const ctitle = normalizeOrNull(formData.course_title);

      const shouldLink = code !== "";

      if (shouldLink) {
        const { error: courseUpsertErr } = await supabase
          .from("library_courses")
          .upsert(
            [
              {
                department: dept || "General",
                program: prog || "General",
                course_code: code || "General",
                course_title: ctitle,
              },
            ],
            { onConflict: "department,program,course_code" }
          );

        if (courseUpsertErr) throw courseUpsertErr;

        // 2) Get course_id
        const { data: courseRow, error: courseFetchErr } = await supabase
          .from("library_courses")
          .select("id")
          .eq("department", dept || "General")
          .eq("program", prog || "General")
          .eq("course_code", code || "General")
          .single();

        if (courseFetchErr) throw courseFetchErr;

        const courseId = courseRow?.id;

        const { error: delErr } = await supabase
          .from("library_book_courses")
          .delete()
          .eq("book_id", bookId);

        if (delErr) throw delErr;

        const { error: linkErr } = await supabase
          .from("library_book_courses")
          .insert([{ course_id: courseId, book_id: bookId }]);

        if (linkErr) throw linkErr;
      }

      alert("Book updated successfully!");
      closeAndReturn();
    } catch (err: any) {
      console.log(err);
      alert("Error updating book: " + (err?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pc-page">
      <header className="pc-topbar">
        <img className="pc-toplogo" src="/images/logo2.webp" alt="MAPUA LIBRARY" />
      </header>

      <div className="pc-body">
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

        <main className="pc-main">
          <div className="pc-main-head">
            <h1 className="pc-title">Books Encoding</h1>
            <div className="pc-head-right">
              <div className="pc-search">
                <input type="text" placeholder="Search Here" disabled />
                <span className="pc-search-ic">🔍</span>
              </div>
              <button className="pc-logbtn" disabled>
                Log New Book/s
              </button>
            </div>
          </div>

          <section className="pc-rightCard" />
        </main>
      </div>

      {isModalOpen && (
        <div className="be-overlay" onClick={closeAndReturn}>
          <div className="be-modal be-modal-wide" onClick={(e) => e.stopPropagation()}>
            <button className="be-close" onClick={closeAndReturn}>
              x
            </button>

            <h2 className="be-title-modal">Editing</h2>

            {pageLoading ? (
              <div className="be-loading">Loading book data…</div>
            ) : (
              <form className="be-form-grid" onSubmit={handleSave}>
                <div className="be-col">
                  <div className="be-field">
                    <label className="be-label-modal">Book Title</label>
                    <input className="be-input-modal" name="title" value={formData.title} onChange={handleChange} required />
                  </div>

                  <div className="be-field">
                    <label className="be-label-modal">Author</label>
                    <input className="be-input-modal" name="author" value={formData.author} onChange={handleChange} />
                  </div>

                  <div className="be-field">
                    <label className="be-label-modal">Department</label>
                    <input className="be-input-modal" name="department" value={formData.department} onChange={handleChange} />
                  </div>

                  <div className="be-field">
                    <label className="be-label-modal">Program</label>
                    <input className="be-input-modal" name="program" value={formData.program} onChange={handleChange} />
                  </div>

                  <div className="be-field">
                    <label className="be-label-modal">Course Code</label>
                    <input className="be-input-modal" name="course_code" value={formData.course_code} onChange={handleChange} />
                  </div>

                  <div className="be-field">
                    <label className="be-label-modal">Publisher</label>
                    <input className="be-input-modal" name="publisher" value={formData.publisher} onChange={handleChange} />
                  </div>

                  <div className="be-field">
                    <label className="be-label-modal">Year (Copyright)</label>
                    <input className="be-input-modal" name="copyright_year" value={formData.copyright_year} onChange={handleChange} />
                  </div>
                </div>

                <div className="be-col">
                  <div className="be-field">
                    <label className="be-label-modal">Year Purchase</label>
                    <input className="be-input-modal" name="year_purchase" value={formData.year_purchase} onChange={handleChange} />
                  </div>

                  <div className="be-field">
                    <label className="be-label-modal">Number of Volumes</label>
                    <input className="be-input-modal" name="num_vols" value={formData.num_vols} onChange={handleChange} />
                  </div>

                  <div className="be-field">
                    <label className="be-label-modal">Acc. Number</label>
                    <input className="be-input-modal" name="acc_no" value={formData.acc_no} onChange={handleChange} />
                  </div>

                  <div className="be-field">
                    <label className="be-label-modal">Call Number</label>
                    <input className="be-input-modal" name="call_no" value={formData.call_no} onChange={handleChange} />
                  </div>

                  <div className="be-field">
                    <label className="be-label-modal">ISBN</label>
                    <input className="be-input-modal" name="isbn" value={formData.isbn} onChange={handleChange} />
                  </div>

                  <div className="be-field">
                    <label className="be-label-modal">Supplier</label>
                    <input className="be-input-modal" name="supplier" value={formData.supplier} onChange={handleChange} />
                  </div>

                  <div className="be-field">
                    <label className="be-label-modal">Course Title (optional)</label>
                    <input className="be-input-modal" name="course_title" value={formData.course_title} onChange={handleChange} />
                  </div>
                </div>

                <div className="be-actions">
                  <button className="be-submit-modal" type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Editing;