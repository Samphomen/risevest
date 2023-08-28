const {uploadToS3, getFileFromS3, deleteFileFromS3, infoFromS3} = require('../utils/s3')
const pool = require('../db')

const uploadFile = async (req, res) => {  
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }
        const file = req.files.file;
        const folder = req.body.folderName.toLowerCase();
        if (file.size > 200 * 1024 * 1024) {
            return res.status(400).send('File size exceeds the maximum limit.');
        }
        uploadToS3(file, folder, async (error,data)=> {
            const s3ImagePath = `/uploads/${data.Key}`;
            const userId = req.user.id
            const uploadsData = [userId, { imagePath: s3ImagePath, safe: true }];
            await pool.query(`INSERT INTO files (user_id, uploads) VALUES ($1, $2)`, uploadsData);
            return res.send({ path: s3ImagePath });
        })
    } catch (error) {
        console.log('Error uploading file:', error);
        return res.status(500).send('Internal server error.');
    }
};

const getUserUploads = async (req, res, next) => {
    try {
        const {id} = req.params
        const userId = id
        const results = await pool.query(`SELECT id, uploads FROM files WHERE user_id = $1`, [userId])
        return res.status(200).json(results.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal server error.");
    }
}

const getMyUploads = async (req, res, next) => {
    try {
        const userId = req.user.id
        const results = await pool.query(`SELECT id, uploads FROM files WHERE user_id = $1`, [userId])
        return res.status(200).json(results.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal server error.");
    }
}

const getFile =  (req, res, next) => {
    try {
        const {folder, key} = req.params
        const readStream =  getFileFromS3(`${folder}/${key}`)
        readStream.pipe(res)
    } catch (error) {
        console.log(error);
    }
}

const isAudioOrVideo = (contentType) => {
    return contentType.startsWith('audio/') || contentType.startsWith('video/');
};

const streamFile = async(req, res, next) => {
    try {
        const {folder, key} = req.params
        const contentType = headObjectResponse.ContentType;
        if (!isAudioOrVideo(contentType)) {
            return res.status(400).send('Not an audio or video file.');
        }
        const readStream =  getFileFromS3(`${folder}/${key}`)
        readStream.pipe(res);   
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal server error.');
    }
}


const updateUploadSafety = async(req,res, next) => {
    try {
        const {folder, key} = req.params
        const imagePath = `/uploads/${folder}/${key}`
        const safeValue = false
        await pool.query(`UPDATE files SET uploads = jsonb_set(uploads, '{safe}', $1::jsonb), review_count = review_count + 1 WHERE uploads->>'imagePath' = $2`, [safeValue, imagePath])
        const minimumAdminReviewCount = 2
        if(safeValue === false){
            const count = await pool.query(`SELECT review_count FROM files WHERE uploads->>'imagePath' = $1`, [imagePath]);
            if(count.rows.length > 0){
                const totalCount = count.rows[0].review_count;
                if(totalCount >= minimumAdminReviewCount){
                    deleteFileFromS3(`${folder}/${key}`,(error,data)=>{
                        if(error){
                            return res.send({error:"Can not delete file, Please try again later"});
                        }
                        return res.send({message:"File has been deleted successfully"});
                    });
                    await pool.query(`DELETE FROM files WHERE uploads->>'imagePath' = $1`, [imagePath])
                    return res.status(200).send("Unsafe upload deleted successfully.");
                }
            }
        }
        return res.status(200).send("Safety updated and file deleted.");
    } catch (error) {
        console.log(error.message);
        return res.status(500).send("Internal server error.");
    }
}


module.exports = {
    uploadFile,
    getFile,
    getUserUploads,
    getMyUploads,
    updateUploadSafety,
    streamFile
  };