const validator = require("../../helpers/validation");
const jsonResponse = require("../../helpers/json_response");

const loginValidation = (req, res, next) => {
  const validationRule = {
    email: "required|email",
    password: "required|string|min:8",
  };

  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      jsonResponse(res, 412, false, "Validation failed", err);
    } else {
      next();
    }
  });
};

module.exports = loginValidation;
