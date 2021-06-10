const TelegramBot = require('node-telegram-bot-api')
const Db = require('./db')
const DATA = require('./DATA')
const express = require('express')
const bodyParser = require('body-parser')

require('dotenv').config()

const token = process.env.TELEGRAM_TOKEN
let bot

if (process.env.NODE_ENV === 'production') {
    bot = new TelegramBot(token)
    bot.setWebHook(process.env.HEROKU_URL + bot.token)
} else {
    bot = new TelegramBot(token, { polling: true })
}

function sendStatics (chatId) {
    const stats = Db.makeStats()
    bot.sendMessage(chatId, stats)
}

function makeInlineKeyboard (question) {
    const inline_keyboard = []
    question.answers.forEach((answers) => {
        const inline_row = []
        answers.forEach(answer => {
            inline_row.push({ text: answer.text, callback_data: `interview ${question.id} ${answer.id}` })
        })
        inline_keyboard.push(inline_row)
    })
    return inline_keyboard
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
    const first_question = DATA.QUESTIONS.find(q => q.order === 0)
    const opt = {
        reply_markup: {
            inline_keyboard: makeInlineKeyboard(first_question)
        }
    }
    bot.sendMessage(chatId, first_question.text, opt)
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
        const currentlyOrder = DATA.QUESTIONS.find(t => t.id === answer[1]).order
        const nextQuestion = DATA.QUESTIONS.find(t => t.order === currentlyOrder + 1)
        let text
        let inline_keyboard
        if (nextQuestion) {
            inline_keyboard = makeInlineKeyboard(nextQuestion)
            text = nextQuestion.text
        } else {
            inline_keyboard = [[{ text: 'Посмотреть статистику', callback_data: 'stats' }]]
            text = 'спасибо за ответы!'
        }
        bot.editMessageText(text, {
            chat_id: callbackQuery.from.id,
            message_id: callbackQuery.message.message_id,
            reply_markup: {
                inline_keyboard: inline_keyboard
            }
        })
        const info = {
            username: callbackQuery.from.username,
            first_name: callbackQuery.from.first_name,
            last_name: callbackQuery.from.last_name
        }
        Db.addNewAnswer(callbackQuery.from.id, answer, info)
        bot.answerCallbackQuery(callbackQuery.id)
    }
})

bot.on('polling_error', console.log)

const app = express()

app.use(bodyParser.json())

app.listen(process.env.PORT || 5000)

app.post('/' + bot.token, (req, res) => {
    bot.processUpdate(req.body)
    res.sendStatus(200)
})