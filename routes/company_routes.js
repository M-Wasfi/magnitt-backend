const express = require("express");

const { authorize } = require("../helpers/authorization");

const addCompanyValidation = require("../validation/company/add_company_validation");
const addEmployeeValidation = require("../validation/company/add_employee_validation");
const connectionRequestValidation = require("../validation/company/connection_request_validation");

const router = express.Router();

const {
  getCompanies,
  getCompany,
  getMyCompany,
  updateCompany,
  addCompany,
  deleteCompany,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
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

router
  .route("/connections/send")
  .post(authorize, connectionRequestValidation, sendConnectionRequest);
router
  .route("/connections/accept")
  .post(authorize, connectionRequestValidation, acceptConnectionRequest);
router
  .route("/connections/reject")
  .post(authorize, connectionRequestValidation, rejectConnectionRequest);

router.route("/employee").post(authorize, addEmployeeValidation, addEmployee);

module.exports = router;
