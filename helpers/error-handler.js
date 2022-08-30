'use strict';

const fileSizeLimitErrorHandler = (error, req, res, next) => {
  if (error) {
    return res.status(413).json({
      success: false,
      error: 'Image file is too big.',
    });
  } else {
    next();
  }
};

exports.fileSizeLimitErrorHandler = fileSizeLimitErrorHandler;
