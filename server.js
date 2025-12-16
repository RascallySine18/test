const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const BOT_TOKEN = process.env.TELEGRAM_TOKEN;
const YOUR_SITE_URL = 'https://rascallysine18.github.io/tictactoe/'; // ЗАМЕНИТЕ НА СВОЙ
const RENDER_URL = `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`;

// Авто-настройка вебхука при запуске
async function initWebhook() {
    try {
        await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${RENDER_URL}/webhook`);
        console.log('Webhook успешно установлен');
    } catch (e) { console.log('Ошибка вебхука:', e.message); }
}

// Прокси для отправки из игры
app.get('/send', async (req, res) => {
    const { chatId, text } = req.query;
    try {
        await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            params: { chat_id: chatId, text: text }
        });
        res.send({ status: 'ok' });
    } catch (e) { res.status(500).send({ status: 'error' }); }
});

// Обработка сообщений бота
app.post('/webhook', async (req, res) => {
    try {
        const { message } = req.body;
        if (message && message.text && message.text.includes('/start')) {
            const chatId = message.chat.id;
            const authUrl = `${YOUR_SITE_URL}?id=${chatId}`;

            await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: `Добро пожаловать! Нажмите кнопку ниже для автоматического входа в игру:`,
                reply_markup: {
                    inline_keyboard: [[
                        { text: "Войти в игру 🎮", url: authUrl }
                    ]]
                }
            });
        }
    } catch (e) { console.error('Ошибка в обработке сообщения:', e.message); }
    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log('Сервер запущен');
    await initWebhook();
});
