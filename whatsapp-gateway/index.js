require('dotenv').config();
const express = require('express');
const { Client, RemoteAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { PostgresStore } = require('wwebjs-postgres');
const { Client: PgClient } = require('pg');

const app = express();
app.use(express.json());

async function startGateway() {
    // We use the same DATABASE_URL as the backend
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error("❌ ERROR: DATABASE_URL environment variable is missing!");
        process.exit(1);
    }
    
    // wwebjs-postgres will automatically manage the session table
    const store = new PostgresStore({ 
        connectionConfig: { connectionString: dbUrl }
    });
    
    console.log('Initializing WhatsApp Client...');
    const client = new Client({
        authStrategy: new RemoteAuth({
            store: store,
            dataPath: './',
            backupSyncIntervalMs: 300000 // Backup session every 5 minutes
        }),
        puppeteer: {
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/opt/google/chrome/chrome',
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-software-rasterizer',
                '--disable-extensions',
                '--disable-background-networking',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-breakpad',
                '--disable-client-side-phishing-detection',
                '--disable-default-apps',
                '--disable-features=Translate',
                '--disable-hang-monitor',
                '--disable-ipc-flooding-protection',
                '--disable-prompt-on-repost',
                '--disable-sync',
                '--metrics-recording-only',
                '--no-first-run',
                '--password-store=basic',
                '--use-mock-keychain',
                '--mute-audio',
                '--hide-scrollbars'
            ]
        }
    });

    let isReady = false;

    // Generate QR Code for scanning
    client.on('qr', (qr) => {
        console.log('\n--- SCAN THIS QR CODE WITH YOUR WHATSAPP ---');
        qrcode.generate(qr, { small: true });
        console.log('--------------------------------------------\n');
    });

    client.on('remote_session_saved', () => {
        console.log('✅ WhatsApp session safely stored in PostgreSQL!');
    });

    // Client is authenticated
    client.on('authenticated', () => {
        console.log('✅ WhatsApp authenticated successfully!');
    });

    // Client auth failure
    client.on('auth_failure', (msg) => {
        console.error('❌ WhatsApp authentication failed:', msg);
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
}

startGateway().catch(err => {
    console.error('Failed to start gateway:', err);
});
