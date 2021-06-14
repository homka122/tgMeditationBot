const bot = require('../bot')
const { AUDIOS } = require('../DATA')

class MusicController {
    sendInlineKeyboard = async (msg) => {
        const chatId = msg.chat.id
        const inline_keyboard = [
            [{ text: 'Сон', callback_data: JSON.stringify({ command: 'music', params: 'sleep' }) }],
            [{ text: 'Расслабление', callback_data: JSON.stringify({ command: 'music', params: 'relax' }) }],
            [{ text: 'Медитация', callback_data: JSON.stringify({ command: 'music', params: 'meditation' }) }]
        ]
        const opt = {
            reply_markup: {
                inline_keyboard: inline_keyboard
            }
        }
        await bot.sendMessage(chatId, 'Какое аудио желаете?', opt)
    }

    callbackProcessing = async (callback) => {
        const chatId = callback.message.chat.id
        const params = JSON.parse(callback.data).params
        switch (params) {
            case 'sleep': {}
                const mediaGroup = AUDIOS.map(audio => {
                    return { type: 'audio', media: audio }
                })
                await bot.sendMediaGroup(chatId, mediaGroup)
                break
            case 'relax':
            case 'meditation':
                await bot.sendMessage(chatId, 'Будьте добры, Соня, отправить музыку для медитации хомке')
                break
        }
        await bot.answerCallbackQuery(callback.id)
    }
}

module.exports = new MusicController()

