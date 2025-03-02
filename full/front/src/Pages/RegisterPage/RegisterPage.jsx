import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Registerpage.css'
import Navbar from '../../Components/Navbar/Navbar';
import Footer from '../../Components/Footer/Footer';


const RegisterPage = () => {
    const [formData, setFormData] = useState({
      name: '',
      mobileNumber: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student'
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (formData.role === 'admin') {
      try {
        const adminCountResponse = await axios.get('http://localhost:3001/admincount');
        if (adminCountResponse.data.count >= 2) {
          alert('Only 2 admins can exist on the website.');
          return;
        }
      } catch (error) {
        alert('Error checking admin count');
        return;
      }
    }

    try {
      const response = await axios.post('http://localhost:3001/register', formData);
      alert(response.data);
      navigate('/login');
    } catch (error) {
      alert('Error registering user');
    }
  };

  return (
    <div className="register-page">
      <Navbar />
      <div className="register-container">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="mobileNumber">Mobile Number</label>
            <input type="mobileNumber" id="mobileNumber" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange} required>
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="register-button">Register</button>
        </form>
        <p className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterPage;
