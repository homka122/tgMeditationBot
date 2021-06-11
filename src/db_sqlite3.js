const db = require('better-sqlite3')('./src/homka.db')
const DATA = require('./DATA')

// Create tables
const answers_sql = 'CREATE TABLE answers(num INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, id INTEGER, question TEXT, answer TEXT)'
const users_sql = 'CREATE TABLE users(id INTEGER PRIMARY KEY, username TEXT, first_name TEXT, last_name TEXT)'
const tables = db.prepare('SELECT name FROM sqlite_master WHERE type=\'table\'').all().map(table => table.name)

if (!tables.includes('answers')) {
    db.exec(answers_sql)
    console.log('Table "answers" was created')
}
if (!tables.includes('users')) {
    db.exec(users_sql)
    console.log('Table "users" was created')
}

class Db {
    addNewAnswer (userId, answer, info) {
        const row = db.prepare('SELECT * FROM answers WHERE id = ? AND question = ?').get(userId, answer[1])
        if (row) {
            const sql = `UPDATE answers SET answer = '${answer[2]}' WHERE num = ${row.num}`
            db.prepare(sql).run()
        } else {
            const sql = `INSERT INTO answers(id, question, answer) VALUES (${userId}, '${answer[1]}', '${answer[2]}')`
            db.prepare(sql).run()
        }

        const user_row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
        if (user_row) {
            const sql = `UPDATE users SET username = '${info.username}', first_name = '${info.first_name}', last_name = '${info.last_name}' WHERE id = ${userId}`
            db.prepare(sql).run()
        } else {
            const sql = `INSERT INTO users VALUES (${userId}, '${info.username}', '${info.first_name}', '${info.last_name}')`
            db.prepare(sql).run()
        }
    }

    makeStats () {
        return new Promise(resolve => {
            let message = ''
            const row = db.prepare('SELECT * FROM answers').all()
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

            resolve(message)
        })
    }
}

module.exports = new Db()