import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboardpage.css';
import Navbar from '../../Components/Navbar/Navbar';
import Footer from '../../Components/Footer/Footer';
import { logout } from '../../auth';

const DashboardPage = () => {
  const [userData, setUserData] = useState({
    name: '',
    mobileNumber: '',
    email: '',
    password: '',
    role: ''
  });

  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [orders, setOrders] = useState([]);
  const [printFile, setPrintFile] = useState(null);
  const [photocopyFile, setPhotocopyFile] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [updateFile, setUpdateFile] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/user/${userId}`);
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/orders/${userId}`);
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchUserData();
    fetchOrders();
  }, [navigate]);

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      const userId = localStorage.getItem('userId');
      await axios.put(`http://localhost:3001/user/${userId}`, userData);
      setEditMode(false);
      alert('User data updated successfully');
    } catch (error) {
      console.error('Error updating user data:', error);
      alert('Error updating user data');
    }
  };

  const handleFileUpload = async (files, type) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const userId = localStorage.getItem('userId');
      await axios.post(`http://localhost:3001/upload/${type}/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} job uploaded successfully`);
      const ordersResponse = await axios.get(`http://localhost:3001/orders/${userId}`);
      setOrders(ordersResponse.data);
    } catch (error) {
      console.error(`Error uploading ${type} job:`, error);
      alert(`Error uploading ${type} job`);
    }
  };

  const handlePrintUpload = (e) => {
    e.preventDefault();
    handleFileUpload(printFile, 'print');
  };

  const handlePhotocopyUpload = (e) => {
    e.preventDefault();
    handleFileUpload(photocopyFile, 'photocopy');
  };

  const getMainFileName = (fileName) => {
    return fileName.split('-').slice(1).join('-');
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Processing':
        return 'status-processing';
      case 'Completed':
        return 'status-completed';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await axios.delete(`http://localhost:3001/orders/${orderId}`);
      alert('Order deleted successfully');
      const userId = localStorage.getItem('userId');
      const ordersResponse = await axios.get(`http://localhost:3001/orders/${userId}`);
      setOrders(ordersResponse.data);
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error deleting order');
    }
  };

  const handleEditOrder = (order) => {
    setEditOrder(order);
  };

  const handleSaveOrder = async () => {
    if (updateFile) {
      const formData = new FormData();
      for (let i = 0; i < updateFile.length; i++) {
        formData.append('files', updateFile[i]);
      }

      try {
        await axios.put(`http://localhost:3001/orders/${editOrder.id}/document`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        alert('Order document updated successfully');
        setEditOrder(null);
        const userId = localStorage.getItem('userId');
        const ordersResponse = await axios.get(`http://localhost:3001/orders/${userId}`);
        setOrders(ordersResponse.data);
      } catch (error) {
        console.error('Error updating order document:', error);
        alert('Error updating order document');
      }
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <button onClick={logout} className="dashboard-logout-button">Logout</button>
        <h2>User Dashboard</h2>
        <div className="main-content">
          <div className="user-details">
            {editMode ? (
              <div className="edit-form">
                <div className="form-group">
                  <label htmlFor="id">ID</label>
                  <input type="text" id="id" name="id" value={userData.id} onChange={handleChange} disabled/>
                </div>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input type="text" id="name" name="name" value={userData.name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="mobileNumber">Mobile Number</label>
                  <input type="text" id="mobileNumber" name="mobileNumber" value={userData.mobileNumber} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" name="email" value={userData.email} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input type={showPassword ? "text" : "password"} id="password" name="password" value={userData.password} onChange={handleChange} />
                  <div className="show-password">
                    <input type="checkbox" id="showPassword" checked={showPassword} onChange={() => setShowPassword(!showPassword)} />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <input type="text" id="role" name="role" value={userData.role} onChange={handleChange} disabled />
                </div>
                <button onClick={handleSave} className="save-button">Save</button>
              </div>
            ) : (
              <div className="user-info">
                <p><strong>ID:</strong> {userData.id}</p>
                <p><strong>Name:</strong> {userData.name}</p>
                <p><strong>Mobile Number:</strong> {userData.mobileNumber}</p>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Password:</strong> {userData.password ? userData.password.replace(/./g, '*') : ''}</p>
                <p><strong>Role:</strong> {userData.role}</p>
                <button onClick={() => setEditMode(true)} className="edit-button">Edit</button>
              </div>
            )}
          </div>

          <div className="dashboard-content">
          <div className="dashboard-card">
            <h3>Print Services</h3>
            <form onSubmit={handlePrintUpload}>
              <input type="file" name="files" onChange={(e) => setPrintFile(e.target.files)} multiple required />
              <button type="submit">Upload Print Job</button>
            </form>
          </div>
          <div className="dashboard-card">
            <h3>Photocopy Services</h3>
            <form onSubmit={handlePhotocopyUpload}>
              <input type="file" name="files" onChange={(e) => setPhotocopyFile(e.target.files)} multiple required />
              <button type="submit">Upload Photocopy Job</button>
            </form>
          </div>
          </div>

          <div className="order-history">
            <h3>Order Details</h3>
            <ul>
              {orders.map((order) => (
                <li key={order.id}>
                  <strong>Type:</strong> {order.type} | <strong>Details:</strong> {getMainFileName(order.details)} | <strong>Status:</strong> <span className={getStatusClass(order.status)}>{order.status}</span>
                  {order.status === 'Completed' && <span> | <strong>Price:</strong> ${order.price}</span>}
                  {order.status === 'Pending' && (
                    <div>
                      <button className='order-history-edit-button' onClick={() => handleEditOrder(order)}>Edit</button>
                      <button className='order-history-delete-button' onClick={() => handleDeleteOrder(order.id)}>Delete</button>
                    </div>
                  )}
                  <hr />
                </li>
              ))}
            </ul>
          </div>

          {editOrder && editOrder.status === 'Pending' && (
            <div className="edit-order-form">
              <h3>Edit Order</h3>
              <div className="form-group">
                <label htmlFor="updateFile">Update Document</label>
                <input type="file" id="updateFile" name="updateFile" onChange={(e) => setUpdateFile(e.target.files)} multiple />
              </div>
              <div className='edit-order-buttons'>
                <button onClick={handleSaveOrder} className="save-button">Save</button>
                <button onClick={() => setEditOrder(null)} className="cancel-button">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardPage;