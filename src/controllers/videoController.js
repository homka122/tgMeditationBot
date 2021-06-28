const bot = require('../bot')
const { VIDEOS } = require('../DATA')
const db = require('../db')

const sendVideo = async (msg) => {
    const chatId = msg.chat.id
    await db.addToDatabase(chatId)
    console.log((await db.getCounter(chatId)).counter)
    const video = VIDEOS[(await db.getCounter(chatId)).counter % 4]
    await bot.sendVideo(chatId, video)
    await db.incrementCounter(chatId)
}

module.exports = sendVideo
