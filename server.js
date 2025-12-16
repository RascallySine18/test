const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const BOT_TOKEN = process.env.TELEGRAM_TOKEN;
const YOUR_SITE_URL = 'https://rascallysine18.github.io/tictactoe'; // Укажите адрес вашей игры
const RENDER_URL = `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`; // Авто-определение вашего URL на Render

// ФУНКЦИЯ АВТО-НАСТРОЙКИ WEBHOOK
async function initWebhook() {
    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${RENDER_URL}/webhook`;
        const response = await axios.get(url);
        console.log('Webhook Status:', response.data.description);
    } catch (e) {
        console.error('Webhook Error:', e.message);
    }
}

// 1. ПРОКСИ ДЛЯ ОТПРАВКИ (из игры)
app.get('/send', async (req, res) => {
    const { chatId, text } = req.query;
    try {
        await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            params: { chat_id: chatId, text: text }
        });
        res.send({ status: 'ok' });
    } catch (error) {
        res.status(500).send({ status: 'error' });
    }
});

// 2. WEBHOOK (для входа через бота)
app.post('/webhook', async (req, res) => {
    try {
        const { message } = req.body;
        if (message && message.text && message.text.startsWith('/start')) {
            const chatId = message.chat.id;
            const authUrl = `${YOUR_SITE_URL}?id=${chatId}`;

            await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: `Привет! Нажми на кнопку для входа:`,
                reply_markup: {
                    inline_keyboard: [[{ text: "Начать игру 🚀", url: authUrl }]]
                }
            });
        }
    } catch (e) { console.error(e); }
    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    // Запускаем настройку вебхука автоматически при старте сервера
    await initWebhook();
});
