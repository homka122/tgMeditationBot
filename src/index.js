const TelegramBot = require('node-telegram-bot-api')
const Db = require('./db')
const DATA = require('./DATA')

const bot = new TelegramBot(DATA.TOKEN, { polling: true })

function sendStatics (chatId) {
    const stats = Db.makeStats()
    bot.sendMessage(chatId, stats)
}

bot.onText(/(привет|\/start)/i, async msg => {
    console.log(`first_name: ${msg.from.first_name}`)
    console.log(`last_name: ${msg.from.last_name}`)
    console.log(`username: ${msg.from.username}`)
    console.log(`id: ${msg.from.id}`)
    await bot.sendMessage(msg.chat.id, 'Привет! Выбери нужную команду для продолжения', {
        reply_markup: {
            keyboard: [
                ['Музыка', 'Видео', 'Опрос', 'Статьи'],
            ],
            resize_keyboard: true,
        }
    })
})

bot.onText(/музыка/i, msg => {
    const chatId = msg.chat.id
    const opt = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Сон', callback_data: 'sleep' }],
                [{ text: 'Расслабление', callback_data: 'relax' }],
                [{ text: 'Медитация', callback_data: 'meditation' }]
            ]
        }
    }
    bot.sendMessage(chatId, 'Какое аудио желаете?', opt)
})

bot.onText(/видео/i, msg => {
    bot.sendVideo(msg.chat.id, DATA.VIDEO)
})

bot.onText(/опрос/i, async msg => {
    const chatId = msg.chat.id
    const opt = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Каждый день', callback_data: 'interview frequency every_day' },
                    { text: 'Раз в неделю', callback_data: 'interview frequency once_week' }
                ],
                [
                    { text: 'Раз в месяц', callback_data: 'interview frequency once_month' },
                    { text: 'Реже или никогда', callback_data: 'interview frequency never' }
                ]
            ]
        }
    }
    bot.sendMessage(chatId, 'Как часто вы занимаетесь медитацией?', opt)
})

bot.onText(/статистика/i, async msg => {
    sendStatics(msg.chat.id)
})

bot.onText(/статьи/i, msg => {
    const opt = { disable_web_page_preview: true, parse_mode: 'HTML' }

    let message = ''
    DATA.ARTICLES.forEach(article => {
        message += `• <a href="${article.url}">${article.title}</a>\n\n`
    })

    bot.sendMessage(msg.chat.id, message, opt)
})

bot.on('callback_query', function onCallbackQuery (callbackQuery) {
    const action = callbackQuery.data
    const chatId = callbackQuery.message.chat.id
    if (action === 'sleep') {
        const audios = DATA.AUDIOS.map(audio => {
            return { type: 'audio', media: audio }
        })
        bot.sendMediaGroup(chatId, audios)
        bot.answerCallbackQuery(callbackQuery.id)
    }

    if (action === 'relax') {
        const chatId = callbackQuery.message.chat.id
        bot.sendMessage(chatId, 'Будьте добры, Соня, отправить релаксирующую музыку хомке')
        bot.answerCallbackQuery(callbackQuery.id)
    }

    if (action === 'meditation') {
        const chatId = callbackQuery.message.chat.id
        bot.sendMessage(chatId, 'Будьте добры, Соня, отправить музыку для медитации хомке')
        bot.answerCallbackQuery(callbackQuery.id)
    }

    if (action === 'stats') {
        sendStatics(callbackQuery.from.id)
        bot.answerCallbackQuery(callbackQuery.id)
    }

    if (action.split(' ')[0] === 'interview') {
        const answer = action.split(' ')
        if (answer[1] === 'frequency') {
            Db.addNewAnswer(callbackQuery.from.id, answer)
            bot.editMessageText('соня крутая', {
                chat_id: callbackQuery.from.id,
                message_id: callbackQuery.message.message_id,
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'да', callback_data: 'interview sonya_cool yes' },
                            { text: 'нет', callback_data: 'interview sonya_cool no' }
                        ]
                    ]
                }
            })
        } else if (answer[1] === 'sonya_cool') {
            Db.addNewAnswer(callbackQuery.from.id, answer)
            bot.editMessageText('спасибо за ответы!', {
                chat_id: callbackQuery.from.id,
                message_id: callbackQuery.message.message_id,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Посмотреть статистику', callback_data: 'stats' }]
                    ]
                }
            })
        }
        bot.answerCallbackQuery(callbackQuery.id)
    }
})

bot.on('polling_error', console.log)