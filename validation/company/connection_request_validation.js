const validator = require("../../helpers/validation");
const jsonResponse = require("../../helpers/json_response");

const connectionRequestValidation = (req, res, next) => {
  const validationRule = {
    company: "required|string",
  };

  console.log(req.body);

  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      jsonResponse(res, 412, false, "Validation failed", err);
    } else {
      next();
    }
  });
};

module.exports = connectionRequestValidation;
