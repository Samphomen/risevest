// auth.test.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const { register, login, logout } = require('../controllers/authController'); // Replace with actual path

describe('Authentication Functions', () => {
  pool.query = jest.fn();

  bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');

  // Mock bcrypt.compare to return true for password match
  bcrypt.compare = jest.fn().mockResolvedValue(true);


  jwt.sign = jest.fn().mockReturnValue('mockedToken');

  it('registers a user successfully', async () => {

    pool.query.mockResolvedValue({ rows: [] });

    const req = {
      body: {
        fullname: 'John Doe',
        email: 'john@example.com',
        password: 'password',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'User registered successfully.' });
  });

  it('logs in a user successfully', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1, password: 'hashedPassword' }] });

    const req = {
      body: {
        email: 'john@example.com',
        password: 'password',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: 'mockedToken' });
  });

  it('logs out a user successfully', async () => {
    pool.query.mockResolvedValue({});

    const req = {
      headers: {
        authorization: 'Bearer mockedToken',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await logout(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('Logout successful.');
  });
});
