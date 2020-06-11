const validator = require("../../helpers/validation");
const jsonResponse = require("../../helpers/json_response");

const addUserValidation = (req, res, next) => {
  const validationRule = {
    userName: "required|string|alpha",
    password: "required|string|min:8", //TODO add confirmed
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

module.exports = addUserValidation;
