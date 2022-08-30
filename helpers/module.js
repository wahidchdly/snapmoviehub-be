'use strict';

const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');

// IMAGE MYME TYPE
const IMAGE_TYPE_MAP = {
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
  'image/png': 'png',
};

const folderPath = folder => {
  let filePath = `public/${folder}`;
  return filePath;
};

// MULTER STORAGE
const setStorage = FILE_TYPE_MAP => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const isValid = FILE_TYPE_MAP[file.mimetype];
      let uploadError = new Error('Invalid image type');

      if (isValid) {
        uploadError = null;
      }

      const fileBasePath = folderPath(file.fieldname);

      if (!fs.existsSync(fileBasePath)) {
        fs.mkdirSync(fileBasePath, { recursive: true });
      }

      cb(uploadError, fileBasePath);
    },

    filename: function (req, file, cb) {
      const extension = FILE_TYPE_MAP[file.mimetype];
      const imageName = crypto.randomBytes(8).toString('hex');

      cb(null, `${Date.now()}-${imageName}.${extension}`);
    },
  });

  return storage;
};

// MULTER OPTIONS
const multerOptions = (storage, size) => {
  const uploadOptions = multer({
    storage: storage,
    limits: { fileSize: size },
  });
  return uploadOptions;
};

exports.folderPath = folderPath;
exports.IMAGE_TYPE_MAP = IMAGE_TYPE_MAP;
exports.setStorage = setStorage;
exports.multerOptions = multerOptions;
