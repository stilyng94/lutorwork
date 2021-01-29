const { responseGen } = require("../utils/response-gen");

exports.validateRuleController = (req, res, next) => {
  try {
    const { message, status, respData } = req;
    return res.status(200).json(responseGen(message, status, respData));
  } catch (error) {
    return next();
  }
};
