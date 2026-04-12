require('dotenv').config();
if (process.env.NODE_ENV === 'development') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
const fs = require('fs');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const uploadRoutes = require('./routes/uploadRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'reSell Mania API',
            version: '1.0.0',
            description: 'The Managed Asset Exchange API documentation',
        },
        servers: [
            {
                url: 'http://localhost:5001',
            },
        ],
    },
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/assets', require('./routes/assetRoutes'));
app.use('/api/ledger', require('./routes/ledgerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/messages', messageRoutes);

// Database configuration
mongoose.set('debug', true);
mongoose.set('bufferCommands', false);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 60000,
    connectTimeoutMS: 60000,
    socketTimeoutMS: 60000,
    family: 4,
    tlsAllowInvalidCertificates: true
})
    .then(() => {
        console.log('MongoDB connected successfully');
        console.log('Mongoose ReadyState:', mongoose.connection.readyState);
        // Start Server ONLY after DB is connected
        const PORT = process.env.PORT || 5001;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1); // Exit if DB connection fails
    });

// API Routes
app.get('/api/ping-db', (req, res) => {
    res.json({
        readyState: mongoose.connection.readyState,
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');

    // Check if build exists
    if (fs.existsSync(clientBuildPath)) {
        app.use(express.static(clientBuildPath));

        // Any route NOT handled by the API should serve the index.html
        app.get('*all', (req, res) => {
            res.sendFile(path.resolve(clientBuildPath, 'index.html'));
        });
    } else {
        console.warn('Production mode but client/dist not found. Did you run the build?');
    }
} else {
    app.get('/', (req, res) => {
        res.send('reSell Mania API is running. (Development Mode)');
    });
}

// Error logging middleware (after routes)
app.use((err, req, res, next) => {
    const errorLog = `\n[${new Date().toISOString()}] ${req.method} ${req.url}\n${err.stack}\n`;
    fs.appendFileSync('error_diagnostic.log', errorLog);
    console.error('SERVER ERROR LOGGED TO FILE');
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});
