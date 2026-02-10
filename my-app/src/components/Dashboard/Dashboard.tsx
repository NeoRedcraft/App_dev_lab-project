import "./Dashboard.css";
import { supabase } from "../../supabaseClient";

const Dashboard = () => {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log("Error logging out:", error.message);
  };

  return (
    <div className="app">
      <div className="layout">
        <aside className="sidebar">
          <div className="brand">
            <img
              className="logo"
              src="/images/logo.png"
              alt="Mapúa"
            />
          </div>

           <nav className="nav">
            <a className="active" href="#">
              <span className="nav-ic">🏠</span>
              <span>Dashboard</span>
            </a>

            <a href="#">
              <span className="nav-ic">⭐</span>
              <span>Program & Course view</span>
            </a>

            <a href="#">
              <span className="nav-ic">📖</span>
              <span>Editions</span>
            </a>

            <a href="#">
              <span className="nav-ic">📄</span>
              <span>Report Summary</span>
            </a>
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

            <button className="log-btn">
              <span className="plus">+</span>
              Log New Book/s
            </button>
          </div>

          <section className="panel">
            <div className="panel-title">Book Info</div>

            <div className="cards">
              <div className="card stat-box" />
              <div className="card stat-box" />
              <div className="card stat-box" />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;