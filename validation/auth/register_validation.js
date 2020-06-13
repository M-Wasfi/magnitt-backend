const validator = require("../../helpers/validation");
const jsonResponse = require("../../helpers/json_response");

const registerValidation = (req, res, next) => {
  const validationRule = {
    userName: "required|string",
    password: "required|string|min:8|confirmed",
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

module.exports = registerValidation;
