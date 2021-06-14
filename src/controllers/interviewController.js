const bot = require('../bot')
const db = require('../db')
const { QUESTIONS } = require('../DATA')

class InterviewController {
    makeInlineKeyboard (question) {
        return question.answers.reduce((inline_keyboard, answers) => {
            const inline_row = answers.reduce((inline_row, answer) => {
                const callback_data = JSON.stringify({ command: 'interview', params: `${question.id} ${answer.id}` })
                inline_row.push({ text: answer.text, callback_data: callback_data })
                return inline_row
            }, [])
            inline_keyboard.push(inline_row)
            return inline_keyboard
        }, [])
    }

    sendStatics = async (msg) => {
        const chatId = msg.chat.id
        db.makeStats().then(stats => {
            bot.sendMessage(chatId, stats)
        })
    }

    sendInlineKeyboard = async (msg) => {
        const chatId = msg.chat.id
        const first_question = QUESTIONS.find(q => q.order === 0)
        const opt = {
            reply_markup: {
                inline_keyboard: this.makeInlineKeyboard(first_question)
            }
        }
        await bot.sendMessage(chatId, first_question.text, opt)
    }

    callbackProcessing = async (callback) => {
        const params = JSON.parse(callback.data).params.split(' ')
        const questionId = params[0]
        const answerId = params[1]

        const currentlyOrder = QUESTIONS.find(t => t.id === questionId).order
        const nextQuestion = QUESTIONS.find(t => t.order === currentlyOrder + 1)

        let text
        let inline_keyboard
        if (nextQuestion) {
            inline_keyboard = this.makeInlineKeyboard(nextQuestion)
            text = nextQuestion.text
        } else {
            inline_keyboard = [[{ text: 'Посмотреть статистику', callback_data: JSON.stringify({ command: 'stats' }) }]]
            text = 'спасибо за ответы!'
        }

        await bot.editMessageText(text, {
            chat_id: callback.from.id,
            message_id: callback.message.message_id,
            reply_markup: {
                inline_keyboard: inline_keyboard
            }
        })

        const info = {
            username: callback.from.username,
            first_name: callback.from.first_name,
            last_name: callback.from.last_name
        }
        await db.addNewAnswer(callback.from.id, ['', questionId, answerId], info) // I will fix it
        await bot.answerCallbackQuery(callback.id)
    }
}

module.exports = new InterviewController()