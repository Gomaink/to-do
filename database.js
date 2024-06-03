const mysql = require('mysql')

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cozy'
})

db.connect( (error)  => {
    if(error) {
        console.log(error)
    } else {
        console.log("MySQL database connected...")
    }
})

module.exports = db