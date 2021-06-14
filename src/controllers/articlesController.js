const bot = require('../bot')
const { ARTICLES } = require('../DATA')

const sendArticles = async (msg) => {
    const chatId = msg.chat.id
    const opt = { disable_web_page_preview: true, parse_mode: 'HTML' }
    const text = ARTICLES.reduce((message, article) => {
        return message += `• <a href="${article.url}">${article.title}</a>\n\n`
    }, '')
    await bot.sendMessage(chatId, text, opt)
}

module.exports = sendArticles