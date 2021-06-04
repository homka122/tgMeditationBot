const db = require('better-sqlite3')('./src/homka.db')

class Db {
    addNewAnswer (userId, answer) {
        const row = db.prepare('SELECT * FROM users_interview WHERE id = ?').get(userId)
        if (row) {
            const sql = `UPDATE users_interview SET ${answer[1]} = '${answer[2]}' WHERE id = ${userId}`
            db.prepare(sql).run()
        } else {
            const sql = `INSERT INTO users_interview(id, ${answer[1]}) VALUES (${userId}, '${answer[2]}')`
            db.prepare(sql).run()
        }
    }

    makeStats () {
        let message = ''
        const row = db.prepare('SELECT * FROM users_interview').all()

        message += `Кол-во пользователей, который прошли опрос: ${row.length}\n\n`
        message += `Как часто вы занимаетесь медитацией?:\n`
        message += `   Каждый день: ${row.filter(user => user.frequency === 'every_day').length}\n`
        message += `   Раз в неделю: ${row.filter(user => user.frequency === 'once_week').length}\n`
        message += `   Раз в месяц: ${row.filter(user => user.frequency === 'once_month').length}\n`
        message += `   Реже или Никогда: ${row.filter(user => user.frequency === 'never').length}\n\n`
        message += `соня крутая?:\n`
        message += `   да: ${row.filter(user => user.sonya_cool === 'yes').length}\n`
        message += `   нет: ${row.filter(user => user.sonya_cool === 'no').length}\n`

        return message
    }
}

module.exports = new Db()