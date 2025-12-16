const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Токен берем из переменных окружения Render (TELEGRAM_TOKEN)
const BOT_TOKEN = process.env.TELEGRAM_TOKEN;
// Ссылка на ваш сайт, где лежит index.html (замените на свою)
const YOUR_SITE_URL = 'https://rascallysine18.github.io/tictactoe'; 

// 1. ПРОКСИ ДЛЯ ОТПРАВКИ СООБЩЕНИЙ (sendMessage)
// Используется игрой в конце раунда
app.get('/send', async (req, res) => {
    const { chatId, text } = req.query;
    
    if (!chatId || !text) {
        return res.status(400).send({ status: 'error', message: 'Missing params' });
    }

    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        await axios.get(url, {
            params: { chat_id: chatId, text: text }
        });
        res.send({ status: 'ok' });
    } catch (error) {
        console.error('Error proxying to TG:', error.message);
        res.status(500).send({ status: 'error' });
    }
});

// 2. WEBHOOK ДЛЯ АВТОРИЗАЦИИ
// Срабатывает, когда пользователь пишет боту /start
app.post('/webhook', async (req, res) => {
    try {
        const { message } = req.body;

        if (message && message.text && message.text.startsWith('/start')) {
            const chatId = message.chat.id;
            const firstName = message.from.first_name || 'Игрок';

            // Формируем ссылку на игру с ID пользователя в параметрах
            const authUrl = `${YOUR_SITE_URL}?id=${chatId}`;

            await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: `Привет, ${firstName}! 🎮\n\nНажми на кнопку ниже, чтобы войти в игру с бонусом.`,
                reply_markup: {
                    inline_keyboard: [[
                        { text: "Начать игру 🚀", url: authUrl }
                    ]]
                }
            });
        }
    } catch (error) {
        console.error('Webhook Error:', error.message);
    }
    res.sendStatus(200); // Обязательно отвечаем Telegram 200 OK
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
