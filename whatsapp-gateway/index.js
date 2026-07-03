const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());

// Initialize WhatsApp Client with LocalAuth to persist the session
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let isReady = false;

// Generate QR Code for scanning
client.on('qr', (qr) => {
    console.log('\n--- SCAN THIS QR CODE WITH YOUR WHATSAPP ---');
    qrcode.generate(qr, { small: true });
    console.log('--------------------------------------------\n');
});

// Client is ready
client.on('ready', () => {
    isReady = true;
    console.log('✅ WhatsApp Gateway is READY and connected!');
});

// Disconnected
client.on('disconnected', (reason) => {
    isReady = false;
    console.log('❌ WhatsApp Gateway disconnected:', reason);
});

client.initialize();

// API Endpoint to send a message
app.post('/send-message', async (req, res) => {
    if (!isReady) {
        return res.status(503).json({ error: 'WhatsApp client is not ready yet.' });
    }

    const { phone, message } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ error: 'Phone and message are required' });
    }

    try {
        // Format the phone number correctly for whatsapp-web.js (e.g., 919876543210@c.us)
        // Remove any non-numeric characters (like + or spaces)
        const cleanPhone = phone.replace(/\D/g, '');
        const chatId = `${cleanPhone}@c.us`;

        console.log(`Sending message to ${cleanPhone}...`);
        await client.sendMessage(chatId, message);
        console.log(`Message sent successfully to ${cleanPhone}`);

        res.json({ success: true, message: 'OTP Sent successfully' });
    } catch (error) {
        console.error('Failed to send message:', error);
        res.status(500).json({ error: 'Failed to send message', details: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 WhatsApp Gateway API running on http://localhost:${PORT}`);
});
