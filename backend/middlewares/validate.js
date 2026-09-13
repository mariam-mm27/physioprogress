const { param, validationResult } = require("express-validator");
const AppError = require("../utils/AppError");
const validateObjectIdParam = (paramName) => [
  param(paramName)
    .exists({ checkFalsy: true })
    .withMessage(`${paramName} is required`)
    .bail()
    .isMongoId()
    .withMessage(`${paramName} must be a valid MongoDB ObjectId`)
];

const runValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array().map((e) => e.msg).join(", ");
    return next(new AppError(400, message));
  }

  next();
};

module.exports = { validateObjectIdParam, runValidation };
