const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Resume / Cover Letter storage
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:    'ats/documents',
    resource_type: 'raw',
    allowed_formats: ['pdf', 'doc', 'docx'],
  },
});

// Avatar / image storage
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:    'ats/avatars',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill' }],
  },
});

const uploadDocuments = multer({ storage: documentStorage });
const uploadImage     = multer({ storage: imageStorage });

module.exports = { uploadDocuments, uploadImage };
