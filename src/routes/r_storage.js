import S3Client from "../../services/S3Client";

const BUCKET_NAME = process.env.BUCKET_NAME;

let uploadFile = async (req, res) => {
  console.log("test");
  const params = {
    Bucket: BUCKET_NAME,
    Key: req.file.originalname,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };
  const command = new S3Client.PutObjectCommand(params);
  await S3Client.S3.send(command);
  console.log("req.body", req.body);
  console.log("req.file", req.file);
  //Actual image - req.file.buffer

  res.send({});
};
export default {
  uploadFile,
};
