import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import dotenv from "dotenv";
dotenv.config();

const BUCKET_REGION = process.env.S3_BUCKET_REGION;
const ACCESS_KEY = process.env.S3_ACCESS_KEY;
const SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;

const S3 = new S3Client({
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
  },

  region: BUCKET_REGION,
});

export default { S3, PutObjectCommand, GetObjectCommand };
