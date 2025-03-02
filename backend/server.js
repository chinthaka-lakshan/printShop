const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'book-shop'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage }).array('files', 10);

// Register
app.post('/register', (req, res) => {
  const { name, mobileNumber, email, password, role } = req.body;

  const query = 'INSERT INTO users (name, mobileNumber, email, password, role) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [name, mobileNumber, email, password, role], (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      res.status(500).send(`Error registering user: ${err.message}`);
      return;
    }
    res.status(201).send('User registered successfully');
  });
});

// Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Error logging in:', err);
      res.status(500).send(`Error logging in: ${err.message}`);
      return;
    }
    if (results.length > 0) {
      const user = results[0];
      res.status(200).json({ message: 'Login successful', role: user.role, userId: user.id });
    } else {
      res.status(401).send('Invalid email or password');
    }
  });
});

// Fetch user details
app.get('/user/:userId', (req, res) => {
  const userId = req.params.userId;

  const query = 'SELECT id, name, mobileNumber, email, password, role FROM users WHERE id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user data:', err);
      res.status(500).send(`Error fetching user data: ${err.message}`);
      return;
    }
    if (results.length > 0) {
      res.status(200).json(results[0]);
    } else {
      res.status(404).send('User not found');
    }
  });
});

// Update user details
app.put('/user/:userId', (req, res) => {
  const userId = req.params.userId;
  const { name, mobileNumber, email, password } = req.body;

  const query = 'UPDATE users SET name = ?, mobileNumber = ?, email = ?, password = ? WHERE id = ?';
  db.query(query, [name, mobileNumber, email, password, userId], (err) => {
    if (err) {
      console.error('Error updating user data:', err);
      res.status(500).send(`Error updating user data: ${err.message}`);
      return;
    }

    res.status(200).send('User data updated successfully');
  });
});

// Upload print job
app.post('/upload/print/:userId', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Error uploading files:', err);
      return res.status(500).send(`Error uploading files: ${err.message}`);
    }

    const userId = req.params.userId;
    const fileNames = req.files.map(file => file.filename);

    const query = 'SELECT mobileNumber FROM users WHERE id = ?';
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Error fetching user mobile number:', err);
        return res.status(500).send(`Error fetching user mobile number: ${err.message}`);
      }

      const mobileNumber = results[0].mobileNumber;

      fileNames.forEach((fileName) => {
        const orderQuery = 'INSERT INTO orders (user_id, type, details, status, mobileNumber, created_at) VALUES (?, ?, ?, ?, ?, NOW())';
        db.query(orderQuery, [userId, 'Printout', fileName, 'pending', mobileNumber], (err) => {
          if (err) {
            console.error('Error creating order:', err);
          }
        });
      });

      res.status(200).send('Print job uploaded and orders created successfully');
    });
  });
});

// Upload photocopy job
app.post('/upload/photocopy/:userId', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Error uploading files:', err);
      return res.status(500).send(`Error uploading files: ${err.message}`);
    }

    const userId = req.params.userId;
    const fileNames = req.files.map(file => file.filename);

    const query = 'SELECT mobileNumber FROM users WHERE id = ?';
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Error fetching user mobile number:', err);
        return res.status(500).send(`Error fetching user mobile number: ${err.message}`);
      }

      const mobileNumber = results[0].mobileNumber;

      fileNames.forEach((fileName) => {
        const orderQuery = 'INSERT INTO orders (user_id, type, details, status, mobileNumber, created_at) VALUES (?, ?, ?, ?, ?, NOW())';
        db.query(orderQuery, [userId, 'Photocopy', fileName, 'pending', mobileNumber], (err) => {
          if (err) {
            console.error('Error creating order:', err);
          }
        });
      });

      res.status(200).send('Photocopy job uploaded and orders created successfully');
    });
  });
});

// Get admin count
app.get('/adminCount', (req, res) => {
  const query = 'SELECT COUNT(*) AS count FROM users WHERE role = "admin"';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching admin count:', err);
      res.status(500).json({ error: 'Error checking admin count' });
      return;
    }
    res.status(200).json({ count: results[0].count });
  });
});

// Fetch admin details
app.get('/admin/:adminId', (req, res) => {
  const adminId = req.params.adminId;
  const query = 'SELECT id, name, email, password FROM users WHERE id = ? AND role = "admin"';

  db.query(query, [adminId], (err, results) => {
    if (err) {
      console.error('Error fetching admin data:', err.message);
      res.status(500).json({ error: 'Error fetching admin data' });
      return;
    }
    if (results.length > 0) {
      res.status(200).json(results[0]);
    } else {
      res.status(404).json({ error: 'Admin not found' });
    }
  });
});

// Update admin details
app.put('/admin/:adminId', (req, res) => {
  const adminId = req.params.adminId;
  const { name, email, password } = req.body;

  const query = 'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ? AND role = "admin"';

  db.query(query, [name, email, password, adminId], (err) => {
    if (err) {
      console.error('Error updating admin profile:', err.message);
      res.status(500).json({ error: 'Error updating admin profile' });
      return;
    }
    res.status(200).json({ message: 'Admin profile updated successfully' });
  });
});

// Create a new order
app.post('/orders', (req, res) => {
  const { user_id, type, details, status } = req.body;

  const query = 'INSERT INTO orders (user_id, email, type, details, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())';
  db.query(query, [user_id, type, details, status], (err) => {
    if (err) {
      console.error('Error creating order:', err.message);
      res.status(500).json({ error: 'Error creating order' });
      return;
    }
    res.status(201).json({ message: 'Order created successfully' });
  });
});

// Fetch orders for a specific user
app.get('/orders/:userId', (req, res) => {
  const userId = req.params.userId;

  const query = 'SELECT * FROM orders WHERE user_id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user orders:', err.message);
      res.status(500).json({ error: 'Error fetching user orders' });
      return;
    }
    res.status(200).json(results);
  });
});

// Delete an order
app.delete('/orders/:orderId', (req, res) => {
  const orderId = req.params.orderId;

  const query = 'DELETE FROM orders WHERE id = ?';
  db.query(query, [orderId], (err) => {
    if (err) {
      console.error('Error deleting order:', err.message);
      res.status(500).json({ error: 'Error deleting order' });
      return;
    }
    res.status(200).json({ message: 'Order deleted successfully' });
  });
});

// Update order document
app.put('/orders/:orderId/document', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Error uploading files:', err);
      return res.status(500).send(`Error uploading files: ${err.message}`);
    }

    const orderId = req.params.orderId;
    const fileNames = req.files.map(file => file.filename);

    // Check if the order status is "Pending"
    const checkStatusQuery = 'SELECT user_id, status, mobileNumber FROM orders WHERE id = ?';
    db.query(checkStatusQuery, [orderId], (err, results) => {
      if (err) {
        console.error('Error checking order status:', err.message);
        res.status(500).json({ error: 'Error checking order status' });
        return;
      }

      if (results.length === 0) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      const { user_id, status, mobileNumber } = results[0];
      if (status !== 'Pending') {
        res.status(400).json({ error: 'Order cannot be updated unless it is pending' });
        return;
      }

      // Delete the existing order
      const deleteQuery = 'DELETE FROM orders WHERE id = ?';
      db.query(deleteQuery, [orderId], (err) => {
        if (err) {
          console.error('Error deleting order:', err.message);
          res.status(500).json({ error: 'Error deleting order' });
          return;
        }

        // Create new orders for each uploaded file
        fileNames.forEach((fileName) => {
          const orderQuery = 'INSERT INTO orders (user_id, type, details, status, mobileNumber, created_at) VALUES (?, ?, ?, ?, ?, NOW())';
          db.query(orderQuery, [user_id, 'Printout', fileName, 'pending', mobileNumber], (err) => {
            if (err) {
              console.error('Error creating order:', err);
            }
          });
        });

        res.status(200).json({ message: 'Order document updated successfully' });
      });
    });
  });
});

// Fetch all orders
app.get('/orders', (req, res) => {
  const query = 'SELECT * FROM orders ORDER BY created_at DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching all orders:', err.message);
      res.status(500).json({ error: 'Error fetching all orders' });
      return;
    }
    res.status(200).json(results);
  });
});

// Order status update
app.put('/orders/:orderId', (req, res) => {
  const orderId = req.params.orderId;
  const { status, price } = req.body;

  const query = 'UPDATE orders SET status = ?, price = ? WHERE id = ?';
  db.query(query, [status, price, orderId], (err) => {
    if (err) {
      console.error('Error updating order:', err);
      res.status(500).send(`Error updating order: ${err.message}`);
      return;
    }
    res.status(200).send('Order updated successfully');
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});