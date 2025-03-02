import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';
import Navbar from '../../Components/Navbar/Navbar';
import Footer from '../../Components/Footer/Footer';


const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', {
        email: formData.email,
        password: formData.password
      });
      if (response.data.message === 'Login successful') {
        localStorage.setItem('userId', response.data.userId); // Store user ID in local storage
        if (response.data.role === 'admin') {
          navigate('/admin-dashboard'); // Navigate to the admin dashboard
        } else {
          navigate('/user-dashboard'); // Navigate to the user dashboard
        }
      } else {
        alert(response.data);
      }
    } catch (error) {
      alert('Error logging in');
    }
  };

  return (
    <div className="login-page">
      <Navbar />
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>

        <p className="login-link">
          Don't you have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;
