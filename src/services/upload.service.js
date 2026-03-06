import crypto from 'crypto';

const CLOUDINARY_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;

const getCloudinaryUploadSignature = async (req,res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const folder    = `bills/${req.user.id}`;

  // These params MUST match exactly what client sends to Cloudinary
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;

  const signature = crypto
    .createHash('sha256')
    .update(paramsToSign + CLOUDINARY_SECRET)
    .digest('hex');

  return{
    signature,
    timestamp,
    folder,
    apiKey:    CLOUDINARY_API_KEY,
    cloudName: CLOUDINARY_CLOUD_NAME,
  }
  
};

export default { getCloudinaryUploadSignature };
