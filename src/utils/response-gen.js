exports.responseGen = (message, status = "error", data = null) => {
  return {
    message: message,
    status: status,
    data: data,
  };
};
