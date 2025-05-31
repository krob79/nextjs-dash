import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand} from '@aws-sdk/client-s3';

console.log("----running testpost route.ts");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

export async function uploadToS3(file, fileName) {

    const fileBuffer = file;
    console.log("----uploading: ",fileName, file);

    const uploadParams = {
        Bucket: process.env.AWS_BUCKET,
        Key: `${fileName}`,
        Body: fileBuffer,
        ContentType: "image/jpg",
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);
}


export async function POST(req) {

    try{
        const formData = await req.formData();
        const file = formData.get('image_url');
        if (!file || !(file instanceof Blob)) {
            return NextResponse.json({ error: 'No file uploaded or invalid file type' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = await uploadToS3(buffer, file.name);

        return NextResponse.json({success: true, file: file.name});


    }catch(error){
        return NextResponse.json({error: error.message});
    }
    console.log("-----testpost route.ts POST called");
  
}