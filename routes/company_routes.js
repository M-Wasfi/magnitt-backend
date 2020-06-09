const express = require("express");

const { authorize } = require("../helpers/authorization");

const router = express.Router();

const {
  getCompanies,
  getCompany,
  updateCompany,
  addCompany,
  deleteCompany,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  addEmployee,
} = require("../controllers/company_controllers");

router.route("/").get(getCompanies).post(authorize, addCompany);

router
  .route("/:id")
  .get(getCompany)
  .put(authorize, updateCompany)
  .delete(authorize, deleteCompany);

router.route("/connections/send").post(authorize, sendConnectionRequest);
router.route("/connections/accept").post(authorize, acceptConnectionRequest);
router.route("/connections/reject").post(authorize, rejectConnectionRequest);

router.route("/employee").post(authorize, addEmployee);

module.exports = router;
