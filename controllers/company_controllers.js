const mongoose = require("mongoose");

const asyncHandler = require("../helpers/async_handler");
const jsonResponse = require("../helpers/json_response");

const Company = require("../models/company");
const User = require("../models/user");

///////////////////////////////////////////////////////////////////////////////
//TODO review access
// @route   GET api/companies
// @desc    Get all companies
// @access  Public
exports.getCompanies = asyncHandler(async (req, res, next) => {
  try {
    const companies = await Company.find();

    jsonResponse(res, 200, true, "Got all companies successfully", companies);
  } catch (error) {
    jsonResponse(res, 400, false, "Failed to get all companies", error);
  }
});

///////////////////////////////////////////////////////////////////////////////
// @route     GET /api/companies/:id
// @desc      Get single company
// @access    Public
exports.getCompany = asyncHandler(async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).populate("employees");

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

///////////////////////////////////////////////////////////////////////////////
// @route     GET /api/companies/my-company
// @desc      Get logged in user company info
// @access    Private
exports.getMyCompany = asyncHandler(async (req, res, next) => {
  try {
    // Get the owner company
    const ownCompany = await Company.findOne({ owner: req.user.id })
      .populate("employees")
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

    // Get the employee company
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

///////////////////////////////////////////////////////////////////////////////
// @route     POST /api/companies/
// @desc      Add a company
// @access    Private
exports.addCompany = asyncHandler(async (req, res, next) => {
  try {
    const company = await Company.create(req.body);

    // add company to user profile
    await User.findByIdAndUpdate(
      req.user.id,
      { company: company._id },
      {
        new: true,
        runValidators: true,
        context: "query",
      }
    );

    // add user to company's employees list
    company.employees.push(req.user.id);
    await company.save();

    jsonResponse(res, 201, true, "Company created successfully", company);
  } catch (error) {
    jsonResponse(res, 400, false, "Failed to create company", error);
  }
});

///////////////////////////////////////////////////////////////////////////////
// @route     PUT /api/companies/:id
// @desc      Update company profile
// @access    Private
exports.updateCompany = asyncHandler(async (req, res, next) => {
  try {
    // check if the user is the owner of the company
    if (!(await Company.findOne({ owner: req.user.id, _id: req.params.id }))) {
      return next(
        jsonResponse(
          res,
          403,
          false,
          `You are not allowed to update company details`,
          {}
        )
      );
    }

    // check if new company name exists
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

    // update company
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

///////////////////////////////////////////////////////////////////////////////
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

///////////////////////////////////////////////////////////////////////////////
// @route     POST /api/companies/employee
// @desc      Add an employee to the company
// @access    Private
exports.addEmployee = asyncHandler(async (req, res, next) => {
  //Check user ownership over the company
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

  // check if employee already has joined a company
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

  //check if employee already joined the company
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

  // add company to employee profile
  await User.findByIdAndUpdate(
    req.body.employee,
    { company: company._id },
    {
      new: true,
      runValidators: true,
      context: "query",
    }
  );

  // add employee to company's employees list
  company.employees.push(mongoose.Types.ObjectId(req.body.employee));

  await company.save();

  jsonResponse(res, 200, true, "Employee added successfully", {});
});
