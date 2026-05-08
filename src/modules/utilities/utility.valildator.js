const Joi = require("joi");

// const busBookingDTO = Joi.object({
//   to: Joi.string().required().messages({
//     "string.empty": "To should not be empty",
//   }),
//   amount: Joi.number().required().messages({
//     "number.empty": "Amount is required",
//     "number.amount": "Invalid amount format",
//   }),
//   idempotencyKey: Joi.string().optional().messages({
//     "string.empty": "To should not be empty",
//   }),
// });

const uuid = Joi.string().uuid();

const amount = Joi.number().positive().required();

const phone = Joi.string()
  .pattern(/^[0-9]{10}$/)
  .required()
  .messages({
    "string.pattern.base": "Phone must be 10 digits",
  });

const email = Joi.string().email();

exports.initiatePaymentDTO = Joi.object({
  amount: Joi.number().positive().required(),
  purchase_order_id: Joi.string().required(),
  purchase_order_name: Joi.string().required(),
});

exports.verifyPaymentDTO = Joi.object({
  token: Joi.string().required(),
  amount: Joi.number().positive().required(),
});

exports.fetchBusesDTO = Joi.object({
  from: Joi.string().required(),
  to: Joi.string().required(),
  date: Joi.string().required(), // ideally ISO date
});

exports.getSeatInfoDTO = Joi.object({
  bus_id: Joi.string().required(),
  session_id: Joi.string().required(),
});

exports.bookBusDTO = Joi.object({
  bus_id: Joi.string().required(),
  session_id: Joi.string().required(),
  seats: Joi.array().items(Joi.string()).min(1).required(),
});

exports.addPassengerDTO = Joi.object({
  bus_id: Joi.string().required(),
  session_id: Joi.string().required(),
  seats: Joi.array().items(Joi.string()).required(),
  name: Joi.string().required(),
  email,
  mobile_number: phone,
  ticket_serial_no: Joi.string().required(),
  boarding_point: Joi.string().required(),
});

exports.commitBookingDTO = Joi.object({
  session_id: Joi.string().required(),
});

exports.downloadTicketDTO = Joi.object({
  bus_id: Joi.string().required(),
  session_id: Joi.string().required(),
});
module.exports = {
  uuid,
  amount,
  phone,
  email,
};
