const { responseGen } = require("../utils/response-gen");

exports.validatorWare = (req, res, next) => {
  const { rule, data } = req.body;
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
  const invalidRule = checkRuleKeys(Object.keys(rule), rule);
  if (invalidRule) {
    return res.status(400).json(responseGen(invalidRule));
  }
  //!Checks if Condition value is valid
  const invalidConditionValue = checkConditions(rule.condition);
  if (invalidConditionValue) {
    return res.status(400).json(responseGen(invalidConditionValue));
  }
  //!If the field specified in the rule object is missing from the data passed
  const [result, missing] = drill(rule.field, data);
  if (missing) {
    return res.status(400).json(`field ${missing} is missing from data.`);
  }
  //!Make validation against condition
  if (!makeValidation(result, rule.condition_value, rule.condition)) {
    req.message = `field ${rule.field} failed validation.`;
    req.status = "error";
    req.respData = {
      validation: {
        error: true,
        field: `${rule.field}`,
        field_value: result,
        condition: rule.condition,
        condition_value: rule.condition_value,
      },
    };
  } else {
    req.message = `field ${rule.field} successfully validated.`;
    req.status = "success";
    req.respData = {
      validation: {
        error: false,
        field: `${rule.field}`,
        field_value: result,
        condition: rule.condition,
        condition_value: rule.condition_value,
      },
    };
  }
  return next();
};

const acceptedConditions = ["eq", "neq", "gt", "gte", "contains"];
const ruleKeys = ["field", "condition", "condition_value"];

const checkRuleKeys = (keys = [], ruleObject) => {
  if (keys.length < 1) {
    return "rule field should be a valid JSON object.";
  }
  let data;

  ruleKeys.forEach((rule) => {
    if (!keys.includes(rule) && ruleObject[rule]) {
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
  let query = { ...data };
  const keys = field.split(".");

  keys.forEach((key) => {
    if (query[key]) {
      result = query[key];
      query = { ...result };
    } else {
      missing = key;
      result = null;
      return;
    }
  });
  return [result, missing];
};

const makeValidation = (data, condition_value, condition) => {
  let isValid = false;

  switch (condition) {
    case "eq":
      isValid = data === condition_value;
      break;
    case "neq":
      isValid = data !== condition_value;
      break;
    case "gt":
      if (typeof data !== "number") {
        //!error
        isValid = false;
      } else {
        isValid = data > condition_value;
      }
      break;
    case "gte":
      if (typeof data !== "number") {
        //!error
        isValid = false;
      } else {
        isValid = data >= condition_value;
      }
      break;
    case "contains":
      if (
        typeof data === "number" ||
        typeof data === "string" ||
        data instanceof Array
      ) {
        isValid = data.includes(condition_value);
      } else {
        isValid = Object.values(data).includes(condition_value);
      }
      break;
    default:
      break;
  }
  return isValid;
};
