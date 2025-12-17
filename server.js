const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// --- НОВЫЙ БЛОК ДЛЯ CRON-JOB ---
// Этот обработчик отвечает статусом 200 на запрос по главной ссылке.
// Теперь Cron-job будет видеть статус "Успешно" и не будет отключаться.
app.get('/', (req, res) => {
    res.status(200).send('Server is alive and kicking!');
});
// ------------------------------

// Токен берем из переменных окружения Render
const BOT_TOKEN = process.env.TELEGRAM_TOKEN;
// Укажите адрес вашего сайта на GitHub Pages (ОБЯЗАТЕЛЬНО)
const YOUR_SITE_URL = 'https://rascallysine18.github.io/tictactoe/'; 
const RENDER_URL = `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`;

// Авто-настройка вебхука при старте сервера
async function initWebhook() {
    try {
        await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${RENDER_URL}/webhook`);
        console.log('Webhook успешно установлен на:', RENDER_URL);
    } catch (e) { 
        console.log('Ошибка установки вебхука:', e.message); 
    }
}

// МАРШРУТ-ТРАМПЛИН (Для обхода блокировки t.me на ПК)
app.get('/go-bot', (req, res) => {
    // Вместо http-ссылки на t.me, мы посылаем команду открытия протокола приложения
    // Это заставит Windows/MacOS спросить: "Открыть Telegram Desktop?"
    res.redirect('tg://resolve?domain=bettertictactoe_bot&start=auth');
});

// ПРОКСИ ДЛЯ ОТПРАВКИ УВЕДОМЛЕНИЙ ИЗ ИГРЫ
app.get('/send', async (req, res) => {
    const { chatId, text } = req.query;
    try {
        await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            params: { chat_id: chatId, text: text }
        });
        res.send({ status: 'ok' });
    } catch (e) { 
        res.status(500).send({ status: 'error' }); 
    }
});

// ОБРАБОТКА КОМАНД БОТА (Webhook)
app.post('/webhook', async (req, res) => {
    try {
        const { message } = req.body;
        // Если пользователь нажал СТАРТ
        if (message && message.text && message.text.includes('/start')) {
            const chatId = message.chat.id;
            const authUrl = `${YOUR_SITE_URL}?id=${chatId}`;

            await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: `✨ Вы успешно авторизованы!\n\nНажмите кнопку ниже, чтобы вернуться в игру с вашим ID.`,
                reply_markup: {
                    inline_keyboard: [[
                        { text: "Войти в игру 🎮", url: authUrl }
                    ]]
                }
            });
        }
    } catch (e) { 
        console.error('Webhook Error:', e.message); 
    }
    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    await initWebhook();
});
