import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/db.js';
import dns from 'dns'
import {inngest, functions} from './inngest/index.js'
import {serve} from 'inngest/express'

dns.setServers([
    '1.1.1.1',
    '8.8.8.8'
])

const app = express();

await connectDB();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send('Server is Running!!!'))
app.use('/api/inngest', serve({ client: inngest, functions }))

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server is runnning on port ${PORT}`))