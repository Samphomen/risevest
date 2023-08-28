const pool = require('../db')

const getAllUsers = async (req, res, next) => {
    try {
        const results = await pool.query(`SELECT id, fullname FROM users`)
        return res.status(200).json(results.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal server error.");
    }
}

module.exports = {
    getAllUsers
};