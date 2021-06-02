const TelegramBot = require('node-telegram-bot-api')
const bot = new TelegramBot('1768932400:AAFy9HwOKabH6VIH1tUSUqcekvx2pplMM2k', {polling: true})

const video = "BAACAgIAAxkDAAIBf2C3SRVtELdY_Pu6-YHuoPO67hkHAAIDDgACSR_ASaJdmj5dymLfHwQ"

bot.onText(/(привет|\/start)/i, async msg => {
    console.log(`first_name: ${msg.from.first_name}`)
    console.log(`last_name: ${msg.from.last_name}`)
    console.log(`username: ${msg.from.username}`)
    console.log(`id: ${msg.from.id}`)
    await bot.sendMessage(msg.chat.id, "Привет! Выбери нужную команду для продолжения", {
        reply_markup: {
            keyboard: [
                ["Музыка", "Видео", "Опрос", "Статьи"],
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
                [
                    {text: "Сон", callback_data: "sleep"}],
                    [{text: "Расслабление", callback_data: "relax"}],
                    [{text: "Медитация", callback_data: "meditation"}
                ]
            ]
        }
    }
    bot.sendMessage(chatId, 'Какое аудио желаете?', opt)
})

bot.onText(/видео/i, msg => {
    bot.sendVideo(msg.chat.id, video)
})

bot.onText(/опрос/i, async msg => {
    bot.sendMessage(msg.chat.id, "Опрос пока не доступен")
})

bot.onText(/статьи/i, msg => {
    const opt = {disable_web_page_preview: true, parse_mode: "HTML"}
    const articles = [
        {url: "https://wfc.tv/ru/stati/mindfulness/meditatsiya-dlya-nachinayushchikh-kak-pravilno-meditirovat", title: "Медитация для начинающих: как правильно медитировать"},
        {url: "https://vc.ru/life/144218-chto-ya-ponyal-za-polgoda-meditacii-prilozheniya-knigi-tehniki-i-nemnogo-nauki", title: "Что я понял за полгода медитации: приложения, книги, техники и немного науки"},
        {url: "https://naked-science.ru/article/nakedscience/s-tochki-zreniya-nauki", title: "С точки зрения науки: медитация"},
        {url: "https://advgroup.ru/journal/meditation", title: "8 личных историй для тех, кто хочет начать медитировать"},
        {url: "https://www.goodhouse.ru/health/zdorovye/5-luchshih-yutub-kanalov-dlya-meditacii/", title: "5 лучших ютуб-каналов для медитации"},
        {url: "https://www.nike.com/ru/a/meditate-for-better-sleep", title: "Медитация для более здорового сна"},
        {url: "https://matrasy-futon.ru/statji/meditacija-pered-snom-kak-pravilno-delat", title: "Медитация перед сном: как правильно делать"},
        {url: "https://lifehacker.ru/3-prostykh-tekhniki-meditacii-dlya-rasslableniya-i-samopoznaniya/", title: "3 простых техники медитации для расслабления и самопознания"},
        {url: "https://zen.yandex.ru/media/id/5bc07eb0e9bf0f00ac360241/kak-ispolzovat-meditaciiu-dlia-samopoznaniia-5bdc5f715d390d00a976209b", title: "Как использовать медитацию для самопознания"},
        {url: "https://oceanius.ru/meditaciya-proshheniya-iscelyayushhaya-texnika/", title: "Медитация прощения. Исцеляющая техника"},
    ]

    let message = ""
    articles.forEach(article => {
        message += `• <a href="${article.url}">${article.title}</a>\n\n`
    })

    bot.sendMessage(msg.chat.id, message, opt)
})

bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    const action = callbackQuery.data
    const chatId = callbackQuery.message.chat.id
    if (action === "sleep") {
        let audios = [
            'CQACAgIAAxkDAAIBLmC3RQkLmBD1OdY92W0HbTXLiqonAAL0DQACSR_ASaB4OMzSAv_-HwQ',
            'CQACAgIAAxkDAAIBLWC3RQm_MrVmKa7G4MjEGyo1uuXGAAL1DQACSR_ASUDmsf5qGoqsHwQ',
            'CQACAgIAAxkDAAIBLGC3RQneBzqnqTa6NkURQRPg1HF9AAL3DQACSR_ASdzd4ktj0ChaHwQ',
            'CQACAgIAAxkDAAIBK2C3RQl7Wx2UmE5gDIRQgpVsUq2cAAL4DQACSR_ASeNAUkn9eWmXHwQ',
            'CQACAgIAAxkDAAIBKmC3RQnVaweOZ-Z5aBBRV0mdKHE-AAL2DQACSR_ASVReeAr5ocHyHwQ'
        ]
        audios = audios.map(audio => {
            return {type: "audio", media: audio}
        })
        bot.sendMediaGroup(chatId, audios)
        bot.answerCallbackQuery(callbackQuery.id)
    }

    if (action === "relax") {
        const chatId = callbackQuery.message.chat.id
        bot.sendMessage(chatId, "Будьте добры, Соня, отправить релаксирующую музыку хомке")
        bot.answerCallbackQuery(callbackQuery.id)
    }

    if (action === "meditation") {
        const chatId = callbackQuery.message.chat.id
        bot.sendMessage(chatId, "Будьте добры, Соня, отправить музыку для медитации хомке")
        bot.answerCallbackQuery(callbackQuery.id)
    }
});

bot.on("polling_error", console.log);