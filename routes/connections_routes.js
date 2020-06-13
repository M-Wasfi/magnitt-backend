const express = require("express");

const { authorize } = require("../helpers/authorization");

const connectionRequestValidation = require("../validation/connection/connection_request_validation");

const router = express.Router();

const {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getCompanyConnections,
} = require("../controllers/connection_controllers");

router.route("/my-connections").get(authorize, getCompanyConnections);

router
  .route("/send")
  .post(authorize, connectionRequestValidation, sendConnectionRequest);
router
  .route("/accept")
  .post(authorize, connectionRequestValidation, acceptConnectionRequest);
router
  .route("/reject")
  .post(authorize, connectionRequestValidation, rejectConnectionRequest);

module.exports = router;
