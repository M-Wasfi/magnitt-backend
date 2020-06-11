const validator = require("../../helpers/validation");
const jsonResponse = require("../../helpers/json_response");

const addCompanyValidation = (req, res, next) => {
  const validationRule = {
    companyName: "required|string",
    type: "required|string",
    industry: "required|string",
    size: "required|numeric",
  };

  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      jsonResponse(res, 412, false, "Validation failed", err);
    } else {
      next();
    }
  });
};

module.exports = addCompanyValidation;
