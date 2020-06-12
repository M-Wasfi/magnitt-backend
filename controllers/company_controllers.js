const mongoose = require("mongoose");

const asyncHandler = require("../helpers/async_handler");
const jsonResponse = require("../helpers/json_response");

const Company = require("../models/company");
const User = require("../models/user");
const Connection = require("../models/connection");

//TODO review access
// @route   GET api/companies
// @desc    Get all company
// @access  Private
exports.getCompanies = asyncHandler(async (req, res, next) => {
  try {
    const companies = await Company.find();

    jsonResponse(res, 200, true, "Got all companies successfully", companies);
  } catch (error) {
    jsonResponse(res, 400, false, "Failed to get all companies", error);
  }
});

// @route     GET /api/companies/:id
// @desc      Get single company
// @access    Private
exports.getCompany = asyncHandler(async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate("employees")
      .populate("companyConnections");

    company
      ? jsonResponse(
          res,
          200,
          true,
          `Got company by id: ${req.params.id} successfully`,
          company
        )
      : jsonResponse(
          res,
          404,
          false,
          `Could not find company by id: ${req.params.id}`,
          company
        );
  } catch (error) {
    jsonResponse(
      res,
      400,
      false,
      `Failed to get company by id: ${req.params.id}`,
      error
    );
  }
});

// @route     GET /api/companies/my-company
// @desc      Get single company
// @access    Private
exports.getMyCompany = asyncHandler(async (req, res, next) => {
  try {
    const ownCompany = await Company.findOne({ owner: req.user.id })
      .populate("employees")
      .populate("companyConnections")
      .populate("pendingConnections")
      .populate("sentConnections")
      .exec();

    if (ownCompany !== null) {
      return jsonResponse(
        res,
        200,
        true,
        `Got user's company successfully`,
        ownCompany
      );
    }

    const user = await User.findById(req.user.id);

    if (user.company === null) {
      return jsonResponse(res, 404, false, `User does not has a company`, {});
    }

    const userCompany = await Company.findById(user.company).populate(
      "employees"
    );

    return jsonResponse(
      res,
      200,
      true,
      `Got user's company successfully`,
      userCompany
    );
  } catch (error) {
    jsonResponse(res, 400, false, `Failed to get user's company`, error);
  }
});

// @route     POST /api/companies/
// @desc      Add a company
// @access    Private
exports.addCompany = asyncHandler(async (req, res, next) => {
  try {
    const company = await Company.create(req.body);
    await User.findByIdAndUpdate(
      req.user.id,
      { company: company._id },
      {
        new: true,
        runValidators: true,
        context: "query",
      }
    );

    company.employees.push(req.user.id);
    await company.save();

    jsonResponse(res, 201, true, "Company created successfully", company);
  } catch (error) {
    jsonResponse(res, 400, false, "Failed to create company", error);
  }
});

//review
// @route     PUT /api/companies/:id
// @desc      Update company
// @access    Private
exports.updateCompany = asyncHandler(async (req, res, next) => {
  try {
    if (!(await Company.findOne({ owner: req.user.id, _id: req.params.id }))) {
      return next(
        new jsonResponse(
          res,
          400,
          false,
          `You are not allowed to update company details`,
          {}
        )
      );
    }

    const { companyName } = req.body;

    const currentUser = await User.findById(req.user.id);
    const companyWithName = await Company.findOne({ companyName });

    if (companyWithName) {
      const nameExist = !currentUser.company.equals(companyWithName._id);

      let errors = {};

      if (nameExist) {
        errors.companyName = "Company name has already been used";

        return jsonResponse(
          res,
          409,
          false,
          "Failed to update company profile",
          {
            errors,
          }
        );
      }
    }

    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      context: "query",
    });

    company
      ? jsonResponse(res, 200, true, "Company updated successfully", company)
      : jsonResponse(
          res,
          404,
          false,
          `Could not find company by id: ${req.params.id}`,
          {}
        );
  } catch (error) {
    jsonResponse(res, 400, false, "Failed to update company", { error });
  }
});

// @route     DELETE /api/companies/:id
// @desc      Delete a company
// @access    Private
exports.deleteCompany = asyncHandler(async (req, res, next) => {
  try {
    await Company.findByIdAndDelete(req.params.id, (error, company) => {
      if (!company) {
        return jsonResponse(res, 404, false, "Company not found", {});
      }
    });

    jsonResponse(res, 200, true, "Company deleted successfully", {});
  } catch (error) {
    jsonResponse(res, 400, false, "Failed to delete company", error);
  }
});

// @route     POST /api/companies/employee
// @desc      Add an employee
// @access    Private
exports.addEmployee = asyncHandler(async (req, res, next) => {
  //Check ownership
  const company = await Company.findOne({ owner: req.user.id });

  if (company === null) {
    return next(
      jsonResponse(
        res,
        400,
        false,
        `You are not allowed to add employees to company`,
        {}
      )
    );
  }

  const employeeInCompany = company.employees.some(function (employee) {
    return employee.equals(req.body.employee);
  });

  if (employeeInCompany) {
    return jsonResponse(
      res,
      400,
      false,
      `Employee has already been added to the company`,
      {}
    );
  }

  const employee = await User.findById(req.body.employee);

  if (employee.company !== null) {
    return jsonResponse(
      res,
      400,
      false,
      `Employee has already joined a company`,
      {}
    );
  }

  await User.findByIdAndUpdate(
    req.body.employee,
    { company: company._id },
    {
      new: true,
      runValidators: true,
      context: "query",
    }
  );

  company.employees.push(mongoose.Types.ObjectId(req.body.employee));

  await company.save();

  jsonResponse(res, 200, true, "Employee added successfully", {});
});

exports.sendConnectionRequest = asyncHandler(async (req, res, next) => {
  //Check ownership
  const company = await Company.findOne({ owner: req.user.id });

  if (company === null) {
    return next(
      jsonResponse(
        res,
        400,
        false,
        `You are not allowed to send connection requests`,
        {}
      )
    );
  }

  const oldConnection = Connection.find({
    sender: company._id,
    receiver: req.bode.company,
  });

  if (oldConnection) {
    return next(
      jsonResponse(res, 400, false, `Request has already been sent`, {})
    );
  }

  const connection = await Connection.create({
    sender: company._id,
    receiver: req.body.company,
    status: "PENDING",
  });

  const otherCompany = await Company.findById(req.body.company);

  otherCompany.pendingConnections.push(company._id);

  await company.save();
  await otherCompany.save();

  jsonResponse(
    res,
    200,
    true,
    "Connection request sent successfully",
    connection
  );
});

exports.acceptConnectionRequest = asyncHandler(async (req, res, next) => {
  //Check ownership
  const company = await Company.findOne({ owner: req.user.id });

  if (company === null) {
    return next(
      new jsonResponse(
        res,
        400,
        false,
        `You are not allowed to accept connection requests`,
        {}
      )
    );
  }

  const connection = await Connection.findOne({ sender: req.body.company });

  connection.status = "ACCEPTED";

  const otherCompany = await Company.findById(req.body.company);

  company.companyConnections.push(req.body.company);
  company.pendingConnections.pull(req.body.company);

  otherCompany.companyConnections.push(company._id);
  otherCompany.sentConnections.pull(company._id);

  await connection.save();
  await company.save();
  await otherCompany.save();

  jsonResponse(
    res,
    200,
    true,
    "Connection request accepted successfully",
    connection
  );
});

exports.rejectConnectionRequest = asyncHandler(async (req, res, next) => {
  //Check ownership
  const company = await Company.findOne({ owner: req.user.id });

  if (company === null) {
    return next(
      new jsonResponse(
        res,
        400,
        false,
        `You are not allowed to reject connection requests`,
        {}
      )
    );
  }

  const connection = await Connection.findOne({ sender: req.body.company });

  connection.status = "REJECTED";

  const otherCompany = await Company.findById(req.body.company);

  company.pendingConnections.pull(req.body.company);

  otherCompany.sentConnections.pull(company._id);

  await connection.save();

  await company.save();
  await otherCompany.save();

  jsonResponse(
    res,
    200,
    true,
    "Connection request rejected successfully",
    connection
  );
});

// @route     GET /api/companies/my-connections
// @desc      Get single company
// @access    Private
exports.getCompanyConnections = asyncHandler(async (req, res, next) => {
  try {
    const company = await Company.findOne({ owner: req.user.id });

    const connections = await Connection.find({
      $or: [{ sender: company._id }, { receiver: company._id }],
    });

    console.log(connections);

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
