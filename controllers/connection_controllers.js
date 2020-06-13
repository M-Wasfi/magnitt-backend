const asyncHandler = require("../helpers/async_handler");
const jsonResponse = require("../helpers/json_response");

const Company = require("../models/company");
const Connection = require("../models/connection");

///////////////////////////////////////////////////////////////////////////////
// @route     POST /api/connections/send
// @desc      Send connections request to company
// @access    Private
exports.sendConnectionRequest = asyncHandler(async (req, res, next) => {
  //Check user ownership over the company
  const company = await Company.findOne({ owner: req.user.id });

  if (company === null) {
    return next(
      jsonResponse(
        res,
        403,
        false,
        `You are not allowed to send connection requests`,
        {}
      )
    );
  }

  // check if there is a connection record between companies
  await Connection.findOne(
    {
      $or: [
        { sender: company._id, receiver: req.body.company },
        { sender: req.body.company, receiver: company._id },
      ],
    },

    // check if there is no connection record between companies; return
    async function (err, connection) {
      if (err) {
        return next(
          jsonResponse(res, 400, false, `Could not send connection request`, {
            err,
          })
        );
      }

      // check if there is a connection request record between companies; return
      if (connection) {
        return next(
          jsonResponse(res, 400, false, `Request has already been sent`, {})
        );
      }

      const newConnection = await Connection.create({
        sender: company._id,
        receiver: req.body.company,
        status: "PENDING",
      });

      await newConnection
        .populate("sender", "companyName")
        .populate("receiver", "companyName")
        .execPopulate();

      jsonResponse(
        res,
        200,
        true,
        "Connection request sent successfully",
        newConnection
      );
    }
  );
});

///////////////////////////////////////////////////////////////////////////////
// @route     POST /api/companies/connections/accept
// @desc      Accept connection request from company
// @access    Private
exports.acceptConnectionRequest = asyncHandler(async (req, res, next) => {
  //Check ownership over the company
  const company = await Company.findOne({ owner: req.user.id });

  if (company === null) {
    return next(
      jsonResponse(
        res,
        403,
        false,
        `You are not allowed to accept connection requests`,
        {}
      )
    );
  }

  const connection = await Connection.findOne({
    sender: req.body.company,
    status: "PENDING",
  })
    .populate("sender", "companyName")
    .populate("receiver", "companyName");

  if (!connection) {
    return next(
      jsonResponse(res, 404, false, `Connection request does not exist`, {})
    );
  }

  connection.status = "CONNECTED";
  await connection.save();

  jsonResponse(
    res,
    200,
    true,
    "Connection request accepted successfully",
    connection
  );
});

///////////////////////////////////////////////////////////////////////////////
// @route     POST /api/companies/connections/reject
// @desc      Reject connection request from company
// @access    Private
exports.rejectConnectionRequest = asyncHandler(async (req, res, next) => {
  //Check ownership
  const company = await Company.findOne({ owner: req.user.id });

  if (company === null) {
    return next(
      jsonResponse(
        res,
        403,
        false,
        `You are not allowed to reject connection requests`,
        {}
      )
    );
  }

  const connection = await Connection.findOne({
    sender: req.body.company,
    status: "PENDING",
  });

  if (!connection) {
    return next(
      jsonResponse(res, 404, false, `Connection request does not exist`, {})
    );
  }

  await Connection.deleteOne({ _id: connection._id });

  jsonResponse(
    res,
    200,
    true,
    "Connection request rejected successfully",
    connection
  );
});

/////////////////////////////////////////////////////////////
// @route     GET /api/connections/my-connections
// @desc      Get my company's connections
// @access    Private
exports.getCompanyConnections = asyncHandler(async (req, res, next) => {
  try {
    // check ownership
    const company = await Company.findOne({ owner: req.user.id });

    const connections = await Connection.find({
      $or: [{ sender: company._id }, { receiver: company._id }],
    })
      .populate("sender", "companyName")
      .populate("receiver", "companyName");

    connections
      ? jsonResponse(
          res,
          200,
          true,
          `Got company's connections successfully`,
          connections
        )
      : jsonResponse(
          res,
          404,
          false,
          `Could not find company's connections`,
          connections
        );
  } catch (error) {
    jsonResponse(res, 400, false, `Failed to get company's connections`, {
      error,
    });
  }
});
