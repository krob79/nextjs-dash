import AWS from 'aws-sdk';
import fs from 'fs';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
  region: 'us-east-1',
});

export async function uploadToS3(file) {
  console.log('Uploading file to S3:', file.originalname);
  const fileStream = fs.createReadStream(file.path);

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET,
    Key: file.originalname,
    Body: fileStream,
    ContentType: file.mimetype,
  };

  const data = await s3.upload(uploadParams).promise();
  return data.Location; // public URL
}

export async function deleteFromS3(fileName) {
  console.log('Deleting file from S3:', fileName);
  
  const deleteParams = {
    Bucket: process.env.AWS_BUCKET,
    Key: fileName,
  };

  try {
    await s3.deleteObject(deleteParams).promise();
    console.log('File deleted successfully:', fileName);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
}



