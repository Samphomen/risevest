const express = require('express');
const router = express.Router();

const {authorizeRoles, authenticateUser} = require('../middlewares/auth')
const { uploadFile, getFile, getUserUploads, updateUploadSafety, getMyUploads, streamFile } = require('../controllers/fileController');

router.route('/').post(authenticateUser, uploadFile).get(authenticateUser, getMyUploads);
router.route('/:id').get(getUserUploads)
router.route('/:folder/:key').get(getFile).put(authenticateUser, authorizeRoles('admin'), updateUploadSafety);
router.route('/stream/:folder/:key').get(streamFile)

module.exports = router;