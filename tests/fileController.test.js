const pool = require('../db'); // Replace with actual path
const { uploadToS3, getFileFromS3, deleteFileFromS3 } = require('../utils/s3'); // Replace with actual path
const {
  uploadFile,
  getUserUploads,
  getMyUploads,
  updateUploadSafety,
} = require('../controllers/fileController');

describe('uploadFile Function', () => {
    it('uploads a file and adds a record in the database', async () => {
      const req = {
        files: {
          file: {
            tempFilePath: '/path/to/temp/file',
            name: 'example.jpg',
            size: 100000,
          },
        },
        body: {
          folderName: 'uploads',
        },
        user: {
          id: 1,
        },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
  
      const mockS3Upload = jest.fn((file, folder, next) => {
        next(null, { Key: 'uploads/example.jpg' });
      });
  
      uploadToS3.mockImplementation(mockS3Upload);
  

      const mockPoolQuery = jest.fn(() => {});
      pool.query = mockPoolQuery;
  
      await uploadFile(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        path: '/uploads/example.jpg',
      });
    });
  });

  describe('getUserUploads Function', () => {
    it('returns a list of uploads for a specific user', async () => {
      const req = {
        params: {
          id: 1,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      const mockPoolQuery = jest.fn(() => ({
        rows: [{ id: 1, uploads: { imagePath: 'uploads/example.jpg', safe: true } }],
      }));
      pool.query = mockPoolQuery;
  
      await getUserUploads(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ id: 1, uploads: { imagePath: 'uploads/example.jpg', safe: true } }]);
    });
  });
  
  describe('getMyUploads Function', () => {
    it('returns a list of uploads for the authenticated user', async () => {
      const req = {
        user: {
          id: 1,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      const mockPoolQuery = jest.fn(() => ({
        rows: [{ id: 1, uploads: { imagePath: 'uploads/example.jpg', safe: true } }],
      }));
      pool.query = mockPoolQuery;
  
      await getMyUploads(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ id: 1, uploads: { imagePath: 'uploads/example.jpg', safe: true } }]);
    });
  });
  
  describe('updateUploadSafety Function', () => {
    it('updates upload safety and deletes file if needed', async () => {
      const req = {
        params: {
          folder: 'uploads',
          key: 'example.jpg',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
  
      const mockPoolQuery = jest.fn();
      pool.query = mockPoolQuery;
  
      const mockDeleteFromS3 = jest.fn((key, next) => {
        next(null, {});
      });
      deleteFileFromS3.mockImplementation(mockDeleteFromS3);
  
      await updateUploadSafety(req, res);
  
      expect(mockPoolQuery).toHaveBeenCalledTimes(2);
      expect(mockDeleteFromS3).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith('Safety updated and file deleted.');
    });
  });