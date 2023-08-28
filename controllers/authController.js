const pool = require('../db')
require('dotenv').config()
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')


const register = async (req, res) => {
    try {
        const { fullname, email, password } =  req.body;
        console.log(req.body);
        const hashedPassword = await bcrypt.hash(password, 10);
       
        const emailExist = await pool.query(`SELECT * FROM users WHERE email= $1`, [email]);
        if (emailExist.rows.length > 0) {
            await pool.end();
            return res.status(400).send('Email is already taken.');
        }
        await pool.query(`INSERT INTO users (fullname, email, password) VALUES ($1,$2,$3)`, [fullname, email, hashedPassword])
        return res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.log('Error registering user:', error);
        return res.status(500).send('Internal server error.');
    }
}


const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const data = await pool.query(`SELECT * FROM users WHERE email= $1;`, [email])
        const user = data.rows;
        console.log(user[0]);
        if (user.length === 0) {
            res.status(400).json({error: "Invalid Email or password"});
        }
        const doesPasswordMatch = await bcrypt.compare(password, user[0].password);
        if (!doesPasswordMatch) {
            return res.status(401).send('Invalid email or password.');
        }
        const token = jwt.sign({ userId: user[0].id, role: user[0].role}, process.env.SECRET_KEY, { expiresIn: process.env.TOKEN_EXPIRATION });
        await pool.query(`INSERT INTO sessions (user_id, token) VALUES ($1, $2)`, [user[0].id, token])
        return res.status(200).json({ token });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({error: "Database error occurred while signing in!"});
    };
};


const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(400).send('Token missing.');
        }
        await pool.query(`UPDATE sessions SET revoked = TRUE WHERE token = $1`, [token])
        return res.status(200).send('Logout successful.');
    } catch (error) {
        console.error('Error during logout:', error.message);
        return res.status(500).send('Internal server error.');
    }
}

module.exports = {
    register,
    login,
    logout
}