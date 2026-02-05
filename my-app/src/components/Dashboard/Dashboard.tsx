import "./Dashboard.css";
import { supabase } from "../../supabaseClient";

const Dashboard = () => {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log("Error logging out:", error.message);
  };

  return (
    <div className="app">
      <div className="topbar">Dashboard</div>

      <div className="layout">
        <aside className="sidebar">
          <div className="brand">
            <div className="logo" />
            <div>
              <div className="name">Library</div>
              <div className="sub">Dashboard</div>
            </div>
          </div>

          <nav className="nav">
            <a className="active" href="#">Dashboard</a>
            <a href="#">Program & Course View</a>
            <a href="#">Editions</a>
            <a href="#">Report Summary</a>
          </nav>

          <div className="spacer" />

          <div className="signout" onClick={handleLogout} style={{ cursor: "pointer" }}>Sign Out</div>
        </aside>

        <main className="main">
          <div className="main-header">
            <div className="search">
              <input type="text" placeholder="Search Here" />
            </div>

            <button className="log-btn">
              <span className="plus">+</span>
              Log New Book/s
            </button>
          </div>

          <section className="panel">
            <div className="panel-title">Book Info</div>

            <div className="cards">
              <div className="card" />
              <div className="card" />
              <div className="card" />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;