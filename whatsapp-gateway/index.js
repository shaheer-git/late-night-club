require('dotenv').config();
const express = require('express');
const { default: makeWASocket, DisconnectReason, initAuthCreds, BufferJSON, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error('❌ ERROR: DATABASE_URL environment variable is missing!');
    process.exit(1);
}

// PostgreSQL Connection Pool
const pool = new Pool({ connectionString: dbUrl });

// Custom Postgres Auth State for Baileys
async function usePostgresAuthState(pool, tableName = 'baileys_auth') {
    console.log('Initializing Postgres auth state...');
    await pool.query(`
        CREATE TABLE IF NOT EXISTS ${tableName} (
            key VARCHAR(255) PRIMARY KEY,
            value JSONB
        )
    `);

    const writeData = async (data, key) => {
        const value = JSON.stringify(data, BufferJSON.replacer);
        await pool.query(`
            INSERT INTO ${tableName} (key, value) 
            VALUES ($1, $2::jsonb) 
            ON CONFLICT (key) DO UPDATE SET value = $2::jsonb
        `, [key, value]);
    };

    const readData = async (key) => {
        const res = await pool.query(`SELECT value FROM ${tableName} WHERE key = $1`, [key]);
        if (res.rowCount > 0) {
            return JSON.parse(JSON.stringify(res.rows[0].value), BufferJSON.reviver);
        }
        return null;
    };

    const removeData = async (key) => {
        await pool.query(`DELETE FROM ${tableName} WHERE key = $1`, [key]);
    };

    let creds = await readData('creds');
    if (!creds) {
        creds = initAuthCreds();
        await writeData(creds, 'creds');
    }

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(
                        ids.map(async (id) => {
                            let value = await readData(`${type}-${id}`);
                            data[id] = value;
                        })
                    );
                    return data;
                },
                set: async (data) => {
                    const tasks = [];
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const key = `${category}-${id}`;
                            if (value) {
                                tasks.push(writeData(value, key));
                            } else {
                                tasks.push(removeData(key));
                            }
                        }
                    }
                    await Promise.all(tasks);
                }
            }
        },
        saveCreds: () => {
            return writeData(creds, 'creds');
        },
        clearAuth: async () => {
            console.log('Clearing invalid auth state from database...');
            await pool.query(`DELETE FROM ${tableName}`);
        }
    };
}

const qrcode = require('qrcode-terminal');

let sock;

async function startSock() {
    const { state, saveCreds, clearAuth } = await usePostgresAuthState(pool);
    const { fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Using WhatsApp v${version.join('.')}, isLatest: ${isLatest}`);
    
    sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }), // Hide internal logs now that we know the issue
        printQRInTerminal: false, 
        browser: ['Ubuntu', 'Chrome', '113.0.5672.126']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n======================================================');
            console.log('📱 SCAN THIS QR CODE WITH WHATSAPP TO AUTHENTICATE 📱');
            console.log('======================================================\n');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const isLoggedOut = lastDisconnect.error?.output?.statusCode === DisconnectReason.loggedOut;
            console.error('Connection closed due to error:', lastDisconnect.error);
            
            if (isLoggedOut) {
                console.log('Session is invalid or logged out! Clearing database and generating a new QR code...');
                await clearAuth();
                startSock();
            } else {
                console.log('Reconnecting automatically...');
                startSock();
            }
        } else if (connection === 'open') {
            console.log('✅ WhatsApp Gateway is READY and connected!');
        }
    });
}

// API Endpoints
app.post('/send', async (req, res) => {
    try {
        const { number, message } = req.body;
        
        if (!number || !message) {
            return res.status(400).json({ error: 'Missing number or message' });
        }

        // Format number for Baileys: '1234567890' -> '1234567890@s.whatsapp.net'
        const formattedNumber = `${number}@s.whatsapp.net`;
        
        await sock.sendMessage(formattedNumber, { text: message });
        
        res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message', details: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', engine: 'baileys' });
});

// Ping endpoint to keep server alive
app.get('/isAlive', (req, res) => {
    res.status(200).json({ status: 'alive' });
});

app.head('/isAlive', (req, res) => {
    res.status(200).end();
});

startSock();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Gateway Server running on port ${PORT}`);
});
