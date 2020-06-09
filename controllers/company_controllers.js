const mongoose = require("mongoose");

const asyncHandler = require("../helpers/async_handler");
const jsonResponse = require("../helpers/json_response");
const tokenResponse = require("../helpers/token_response");

const Company = require("../models/company");
const User = require("../models/user");

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
    const company = await Company.findById(req.params.id);

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

// @route     POST /api/companies/
// @desc      Add a company
// @access    Private
exports.addCompany = asyncHandler(async (req, res, next) => {
  try {
    const company = await Company.create(req.body);

    company.employees.push(req.user.id);
    await company.save();

    jsonResponse(res, 201, true, "Company created successfully", company);
  } catch (error) {
    jsonResponse(res, 400, false, "Failed to create company", error);
  }
});

// @route     PUT /api/companies/:id
// @desc      Update company
// @access    Private
exports.updateCompany = asyncHandler(async (req, res, next) => {
  try {
    if (!(await Company.findOne({ owner: req.user.id }))) {
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
          company
        );
  } catch (error) {
    jsonResponse(res, 400, false, "Failed to update company", error);
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

// @route     POST /api/companies/employees
// @desc      Add an employee
// @access    Private
exports.addEmployee = asyncHandler(async (req, res, next) => {
  //Check ownership
  const company = await Company.findOne({ owner: req.user.id });

  if (!company) {
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

  const employee = company.employees.some(function (employee) {
    return employee.equals(req.body.employee);
  });

  if (employee) {
    return next(
      jsonResponse(
        res,
        400,
        false,
        `Employee has already been added to the company`,
        {}
      )
    );
  }

  employee.company = mongoose.Types.ObjectId(company._id);

  company.employees.push(mongoose.Types.ObjectId(req.body.employee));

  await company.save();
  await employee.save();

  jsonResponse(res, 200, true, "Employee added successfully", {});
});

exports.sendConnectionRequest = asyncHandler(async (req, res, next) => {
  //Check ownership
  const company = await Company.findOne({ owner: req.user.id });

  if (!company) {
    return next(
      new jsonResponse(
        res,
        400,
        false,
        `You are not allowed to send connection requests`,
        {}
      )
    );
  }

  const otherCompany = await Company.findById(req.body.company);

  company.sentConnections.push(req.body.company);
  otherCompany.pendingConnections.push(company._id);

  await company.save();
  await otherCompany.save();

  jsonResponse(res, 200, true, "Connection request sent successfully", {});
});

exports.acceptConnectionRequest = asyncHandler(async (req, res, next) => {
  //Check ownership
  const company = await Company.findOne({ owner: req.user.id });

  if (!company) {
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

  const otherCompany = await Company.findById(req.body.company);

  company.companyConnections.push(req.body.company);
  company.pendingConnections.pull(req.body.company);

  otherCompany.companyConnections.push(company._id);
  otherCompany.sentConnections.pull(company._id);

  await company.save();
  await otherCompany.save();

  jsonResponse(res, 200, true, "Connection request accepted successfully", {});
});

exports.rejectConnectionRequest = asyncHandler(async (req, res, next) => {
  //Check ownership
  const company = await Company.findOne({ owner: req.user.id });

  if (!company) {
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

  const otherCompany = await Company.findById(req.body.company);

  company.pendingConnections.pull(req.body.company);

  otherCompany.sentConnections.pull(company._id);

  await company.save();
  await otherCompany.save();

  jsonResponse(res, 200, true, "Connection request rejected successfully", {});
});
