if (process.env.NODE_ENV === 'production') {
    module.exports = require('./db_postgres')
} else {
    module.exports = require('./db_sqlite3')
}