const Pool = require ('pg').Pool;

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "risevest",
    password: 'damola99@mich',
    port: 5432,
})

module.exports = pool