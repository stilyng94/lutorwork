const { responseGen } = require("../utils/response-gen");

exports.validatorWare = (req, res, next) => {
  const { rule, data } = req.body;
  console.log(typeof data);
  //!Check if rule key exists
  if (!rule) {
    return res.status(400).json(responseGen("rule is required."));
  }
  //!Check if data key exists
  if (!data) {
    return res.status(400).json(responseGen("data is required."));
  }
  //!Check if rule is an object
  if (typeof rule !== "object") {
    return res.status(400).json(responseGen("rule should be an object."));
  }
  //!Check if type of data
  if (!["object", "string"].includes(typeof data)) {
    return res
      .status(400)
      .json(
        responseGen(`data should be of an|a ["object", "array", "string"].`)
      );
  }
  //!Checks if Rule contains necessary keys
  const invalidRule = checkRuleKeys(Object.keys(rule));
  if (invalidRule) {
    return res.status(400).json(responseGen(invalidRule));
  }
  //!Checks if Condition value is valid
  const invalidConditionValue = checkConditions(rule.condition);
  if (invalidConditionValue) {
    return res.status(400).json(responseGen(invalidConditionValue));
  }
  //!If the field specified in the rule object is missing from the data passed
  const [result, searchKey, missing] = drill(rule.field, data);
  if (missing) {
    return res.status(400).json(`field ${missing} is missing from data.`);
  }
  req.message = `field ${searchKey} successfully validated.`;
  req.status = "success";
  req.respData = {
    validation: {
      error: false,
      field: searchKey,
      field_value: result,
      condition: rule.condition,
      condition_value: rule.condition_value,
    },
  };
  return next();
};

const acceptedConditions = ["eq", "neq", "gt", "gte", "contains"];
const ruleKeys = ["field", "condition", "condition_value"];

const checkRuleKeys = (keys = []) => {
  if (keys.length < 1) {
    return "rule field should be a valid JSON object.";
  }
  let data;

  ruleKeys.forEach((rule) => {
    if (!keys.includes(rule)) {
      data = `rule.${rule} is required.`;
    }
  });

  return data;
};

const checkConditions = (condition) => {
  let error;

  if (!acceptedConditions.includes(condition)) {
    error = `Accepted condition are [${acceptedConditions}].`;
  }
  return error;
};

const drill = (field = "", data = {}) => {
  let result;
  let missing;
  let searchKey;
  let query = { ...data };
  const keys = field.split(".");

  keys.forEach((key) => {
    if (query[key]) {
      result = query[key];
      searchKey = key;
      query = { ...result };
    } else {
      missing = key;
      result = null;
      return;
    }
  });
  return [result, searchKey, missing];
};
