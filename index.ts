import axios from 'axios';
import { config } from 'dotenv';
import express from 'express';
import HttpError from './classes/HttpError';
import authMiddleware from './middlewares/authMiddleware';
import errorMiddleware from './middlewares/errorMiddleware';

config();

const app = express();

app.use(express.json());
app.use(authMiddleware);

const queue = new Map<string, any[]>();

function handleQueue() {
    for (const [url, embeds] of queue.entries()) {
        if (embeds.length == 0) continue;

        const embedsToSend = [];

        while (true) {
            const embedToSend = embeds.shift();

            if (!embedToSend || embedsToSend.length >= 6) {
                break;
            }

            embedsToSend.push(embedToSend);
            const embedTotalLength = JSON.stringify(embedsToSend).length;

            if (embedTotalLength > 5999) {
                embedsToSend.pop();
                embeds.unshift(embedToSend);
                break;
            };
        };

        if (embedsToSend.length === 0) continue;

        axios.post(url, {
            embeds: embedsToSend
        }).catch((err) => {
            console.log(err.response.data);
            console.log('Failed to send webhook?');
        });
    }
};

app.post('/send', async (req, res, next) => {
    try {
        const {data, url} = req.body;
        if (!url || !data) return next(new HttpError('Invalid request url/data not found', 400));

        if (!queue.has(url)) {
            queue.set(url, []);
            // Create new array for webhook url if it doesnt exist
        }

        queue.get(url)!.push(data);

        return res.json({
            success: true
        })
    } catch (error:any) {
        return res.json({
            success: false,
            code: 400,
            message: 'Failed to send webhook',
            data: error.response.data
        })
    }
});


setInterval(handleQueue, 5 * 1000);

app.use(errorMiddleware);
app.listen(3000, () => {
    console.log('Server started on port 3000');
});