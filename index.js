const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// database connection
require('./utils/dbConnect');


var corsOptions = {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["POST", "GET", "DELETE", "PUT"],
    credentials: true
};

app.use(express.json());
app.use(cors(corsOptions));


// routes
// auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Final year project (Agri sathi hub) website backend running...');
});

app.listen(PORT, () => {
    console.log(`Agri sathi hub - Server running on port ${PORT}`);
});