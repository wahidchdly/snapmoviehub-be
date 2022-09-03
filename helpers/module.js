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
  let filePath = `public/${folder}s`;
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

function sendResponse(
  res,
  status,
  error,
  response,
  type,
  data,
  result,
  totalData,
  perPage,
  currentPage
) {
  if (response === true) {
    let message;
    let resp;

    if (type === 1)
      message = `${
        data === 'image' ? 'Uploaded' : 'Created'
      } this ${data} successfully.`;

    if (type === 2) {
      let word;

      if (data === 'cast') word = result.rowCount > 1 ? 'Casts' : 'A cast';

      if (data === 'character')
        word = result.rowCount > 1 ? 'Characters' : 'A character';

      if (data === 'category')
        word = result.rowCount > 1 ? 'Categories' : 'A category';

      if (data === 'image') word = result.rowCount > 1 ? 'Images' : 'An image';

      if (data === 'movie') word = result.rowCount > 1 ? 'Movies' : 'A movie';

      message = `${word} ${result.rowCount > 1 ? 'were' : 'was'} found.`;
    }

    if (totalData !== undefined) {
      resp = {
        totalData: totalData.rowCount,
        resultData: result.rowCount,
        perPage: perPage,
        currentPage: currentPage,
      };
    }

    const trueResponse = {
      success: true,
      message: message,
      statistics: result.rowCount > 1 ? resp : 1,
      data: result.rows,
    };
    return res.status(status).json(trueResponse);
  }

  if (response === false) {
    let message;

    if (type === 1) message = 'Something error on server.';

    if (type === 2)
      message = `There is an error. This ${data} was not ${
        data === 'image' ? 'uploaded' : 'created'
      }.`;

    if (type === 3) message = `Cannot input the same ${data} twice.`;

    if (type === 4)
      message = `You are only allowed to input ${data} of a movie.`;

    if (type === 5) message = `There is no ${data} found.`;

    const badResponse = {
      success: false,
      error: message,
    };

    if (error) console.log(error);
    return res.status(status).json(badResponse);
  }
}

exports.folderPath = folderPath;
exports.IMAGE_TYPE_MAP = IMAGE_TYPE_MAP;
exports.setStorage = setStorage;
exports.multerOptions = multerOptions;
exports.sendResponse = sendResponse;
