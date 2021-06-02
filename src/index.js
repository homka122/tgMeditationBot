const TelegramBot = require('node-telegram-bot-api')
const path = require('path')
const bot = new TelegramBot('1768932400:AAFy9HwOKabH6VIH1tUSUqcekvx2pplMM2k', {polling: true})

function pr(text) {
    return path.resolve(__dirname, text)
}

const video = path.resolve(__dirname, "homka.mp4")
const audio = [pr("ske.mp3"), pr("potsu - I'm Closing my Eyes.mp3"), pr("Idealism - nagashi.mp3")]


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
    const randomAudio = audio[Math.floor(Math.random() * audio.length)]
    console.log(randomAudio)
    bot.sendAudio(msg.chat.id, randomAudio, {caption: "Тут выбор из трех случайных песен, можешь сама проверить хд"})
})

bot.onText(/видео/i, msg => {
    bot.sendVideo(msg.chat.id, video)
})

bot.onText(/опрос/i, async msg => {
    bot.sendMessage(msg.chat.id, "Опрос пока не доступен")
})

bot.onText(/статьи/i, msg => {
   bot.sendMessage(msg.chat.id,
       "https://bit.ly/3pbnqUv - Что я понял за полгода медитации\n" +
       "https://bit.ly/3vLXukE - Я медитирую по два часа в день и вот зачем", {disable_web_page_preview: true})
})

bot.onText(/s/, function onEditableText(msg) {
    const opts = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '1',
                        // we shall check for this value when we listen
                        // for "callback_query"
                        callback_data: 'biba 1 1'
                    },
                    {
                        text: '2',
                        // we shall check for this value when we listen
                        // for "callback_query"
                        callback_data: 'biba 1 2'
                    },
                    {
                        text: '3',
                        // we shall check for this value when we listen
                        // for "callback_query"
                        callback_data: 'biba 1 3'
                    }
                ]
            ]
        }
    };
    bot.sendMessage(msg.from.id, 'Original Text', opts);
});

bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    const action = callbackQuery.data.split();
    const msg = callbackQuery.message;
    let text = "";
    if (action[0] === 'biba') {
        text += action[1] + " " + action[2] + "\n"
    }
    if (action[0] === 'bibaend') {
        bot.sendMessage()
    }
});