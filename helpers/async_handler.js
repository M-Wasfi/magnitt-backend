const asyncHandler = (customFunction) => (request, response, next) => {
  Promise.resolve(customFunction(request, response, next)).catch(next);
};

module.exports = asyncHandler;
