const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// API endpoint to get products
app.get('/api/products', (req, res) => {
    try {
        const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8'));
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load products' });
    }
});

// API endpoint to save orders (for future)
app.post('/api/orders', (req, res) => {
    const order = req.body;
    console.log('New order received:', order);
    res.json({ success: true, message: 'Order received! Thank you!' });
});

// Serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Garypen Store running at http://localhost:${PORT}`);
    console.log(`   Press Ctrl+C to stop`);
});