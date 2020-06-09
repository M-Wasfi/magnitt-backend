const jsonResponse = (
  response,
  statusCode,
  success,
  responseMessage,
  responseData
) => {
  return response.status(statusCode).send({
    success: success,
    message: responseMessage,
    data: responseData,
  });
};

module.exports = jsonResponse;
