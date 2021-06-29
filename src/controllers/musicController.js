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
                const mediaGroupSleep = AUDIOS.sleep.map(audio => {
                    return { type: 'audio', media: audio }
                })
                await bot.sendMediaGroup(chatId, mediaGroupSleep)
                break
            case 'relax':
                // bot.sendAudio(chatId, path.resolve(__dirname, '../../media/audio/relax/Теплый летний вечер.mp3'), {
                //     performer: 'SonyaBot'
                // }).then(console.log)
                const mediaGroupRelax = AUDIOS.relax.map(audio => {
                    return { type: 'audio', media: audio }
                })
                await bot.sendMediaGroup(chatId, mediaGroupRelax)
                break
            case 'meditation':
                const mediaGroupMeditation = AUDIOS.meditation.map(audio => {
                    return { type: 'audio', media: audio }
                })
                await bot.sendMediaGroup(chatId, mediaGroupMeditation)
                break
        }
        await bot.answerCallbackQuery(callback.id)
    }
}

module.exports = new MusicController()

