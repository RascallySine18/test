const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors()); // Разрешаем запросы с вашего сайта
app.use(express.json());

const BOT_TOKEN = '8401172204:AAHODSNpYjLa-9K162iyhNyDU6nYtfNVH1E';

app.get('/send', async (req, res) => {
    const { chatId, text } = req.query;
    
    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        await axios.get(url, {
            params: { chat_id: chatId, text: text }
        });
        res.send({ status: 'ok' });
    } catch (error) {
        console.error('Error sending to TG:', error.message);
        res.status(500).send({ status: 'error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));