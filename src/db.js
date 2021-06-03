const sqlite3 = require("sqlite3").verbose()
const path = require("path")

let db = new sqlite3.Database(path.resolve(__dirname, "homka.db"), (err) => {
    if (err) {
        return console.error(err)
    }
    console.log("Connection...")
})

module.exports = db