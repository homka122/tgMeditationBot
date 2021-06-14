const bot = require('../bot')
const { VIDEO } = require('../DATA')

const sendVideo = async (msg) => {
    const chatId = msg.chat.id
    await bot.sendVideo(chatId, VIDEO)
}

module.exports = sendVideo