import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import Navbar from '../../Components/Navbar/Navbar';
import Footer from '../../Components/Footer/Footer';
import { logout } from '../../auth';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [adminDetails, setAdminDetails] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const adminId = localStorage.getItem('userId');

  useEffect(() => {
    if (!adminId) {
      navigate('/login');
      return;
    }

    const fetchAdminDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/admin/${adminId}`);
        setAdminDetails(response.data);
      } catch (error) {
        console.error('Error fetching admin details:', error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:3001/orders');
        setOrders(response.data);
        setFilteredOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error.message);
      }
    };

    fetchAdminDetails();
    fetchOrders();
  }, [adminId, navigate]);

  // Handle input changes for admin profile
  const handleChange = (e) => {
    setAdminDetails({ ...adminDetails, [e.target.name]: e.target.value });
  };

  // Handle update for admin profile
  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:3001/admin/${adminId}`, adminDetails);
      alert('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error.message);
    }
  };

  // Handle status change for orders
  const handleStatusChange = async (orderId, newStatus, newPrice) => {
    const order = orders.find(order => order.id === orderId);
    if (order.status === 'Completed' && newStatus === 'Cancelled') {
      alert('Cannot change status to Cancelled after it has been marked as Completed.');
      return;
    }

    if (newStatus === 'Completed' && (!newPrice || newPrice <= 0)) {
      alert('Please enter a valid price before marking the order as Completed.');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:3001/orders/${orderId}`, { status: newStatus, price: newPrice });

      if (response.status === 200) {
        // Refresh orders after successful update
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus, price: newPrice } : order
          )
        );
        alert('Order status and price updated successfully!');
      } else {
        alert('Failed to update order status and price.');
      }
    } catch (error) {
      console.error('Error updating order status and price:', error.message);
      alert('Error updating order status and price.');
    }
  };

  // Filter orders based on selected status
  useEffect(() => {
    if (filterStatus === 'All') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === filterStatus));
    }
  }, [filterStatus, orders]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "orange";
      case "Processing":
        return "blue";
      case "Completed":
        return "green";
      case "Cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <div>
      <Navbar />
      
      <div className="admin-dashboard-container">
        <button onClick={logout} className="logout-button">Logout</button> {/* Add the logout button */}
        <h1 className="admin-dashboard-title">Admin Dashboard</h1>
  
        {loading ? (
          <p className="admin-dashboard-text">Loading admin details...</p>
        ) : adminDetails.id ? (
          <div className="admin-dashboard-profile">
            <h2 className="admin-dashboard-subtitle">Admin Profile</h2>
            <table className="admin-dashboard-table">
              <tbody>
                <tr>
                  <td><strong>Name:</strong></td>
                  <td>
                    {editing ? (
                      <input type="text" name="name" value={adminDetails.name} onChange={handleChange} className="admin-dashboard-input" />
                    ) : (
                      <span className="admin-dashboard-text">{adminDetails.name}</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td><strong>Email:</strong></td>
                  <td>
                    {editing ? (
                      <input type="email" name="email" value={adminDetails.email} onChange={handleChange} className="admin-dashboard-input" />
                    ) : (
                      <span className="admin-dashboard-text">{adminDetails.email}</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td><strong>Password:</strong></td>
                  <td>
                    {editing ? (
                      <div className="password-input-container">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={adminDetails.password}
                          onChange={handleChange}
                          className="admin-dashboard-input"
                        />
                        <label className="admin-dashboard-show-password">
                          <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                          />
                        </label>
                      </div>
                    ) : (
                      <span className="admin-dashboard-text">{'*'.repeat(adminDetails.password.length)}</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
  
            {editing ? (
              <button className="admin-dashboard-button admin-dashboard-save-btn" onClick={handleUpdate}>Save Changes</button>
            ) : (
              <button className="admin-dashboard-button admin-dashboard-save-btn" onClick={() => setEditing(true)}>Edit Profile</button>
            )}
          </div>
        ) : (
          <p>No admin data found.</p>
        )}
          <div className="order-table-container">
            <h2>Order Details</h2>
            <div className="order-filter">
              <label>Filter by Status:</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <table className="order-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User ID</th>
                  <th>Type</th>
                  <th>Details</th>
                  <th>Mobile Number</th>
                  <th>Created At</th>
                  <th>Download</th>
                  <th>Price</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.user_id}</td>
                    <td>{order.type}</td>
                    <td>{order.details}</td>
                    <td>{order.mobileNumber}</td>
                    <td>{new Date(order.created_at).toLocaleString()}</td>
                    <td>
                      <a href={`http://localhost:3001/uploads/${order.details}`} download={order.details}>
                        <button className="download-button">Download</button>
                      </a>
                    </td>
                    <td>
                    <input
                      type="number"
                      value={order.price || ''}
                      onChange={(e) => setOrders((prevOrders) =>
                        prevOrders.map((o) =>
                          o.id === order.id ? { ...o, price: e.target.value } : o
                        )
                      )}
                      placeholder="Enter price"
                      className='price-input'
                    />
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value, order.price)}
                      style={{
                        backgroundColor: getStatusColor(order.status),
                        color: "white",
                        fontWeight: "bold",
                        padding: "5px",
                        borderRadius: "5px",
                        border: "none",
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
    <Footer />
  </div>
  );
};

export default AdminDashboard;