const validator = require("../../helpers/validation");
const jsonResponse = require("../../helpers/json_response");

const addEmployeeValidation = (req, res, next) => {
  const validationRule = {
    employee: "required|string",
  };

  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      jsonResponse(res, 412, false, "Validation failed", err);
    } else {
      next();
    }
  });
};

module.exports = addEmployeeValidation;
