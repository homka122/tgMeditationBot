const bot = require('../bot')

const text = 'Привет! Выбери нужную команду для продолжения'
const keyboard = [['Музыка', 'Видео', 'Опрос', 'Статьи']]
const opt = {
    reply_markup: {
        keyboard: keyboard,
        resize_keyboard: true,
    }
}

const start = async (msg) => {
    const chatId = msg.chat.id
    await bot.sendMessage(chatId, text, opt)
}

module.exports = start