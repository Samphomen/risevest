const pool = require('../db');
const { getAllUsers } = require('../controllers/userController');

describe('getAllUsers Function', () => {
  pool.query = jest.fn();

  it('returns a list of users', async () => {
    const mockUsers = [
      { id: 1, fullname: 'User 1' },
      { id: 2, fullname: 'User 2' },
    ];
    pool.query.mockResolvedValue({ rows: mockUsers });

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUsers);
  });

  it('handles internal server error', async () => {
    pool.query.mockRejectedValue(new Error('Database error'));

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Internal server error.');
  });
});
