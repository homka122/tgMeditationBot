const express = require('express')
const bodyParser = require('body-parser')
const bot = require('./bot')

require('dotenv').config()

const startController = require('./controllers/startController')
const musicController = require('./controllers/musicController')
const videoController = require('./controllers/videoController')
const interviewController = require('./controllers/interviewController')
const articlesController = require('./controllers/articlesController')

bot.onText(/(привет|\/start)/i, startController)
bot.onText(/музыка/i, musicController.sendInlineKeyboard)
bot.onText(/видео/i, videoController)
bot.onText(/статьи/i, articlesController)
bot.onText(/опрос/i, interviewController.sendInlineKeyboard)
bot.onText(/статистика/i, interviewController.sendStatics)

bot.on('callback_query', async callback => {
    const callbackData = JSON.parse(callback.data)
    switch (callbackData.command) {
        case 'music':
            await musicController.callbackProcessing(callback)
            break
        case 'interview':
            await interviewController.callbackProcessing(callback)
            break
        case 'stats':
            await interviewController.sendStatics(callback.message)
            await bot.answerCallbackQuery(callback.id)
            break
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
