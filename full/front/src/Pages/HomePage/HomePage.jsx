import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import Navbar from '../../Components/Navbar/Navbar';
import Footer from '../../Components/Footer/Footer';


const HomePage = () => {
  return (
    <div className="homepage">
      <Navbar />
      <header className="header">
        <h1>PrintShop</h1>
        <p>Your one-stop shop for printouts and more!</p>
        <Link to="/register" className="get-started-button">Get Started</Link>
      </header>
      <section className="features">
        <div className="feature">
          <h2>Print Services</h2>
          <p>Upload your documents and pick up your printouts at your convenience.</p>
          <Link to="/login" className="upload-button">Upload Document</Link>
        </div>
        <div className="feature">
          <h2>Photocopy</h2>
          <p>Upload your documents Quick and easy photocopy services for all your needs.</p>
          <Link to="/login" className="upload-button">Upload Document</Link>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default HomePage;