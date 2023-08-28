require('dotenv').config()
const jwt = require('jsonwebtoken')
const { isTokenValid } = require('../utils/jwt');
const {promisify} = require('util')

const authenticateUser = async (req, res, next) => {
  let token;
  // check header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }

  // console.log(authHeader);
  // console.log(token);

  if (!token) {
    return res.status(401).send('Unauthorized: No token provided.');
  }
  try {
    // const isTokenValid = ({ token }) => jwt.verify(token, process.env.JWT_SECRET);
    // const payload = isTokenValid(token);
    // const payload = (token) => jwt.verify(token, process.env.SECRET_KEY)
    // console.log(payload);

    const decoded = await promisify(jwt.verify)(token, process.env.SECRET_KEY)
    console.log(decoded.userId);

    // Attach the user and his permissions to the req object
    req.user = {
      id: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.log(error.message);
    return res.status(401).send('Authentication invalid');
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(401).send('Unauthorized to access this route');
    }
    next();
  };
};

module.exports = { authenticateUser, authorizeRoles };