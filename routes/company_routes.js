const express = require("express");

const { authorize } = require("../helpers/authorization");

const addCompanyValidation = require("../validation/company/add_company_validation");
const addEmployeeValidation = require("../validation/company/add_employee_validation");

const router = express.Router();

const {
  getCompanies,
  getCompany,
  getMyCompany,
  updateCompany,
  addCompany,
  deleteCompany,
  addEmployee,
} = require("../controllers/company_controllers");

router
  .route("/")
  .get(getCompanies)
  .post(authorize, addCompanyValidation, addCompany);

router.route("/my-company").get(authorize, getMyCompany);

router
  .route("/:id")
  .get(getCompany)
  .put(authorize, addCompanyValidation, updateCompany)
  .delete(authorize, deleteCompany);

router.route("/employee").post(authorize, addEmployeeValidation, addEmployee);

module.exports = router;
