const Pool = require('pg').Pool
const DATA = require('./DATA')
require('dotenv').config()

const db = new Pool({
    host: process.env.HEROKU_PG_HOST,
    database: process.env.HEROKU_PG_DATABASE,
    user: process.env.HEROKU_PG_USER,
    port: 5432,
    password: process.env.HEROKU_PG_PASSWORD,
    uri: process.env.HEROKU_PG_PASSWORD,
    ssl: {
        rejectUnauthorized: false
    }
})

class Db {
    constructor () {
        this.check_tables()
    }

    async check_tables () {
        const answers_sql = 'CREATE TABLE answers(num SERIAL, id INTEGER, question TEXT, answer TEXT)'
        const users_sql = 'CREATE TABLE users(id INTEGER PRIMARY KEY, username TEXT, first_name TEXT, last_name TEXT)'
        const video_counter_sql = 'CREATE TABLE video_counter(id INTEGER PRIMARY KEY, counter INTEGER DEFAULT 0)'
        const table_sql = 'SELECT * FROM information_schema.tables WHERE table_name = \'answers\' OR table_name = \'users\''
        const tables = await (await db.query(table_sql)).rows.map(t => t.table_name)

        if (!tables.includes('answers')) {
            await db.query(answers_sql)
            console.log('Table "answers" was created')
        }
        if (!tables.includes('users')) {
            await db.query(users_sql)
            console.log('Table "users" was created')
        }
        if (!tables.includes('video_counter')) {
            await db.query(video_counter_sql)
            console.log('Table "video_counter" was created')
        }
    }

    async makeStats () {
        let message = ''
        const row = (await db.query('SELECT * FROM answers')).rows
        const count_users = new Set(row.map(user => user.id)).size

        message += `Кол-во пользователей, который прошли опрос: ${count_users}\n\n`

        DATA.QUESTIONS.forEach(question => {
            message += question.text + ':\n'
            question.answers.forEach(v => {
                v.forEach(answer => {
                    const count_answers = row.filter(t => t.question === question.id && t.answer === answer.id).length
                    message += '   ' + answer.text + ': ' + count_answers + '\n'
                })
            })
            message += '\n'
        })

        return message
    }

    async addNewAnswer (userId, answer, info) {
        const row = (await db.query(`SELECT * FROM answers WHERE id = ${userId} AND question = '${answer[1]}'`)).rows[0]
        if (row) {
            const sql = `UPDATE answers SET answer = '${answer[2]}' WHERE num = ${row.num}`
            await db.query(sql)
            console.log('Ответ изменен')
        } else {
            const sql = `INSERT INTO answers(id, question, answer) VALUES (${userId}, '${answer[1]}', '${answer[2]}')`
            await db.query(sql)
            console.log('Ответ добавлен')
        }

        const user_row = (await db.query(`SELECT * FROM users WHERE id = ${userId}`)).rows[0]
        if (user_row) {
            const sql = `UPDATE users SET username = '${info.username}', first_name = '${info.first_name}', last_name = '${info.last_name}' WHERE id = ${userId}`
            await db.query(sql)
            console.log('Информация о пользвателе изменена')
        } else {
            const sql = `INSERT INTO users VALUES (${userId}, '${info.username}', '${info.first_name}', '${info.last_name}')`
            await db.query(sql)
            console.log('Информация о пользователе добавлена')
        }
    }

    async incrementCounter(id) {
        const sql = `UPDATE video_counter SET counter = counter + 1 WHERE id = ${id}`
        await db.query(sql)
    }

    async getCounter(id) {
        const sql = `SELECT counter FROM video_counter WHERE id = ${id}`
        return (await db.query(sql)).rows[0]
    }

    async addToDatabase(id) {
        const sql = `INSERT INTO video_counter(id) VALUES (${id})`
        try {
            await db.query(sql)
        } catch {
            return 0
        }
    }
}

module.exports = new Db()
