const path = require('path');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const S3 = require('aws-sdk/clients/s3');
require('dotenv').config()


const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
});

exports.uploadToS3 = (file, folder, next) =>{
    const fileStream = fs.createReadStream(file.tempFilePath);
    console.log(file.tempFilePath)
    const params = {
        Bucket:bucketName,
        Body:fileStream,
        Key:`${folder}/${file.name}` 
    };
    s3.upload(params,(error,data)=>{
        console.log(error,data);
        next(error,data);
    });
};

exports.infoFromS3 = async (key) => {
    const downloadParams = {
        Key:key,
        Bucket: bucketName
    };
    const headObjectResponse = await s3.headObject(downloadParams).promise();
    return headObjectResponse
}

//download file from s3 bucket
exports.getFileFromS3 = (key) =>{
    const downloadParams = {
        Key:key,
        Bucket: bucketName
    };
    const data =  s3.getObject(downloadParams).createReadStream();
    return data
};

//delete file from s3 bucker
exports.deleteFileFromS3 = (key,next) =>{
    const deleteParams = {
        Key:key,
        Bucket: bucketName
    };
    s3.deleteObject(deleteParams,(error,data)=>{
        next(error,data);
    });
};