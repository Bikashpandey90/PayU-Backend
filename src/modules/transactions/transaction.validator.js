const Joi = require("joi");
const transactionDataDTO = Joi.object({
  to: Joi.string().required().messages({
    "string.empty": "To should not be empty",
  }),
  amount: Joi.number().required().messages({
    "number.empty": "Amount is required",
    "number.amount": "Invalid amount format",
  }),
  idempotencyKey: Joi.string().optional().messages({
    "string.empty": "To should not be empty",
  }),
});

module.exports = {
  transactionDataDTO,
};
