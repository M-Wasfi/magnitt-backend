const validator = require("../../helpers/validation");
const jsonResponse = require("../../helpers/json_response");

const searchUserValidation = (req, res, next) => {
  const validationRule = {
    email: "required|string",
  };

  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      jsonResponse(res, 412, false, "Validation failed", err);
    } else {
      next();
    }
  });
};

module.exports = searchUserValidation;
