const express = require("express");
const {
  validateRuleController,
} = require("../controllers/validate-rule-controller");
const { validatorWare } = require("../middlewares/validator-ware");

const router = express.Router();

router.post("/validate-rule", validatorWare, validateRuleController);

module.exports = router;
