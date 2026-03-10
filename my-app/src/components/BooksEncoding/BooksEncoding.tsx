import "./BooksEncoding.css";
import { supabase } from "../../database/client";
import { useEffect, useMemo, useState, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

type CourseRow = {
  id: number;
  department: string | null;
  program: string | null;
  course_code: string | null;
  course_title: string | null;
};

type BookInsert = {
  source_key: string;
  acc_no: string | null;
  call_no: string | null;
  title: string;
  author: string | null;
  publisher: string | null;
  copyright_year: number | null;
  num_vols: number | null;
  isbn: string | null;
  supplier: string | null;
  year_purchase: number | null;
  apa_citation: string | null;
};

type FormState = {
  title: string;
  author: string;
  department: string;
  program: string;
  course_code: string;
  publisher: string;
  year: string;
  year_purchase: string;
  num_vols: string;
  acc_no: string;
  call_no: string;
  isbn: string;
  supplier: string;
  apa_citation: string;
};

const DEFAULT_FORM: FormState = {
  title: "",
  author: "",
  department: "",
  program: "",
  course_code: "",
  publisher: "",
  year: "",
  year_purchase: "",
  num_vols: "",
  acc_no: "",
  call_no: "",
  isbn: "",
  supplier: "",
  apa_citation: "",
};

function trimOrNull(s: string) {
  const t = s.trim();
  return t ? t : null;
}

function toIntOrNull(s: string) {
  const t = s.trim();
  if (!t) return null;
  const n = parseInt(t, 10);
  return Number.isFinite(n) ? n : null;
}

function coalesceGeneral(s: string) {
  const t = s.trim();
  return t ? t : "General";
}

function makeSourceKey() {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MANUAL-${Date.now()}-${rand}`;
}

async function getOrCreateCourseId(dept: string, prog: string, code: string) {
  const { data: existingCourse, error: findErr } = await supabase
    .from("library_courses")
    .select("id, department, program, course_code, course_title")
    .eq("department", dept)
    .eq("program", prog)
    .eq("course_code", code)
    .maybeSingle<CourseRow>();

  if (findErr) throw findErr;
  if (existingCourse?.id) return existingCourse.id;

  const { data: newCourse, error: insCourseErr } = await supabase
    .from("library_courses")
    .insert([{ department: dept, program: prog, course_code: code, course_title: null }])
    .select("id")
    .single();

  if (insCourseErr) throw insCourseErr;
  return newCourse.id as number;
}

async function insertBookAndLink(courseId: number, payload: BookInsert) {
  const { data: bookRow, error: bookErr } = await supabase
    .from("library_books")
    .insert([payload])
    .select("id")
    .single();

  if (bookErr) throw bookErr;

  const { error: linkErr } = await supabase
    .from("library_book_courses")
    .insert([{ book_id: bookRow.id, course_id: courseId }]);

  if (linkErr) throw linkErr;

  return bookRow.id as number;
}

function BookEncodingModal(props: {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  formData: FormState;
  setFormData: React.Dispatch<React.SetStateAction<FormState>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const { loading, setLoading, formData, setFormData, onClose, onSubmit } = props;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const REQUIRED_HEADERS = [
    "Book Title", "Year Purchase", "Author", "Number of Volumes",
    "Department", "Acc. Number", "Program", "Call Number",
    "Course Code", "ISBN", "Publisher", "Supplier",
    "Year (Copyright)", "APA Citation"
  ];

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = ""; // reset input

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls") && !fileName.endsWith(".csv")) {
      alert("File imported is not an Excel file");
      return;
    }

    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const headers = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 })[0] || [];

      if (
        headers.length !== REQUIRED_HEADERS.length ||
        !REQUIRED_HEADERS.every(h => headers.includes(h as any))
      ) {
        alert("Excel file imported is incorrect");
        setLoading(false);
        return;
      }

      const data = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

      for (const row of data) {
        const title = trimOrNull(String(row["Book Title"] || ""));
        if (!title) continue; // Skip rows without a book title

        const dept = coalesceGeneral(String(row["Department"] || ""));
        const prog = coalesceGeneral(String(row["Program"] || ""));
        const code = coalesceGeneral(String(row["Course Code"] || ""));

        const courseId = await getOrCreateCourseId(dept, prog, code);

        const payload: BookInsert = {
          source_key: makeSourceKey(),
          acc_no: trimOrNull(String(row["Acc. Number"] || "")),
          call_no: trimOrNull(String(row["Call Number"] || "")),
          title: title,
          author: trimOrNull(String(row["Author"] || "")),
          publisher: trimOrNull(String(row["Publisher"] || "")),
          copyright_year: toIntOrNull(String(row["Year (Copyright)"] || "")),
          num_vols: toIntOrNull(String(row["Number of Volumes"] || "")),
          isbn: trimOrNull(String(row["ISBN"] || "")),
          supplier: trimOrNull(String(row["Supplier"] || "")),
          year_purchase: toIntOrNull(String(row["Year Purchase"] || "")),
          apa_citation: trimOrNull(String(row["APA Citation"] || "")),
        };

        await insertBookAndLink(courseId, payload);
      }

      alert("Books imported successfully!");
      onClose();
    } catch (err: any) {
      alert("Error importing books: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  return (
    <div className="be-overlay" onClick={onClose}>
      <div className="be-modal" onClick={(e) => e.stopPropagation()}>
        <button className="be-close" onClick={onClose} aria-label="Close">
          x
        </button>

        <h2 className="be-title-modal">Book Encoding</h2>

        <form className="be-form-modal" onSubmit={onSubmit}>
          <div className="be-col">
            <div className="be-field">
              <label className="be-label-modal">Book Title</label>
              <input
                className="be-input-modal"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="be-field">
              <label className="be-label-modal">Author</label>
              <input
                className="be-input-modal"
                name="author"
                value={formData.author}
                onChange={handleChange}
              />
            </div>

            <div className="be-field">
              <label className="be-label-modal">Department</label>
              <input
                className="be-input-modal"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="(blank = General)"
              />
            </div>

            <div className="be-field">
              <label className="be-label-modal">Program</label>
              <input
                className="be-input-modal"
                name="program"
                value={formData.program}
                onChange={handleChange}
                placeholder="(blank = General)"
              />
            </div>

            <div className="be-field">
              <label className="be-label-modal">Course Code</label>
              <input
                className="be-input-modal"
                name="course_code"
                value={formData.course_code}
                onChange={handleChange}
                placeholder="(blank = General)"
              />
            </div>

            <div className="be-field">
              <label className="be-label-modal">Publisher</label>
              <input
                className="be-input-modal"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
              />
            </div>

            <div className="be-field">
              <label className="be-label-modal">Year (Copyright)</label>
              <input
                className="be-input-modal"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="e.g., 2024"
              />
            </div>
          </div>

          <div className="be-col">
            <div className="be-field">
              <label className="be-label-modal">Year Purchase</label>
              <input
                className="be-input-modal"
                name="year_purchase"
                value={formData.year_purchase}
                onChange={handleChange}
                placeholder="e.g., 2025"
              />
            </div>

            <div className="be-field">
              <label className="be-label-modal">Number of Volumes</label>
              <input
                className="be-input-modal"
                name="num_vols"
                value={formData.num_vols}
                onChange={handleChange}
                placeholder="e.g., 1"
              />
            </div>

            <div className="be-field">
              <label className="be-label-modal">Acc. Number</label>
              <input
                className="be-input-modal"
                name="acc_no"
                value={formData.acc_no}
                onChange={handleChange}
              />
            </div>

            <div className="be-field">
              <label className="be-label-modal">Call Number</label>
              <input
                className="be-input-modal"
                name="call_no"
                value={formData.call_no}
                onChange={handleChange}
              />
            </div>

            <div className="be-field">
              <label className="be-label-modal">ISBN</label>
              <input className="be-input-modal" name="isbn" value={formData.isbn} onChange={handleChange} />
            </div>

            <div className="be-field">
              <label className="be-label-modal">Supplier</label>
              <input
                className="be-input-modal"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
              />
            </div>

            <div className="be-field">
              <label className="be-label-modal">APA Citation</label>
              <input
                className="be-input-modal"
                name="apa_citation"
                value={formData.apa_citation}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="be-actions">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button
              className="be-submit-modal"
              type="button"
              onClick={handleImportClick}
              disabled={loading}
              style={{ marginRight: "10px" }}
            >
              Import Excel
            </button>
            <button className="be-submit-modal" type="submit" disabled={loading}>
              {loading ? "Logging..." : "Log Books"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const BooksEncoding = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<FormState>(DEFAULT_FORM);

  const resetForm = () => setFormData(DEFAULT_FORM);

  const fromPath = useMemo(() => (location.state as any)?.from as string | undefined, [location.state]);

  const closeAndReturn = () => {
    setIsModalOpen(false);
    resetForm();
    if (fromPath) navigate(fromPath, { replace: true });
  };

  useEffect(() => {
    if ((location.state as any)?.openModal) {
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (!isModalOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAndReturn();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen, fromPath]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log("Error logging out:", error.message);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dept = coalesceGeneral(formData.department);
      const prog = coalesceGeneral(formData.program);
      const code = coalesceGeneral(formData.course_code);

      const bookTitle = formData.title.trim();
      if (!bookTitle) throw new Error("Book Title is required.");

      const courseId = await getOrCreateCourseId(dept, prog, code);

      const payload: BookInsert = {
        source_key: makeSourceKey(),
        acc_no: trimOrNull(formData.acc_no),
        call_no: trimOrNull(formData.call_no),
        title: bookTitle,
        author: trimOrNull(formData.author),
        publisher: trimOrNull(formData.publisher),
        copyright_year: toIntOrNull(formData.year),
        num_vols: toIntOrNull(formData.num_vols),
        isbn: trimOrNull(formData.isbn),
        supplier: trimOrNull(formData.supplier),
        year_purchase: toIntOrNull(formData.year_purchase),
        apa_citation: trimOrNull(formData.apa_citation),
      };

      await insertBookAndLink(courseId, payload);

      alert("Book added successfully!");
      closeAndReturn();
    } catch (err: any) {
      alert("Error adding book: " + (err?.message || err));
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

      {isModalOpen && (
        <BookEncodingModal
          loading={loading}
          setLoading={setLoading}
          formData={formData}
          setFormData={setFormData}
          onClose={closeAndReturn}
          onSubmit={handleAdd}
        />
      )}
    </div>
  );
};

export default BooksEncoding;