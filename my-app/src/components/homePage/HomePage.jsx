import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import "./HomePage.css"; // עיצוב לדף הבית

const HomePage = () => {
  return (
    <div className="home-page">
      <section className="hero" dir="rtl">
        <div className="hero-content">
          <span className="hero-badge">
            <Inventory2OutlinedIcon fontSize="small" />
            קהילה משתפת חפצים
          </span>

          <h1 className="hero-title">
            מוצאים. משתפים. <span className="hero-title-accent">מוסרים.</span>
          </h1>

          <p className="hero-subtitle">
            לכל חפץ שכבר לא צריכים יש מישהו שישמח לקבל אותו. פרסמו חפצים
            שאינכם משתמשים בהם יותר, גלו מה השכנים שלכם מוסרים, ותנו לדברים
            חיים חדשים – בקלות, בחינם ובלב פתוח.
          </p>

          <form className="hero-search" onSubmit={(e) => e.preventDefault()}>
            <SearchIcon fontSize="small" className="hero-search-icon" />
            <input
              type="text"
              className="hero-search-input"
              placeholder="מה אתם מחפשים?"
            />
            <button type="submit" className="hero-search-btn">
              חיפוש
            </button>
          </form>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-visual-circle">
            <VolunteerActivismIcon className="hero-visual-icon" />
          </div>
          <div className="hero-visual-chip">
            <HomeOutlinedIcon fontSize="small" />
            <span>חפצים ליד הבית</span>
          </div>
          <span className="hero-visual-dot hero-visual-dot--1" />
          <span className="hero-visual-dot hero-visual-dot--2" />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
