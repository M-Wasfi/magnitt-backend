const validator = require("../../helpers/validation");
const jsonResponse = require("../../helpers/json_response");

const updateUserValidation = (req, res, next) => {
  const validationRule = {
    userName: "required|string",
    email: "required|email",
  };

  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      jsonResponse(res, 412, false, "Validation failed", err);
    } else {
      next();
    }
  });
};

module.exports = updateUserValidation;
