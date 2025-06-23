// src/pages/Home.jsx
import "./Home.css";
import logo from '../assets/logoR.png';
import album from '../assets/album1.jpg';
import user from '../assets/user.png';



export default function Home() {
  return (
    <>
    <div className="home-container">
      <header className="navbar">
        <div className="logo-area">
        <img src={logo} alt="RhythMe logo" className="logo1" />
        </div>
        <input
          type="text"
          placeholder="Busca música, artistas, playlist..."
          className="search-bar"
        />
        <div className="navbar-icons">
          <span className="icon notif">🔔</span>
          <span className="icon user">👤</span>
        </div>
      </header>

      <section className="stories">
        <div className="story add">+</div>
        <div className="story">STORY</div>
        <div className="story">STORY</div>
        <div className="story">STORY</div>
        <div className="story">STORY</div>
        <div className="story">STORY</div>
        <div className="story">STORY</div>
        <div className="story">STORY</div>
        <div className="story">STORY</div>
        <div className="story">STORY</div>
        <div className="story">STORY</div>
        <div className="story">STORY</div>
        <div className="story">STORY</div>
        <div className="story">STORY</div>
        <div className="story">STORY</div>
        <div className="story">STORY</div>
        <div className="story">STORY</div>
        <div className="story">STORY</div>
      </section>

      <main className="feed">
        <div className="post-card">
          <div className="post-header">
                <img src={user} alt="user" className="avatar" />   
            <div className="post-user">
              <strong>Usuario de Prueba</strong>
              <span className="time">hace 1 hora...</span>
            </div>
          </div>
          <p className="post-text">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cumque, ducimus.<br />
            Lorem ipsum dolor sit amet consectetur.<br/>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit.! 🔥
          </p>
          <img src={album} alt="album" className="post-image" />
          <div className="post-actions">
            <button className="action-btn">❤️</button>
            <button className="action-btn">💬</button>
            <button className="action-btn">🔗</button>
          </div>
        </div>

        <div className="post-card">
          <div className="post-header">
                <img src={user} alt="user" className="avatar" />   
            <div className="post-user">
              <strong>Usuario de Prueba 2</strong>
              <span className="time">hace 2 horas...</span>
            </div>
          </div>
          <p className="post-text">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Architecto nobis impedit eveniet?
          </p>
          <div className="post-actions">
            <button className="action-btn">❤️</button>
            <button className="action-btn">💬</button>
            <button className="action-btn">🔗</button>
          </div>
        </div>
      </main>
      </div>
    </>
  );
}
