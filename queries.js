const getUsers = "SELECT * FROM users"
const checkEmailExists = "SELECT s FROM users s WHERE s.email = $1"
const registerUser = "INSERT INTO students (full_name, email, password) VALUES ($1, $2, $3)";

module.exports = {
    getUsers,
    checkEmailExists,
    registerUser
}