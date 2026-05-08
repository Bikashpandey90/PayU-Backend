const khaltiSvc = require("../integration/khalti.service");
const transactionSvc = require("../transactions/transaction.service");

class UtilityController {
  balanceTopUp = async (req, res, next) => {
    try {
      const { number, amount, service, idempotencyKey } = req.body;

      const data = await transactionSvc.serviceCheckLayer(req, "BALANCE_TOPUP");
      const response = await khaltiSvc.rechargeMobile({
        number,
        amount,
        serviceName: service,
        idempotencyKey: idempotencyKey,
      });
      const isSuccessfulState =
        response?.state === "Success" || response?.state === "Queued";
      if (
        !response ||
        response.status === false ||
        response.error ||
        !isSuccessfulState
      ) {
        return res.status(400).json({
          message: response?.message || response?.Error || "Transaction failed",
          detail: response,
        });
      }
      const transaction = await transactionSvc.transaction({
        from: data.userAccount,
        to: data.adminAccount,
        amount: data.amount,
        idempotencyKey: data.idempotencyKey,
        code: "BALANCE_TOPUP",
      });
      return res.json({
        success: true,
        detail: {
          data: response,
          transaction: transaction,
        },
        status: "PAYMENT_SUCCESS",
        message: "Top up success!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
  getBusRoutes = async (req, res, next) => {
    try {
      const response = await khaltiSvc.getRoutes();
      return res.json({
        status: "SUCCESS",
        data: response,
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };

  getBuses = async (req, res, next) => {
    try {
      const response = await khaltiSvc.fetchBuses(req.body);
      return res.json({
        status: "SUCCESS",
        data: response,
      });
    } catch (exception) {
      console.log(exception);
    }
  };
  getSeats = async (req, res, next) => {
    try {
      const response = await khaltiSvc.getSeatInfo(req.body);
      return res.json({
        status: "SEATS",
        data: response,
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
  bookBus = async (req, res, next) => {
    try {
      let data = req.body;
      const response = await khaltiSvc.bookBus(data);
      return res.json({
        status: "BOOK_SUCCESS",
        data: response,
        message: "Seat booked successfully!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
  addTicketInfo = async (req, res, next) => {
    try {
      const response = await khaltiSvc.addPassengerInfo(req.body);
      return res.json({
        status: "TICKET_INFO_ADDED",
        data: response,
        message: "Ticket info added successfully!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
  busPayment = async (req, res, next) => {
    try {
      const data = await transactionSvc.serviceCheckLayer(
        req,
        "BUS_TICKETING_SERVICE",
      );
      const response = await khaltiSvc.commitBooking(req.body);

      if (
        !response ||
        response.status === false ||
        response.error ||
        response.state !== "Success"
      ) {
        return res.status(400).json({
          message: response?.message || response?.Error || "Transaction failed",
          detail: response,
        });
      }
      const transaction = await transactionSvc.transaction({
        from: data.userAccount,
        to: data.adminAccount,
        amount: data.amount,
        idempotencyKey: data.idempotencyKey,
        code: "BUS_TICKETING_SERVICE",
      });

      return res.json({
        status: "PAYMENT_SUCCESS",
        detail: {
          data: response,
          transaction: transaction,
        },
        message: "Ticket payment successful!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
  busTicket = async (req, res, next) => {
    try {
      const response = await khaltiSvc.downloadTicket(req.body);
      return res.json({
        status: "YOUR_TICKET",
        data: response,
        message: "Ticket fetch Successful!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };

  cableCarTickets = async (req, res, next) => {
    try {
      const response = await khaltiSvc.cableCar(req.body);
      return res.json({
        status: "CABLE_CAR_TICKETS",
        data: response,
        message: "Ticket details fetched!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
  cableCarPay = async (req, res, next) => {
    try {
      const data = await transactionSvc.serviceCheckLayer(
        req,
        "CABLECAR_TICKETING_SERVICE",
      );
      const response = await khaltiSvc.cableCarPayment(req.body);
      const { credits_consumed, credits_available, ...safeResponse } = response;

      if (
        !response ||
        response.status === false ||
        response.error ||
        response.state !== "Success"
      ) {
        return res.status(400).json({
          message: response?.message || response?.Error || "Transaction failed",
          detail: response,
        });
      }
      const transaction = await transactionSvc.transaction({
        from: data.userAccount,
        to: data.adminAccount,
        amount: data.amount,
        idempotencyKey: data.idempotencyKey,
        code: "CABLECAR_TICKETING_SERVICE",
      });
      return res.json({
        status: "PAYMENT_SUCCESS",
        detail: {
          data: safeResponse,
          transaction: transaction,
        },
        message: "Cable Car Payment Success!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
  cableCarTicketFetch = async (req, res, next) => {
    try {
      const response = await khaltiSvc.cableCarTicket(req.body);
      return res.json({
        status: "CABLE_CAR_TICKET",
        data: response,
        message: "Cable Car Ticket!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };

  zoodetails = async (req, res, next) => {
    try {
      const response = await khaltiSvc.zoodetails();
      return res.json({
        status: "ZOO",
        data: response,
      });
    } catch (exception) {
      next(exception);
    }
  };
  zooPay = async (req, res, next) => {
    try {
      const data = await transactionSvc.serviceCheckLayer(
        req,
        "ZOO_TICKETING_SERVICE",
      );
      let payload = req.body;

      const response = await khaltiSvc.zooPayment(payload);

      const { credits_consumed, credits_available, ...safeResponse } = response;

      if (
        !response ||
        response.status === false ||
        response.error ||
        response.state !== "Success"
      ) {
        return res.status(400).json({
          message: response?.message || response?.Error || "Transaction failed",
          detail: response,
        });
      }
      const transaction = await transactionSvc.transaction({
        from: data.userAccount,
        to: data.adminAccount,
        amount: data.amount,
        idempotencyKey: data.idempotencyKey,
        code: "ZOO_TICKETING_SERVICE",
      });
      return res.json({
        status: "PAYMENT_SUCCESS",
        detail: {
          data: safeResponse,
          transaction: transaction,
        },
        message: "Zoo Tickets Booked Successfully",
      });
    } catch (exception) {
      next(exception);
    }
  };
  zooTicket = async (req, res, next) => {
    try {
      const response = await khaltiSvc.zooTicket(req.body);
      return res.json({
        status: "ZOO_TICKET",
        data: response,
      });
    } catch (exception) {
      next(exception);
    }
  };

  antivirusDetails = async (req, res, next) => {
    try {
      const response = await khaltiSvc.fetchAntiDetails(req.body);
      return res.json({
        status: "ANTI_VIRUS",
        data: response,
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
  antiPayment = async (req, res, next) => {
    try {
      const data = await transactionSvc.serviceCheckLayer(
        req,
        "ANTIVIRUS_PRODUCTS",
      );
      const response = await khaltiSvc.makeAntiPayment(req.body);

      if (
        !response ||
        response.status === false ||
        response.error ||
        response.state !== "Success"
      ) {
        return res.status(400).json({
          message: response?.message || response?.Error || "Transaction failed",
          detail: response,
        });
      }
      const transaction = await transactionSvc.transaction({
        from: data.userAccount,
        to: data.adminAccount,
        amount: data.amount,
        idempotencyKey: data.idempotencyKey,
        code: "ANTIVIRUS_PRODUCTS",
      });
      const { credits_consumed, credits_available, ...safeResponse } = response;

      return res.json({
        status: "PAYMENT_SUCCESS",
        message: "Anti virus package purchased successfully!",
        detail: {
          data: safeResponse,
          transaction: transaction,
        },
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };

  fetchDataPacks = async (req, res, next) => {
    try {
      const service = req.params.service;
      const response = await khaltiSvc.datapacks(service);
      return res.json({
        data: response,
        status: "DATA_PACKS",
        message: "Data packs fetch sucess!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };

  buyDataPacks = async (req, res, next) => {
    try {
      const data = await transactionSvc.serviceCheckLayer(req, "DATA_PACKS");

      const response = await khaltiSvc.buyDataPack(req.body);
      const { credits_consumed, credits_available, ...safeResponse } = response;

      const isSuccessfulState =
        response?.state === "Success" || response?.state === "Queued";

      if (
        !response ||
        response.status === false ||
        response.error ||
        !isSuccessfulState
      ) {
        return res.status(400).json({
          message: response?.message || response?.Error || "Transaction failed",
          detail: response,
        });
      }
      const transaction = await transactionSvc.transaction({
        from: data.userAccount,
        to: data.adminAccount,
        amount: data.amount,
        idempotencyKey: data.idempotencyKey,
        code: "DATA_PACKS",
      });

      return res.json({
        detail: {
          data: safeResponse,
          transaction: transaction,
        },
        status: "PAYMENT_SUCCESS",
        message: "Data packs purchase sucess!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };

  listWaste = async (req, res, next) => {
    try {
      const response = await khaltiSvc.wasteManagement();
      return res.json({
        data: response,
        status: "WASTE_MANAGEMENT_LIST",
        message: "Waste management list fetch sucess!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
  wasteDetail = async (req, res, next) => {
    try {
      const data = req.body;
      const response = await khaltiSvc.wasteManagementDetail(data);
      return res.json({
        data: response,
        status: "WASTE_MANAGEMENT_DETAIL",
        message: "Waste management detail fetch sucess!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
  calculateWaste = async (req, res, next) => {
    try {
      const data = req.body;
      const response = await khaltiSvc.wasteManagementCalculate(data);
      return res.json({
        data: response,
        status: "WASTE_MANAGEMENT_AMOUNT",
        message: "Waste management amount fetch sucess!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
  wastePayment = async (req, res, next) => {
    try {
      const data = await transactionSvc.serviceCheckLayer(
        req,
        "WASTE_MANAGEMENT_SERVICE",
      );
      const response = await khaltiSvc.wasteManagementPayment(req.body);
      const { credits_consumed, credits_available, ...safeResponse } = response;

      if (
        !response ||
        response.status === false ||
        response.error ||
        response.state !== "Success"
      ) {
        return res.status(400).json({
          message: response?.message || response?.Error || "Transaction failed",
          detail: response,
        });
      }
      const transaction = await transactionSvc.transaction({
        from: data.userAccount,
        to: data.adminAccount,
        amount: data.amount,
        idempotencyKey: data.idempotencyKey,
        code: "WASTE_MANAGEMENT_SERVICE",
      });
      return res.json({
        detail: {
          data: safeResponse,
          transaction: transaction,
        },
        status: "PAYMENT_SUCCESS",
        message: "Waste management payment sucess!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
  landlinePayment = async (req, res, next) => {
    try {
      const data = await transactionSvc.serviceCheckLayer(
        req,
        "LANDLINE_RECHARGE",
      );
      const response = await khaltiSvc.landline(req.body);
      const { credits_consumed, credits_available, ...safeResponse } = response;

      const isSuccessfulState =
        response?.state === "Success" || response?.state === "Queued";

      if (
        !response ||
        response.status === false ||
        response.error ||
        !isSuccessfulState
      ) {
        return res.status(400).json({
          message: response?.message || response?.Error || "Transaction failed",
          detail: response,
        });
      }
      const transaction = await transactionSvc.transaction({
        from: data.userAccount,
        to: data.adminAccount,
        amount: data.amount,
        idempotencyKey: data.idempotencyKey,
        code: "LANDLINE_RECHARGE",
      });
      return res.json({
        detail: {
          data: safeResponse,
          transaction: transaction,
        },
        status: "PAYMENT_SUCCESS",
        message: "Landline payment sucess!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };

  socialSecDetail = async (req, res, next) => {
    try {
      const data = req.body;
      const response = await khaltiSvc.socialSecurityDetail(data);
      if (
        !response ||
        response.status === false ||
        response.error ||
        response?.state !== "Success"
      ) {
        return res.status(400).json({
          message: response?.message || response?.Error || "Error fetching",
          detail: response,
        });
      }
      return res.json({
        data: response,
        status: "SOCIAL_SEC_DETAIL",
        message: "Social security detail fetch sucess!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };

  socialSecPayment = async (req, res, next) => {
    try {
      const data = await transactionSvc.serviceCheckLayer(
        req,
        "SOCIAL_SECURITY_SERVICE",
      );
      const payload = req.body;
      const response = await khaltiSvc.socialSecurityPayment(payload);
      const { credits_consumed, credits_available, ...safeResponse } = response;

      const isSuccessfulState =
        response?.state === "Success" || response?.state === "Queued";

      if (
        !response ||
        response.status === false ||
        response.error ||
        !isSuccessfulState
      ) {
        return res.status(400).json({
          message: response?.message || response?.Error || "Transaction failed",
          detail: response,
        });
      }
      const transaction = await transactionSvc.transaction({
        from: data.userAccount,
        to: data.adminAccount,
        amount: data.amount,
        idempotencyKey: data.idempotencyKey,
        code: "SOCIAL_SECURITY_SERVICE",
      });
      return res.json({
        detail: {
          data: safeResponse,
          transaction: transaction,
        },
        status: "PAYMENT_SUCCESS",
        message: "Social security payment sucess!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };

  emiDetail = async (req, res, next) => {
    try {
      const response = await khaltiSvc.emiDetail(req.body);
      return res.json({
        data: response,
        status: "EMI_DETAILS",
        message: "EMI details fetch sucess!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };

  emiPayment = async (req, res, next) => {
    try {
      const data = await transactionSvc.serviceCheckLayer(req, "EMI_SERVICE");

      let payload = req.body;
      const response = await khaltiSvc.emiPayment(payload);
      const { credits_consumed, credits_available, ...safeResponse } = response;

      if (
        !response ||
        response.status === false ||
        response.error ||
        response.state !== "Success"
      ) {
        return res.status(400).json({
          message: response?.message || response?.Error || "Transaction failed",
          detail: response,
        });
      }
      const transaction = await transactionSvc.transaction({
        from: data.userAccount,
        to: data.adminAccount,
        amount: data.amount,
        idempotencyKey: data.idempotencyKey,
        code: "EMI_SERVICE",
      });
      return res.json({
        detail: {
          data: safeResponse,
          transaction: transaction,
        },
        status: "PAYMENT_SUCCESS",
        message: "EMI payment sucess!",
      });
    } catch (exception) {
      next(exception);
      console.log(exception);
    }
  };
  communityElectricityDetail = async (req, res, next) => {
    try {
      const data = req.body;
      const response = await khaltiSvc.communityElectricityDetail(data);
      return res.json({
        data: response,
        status: "COMMUNITY_ELECTRICITY_DETAIL",
        message: "Community electricity detail fetch sucess!",
      });
    } catch (exception) {
      next(exception);
      console.log(exception);
    }
  };
  getFlightSectors = async (req, res, next) => {
    try {
      const response = await khaltiSvc.flightSector();
      return res.json({
        data: response,
        status: "FLIGHT_SECTORS",
        message: "Flight sectors fetch sucess!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
  searchFlight = async (req, res, next) => {
    try {
      let data = req.body;
      const response = await khaltiSvc.searchFlight(data);
      return res.json({
        data: response,
        status: "FLIGHT_SECTORS",
        message: "Flight sectors fetch sucess!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
  governmentVoucher = async (req, res, next) => {
    try {
      let data = req.body;
      // if (data.service === "echalan") {
      //   console.log("ECHALAN");
      // }
      const response = await khaltiSvc.govVoucher(data);

      return res.json({
        data: response,
        status: "PAYMENT_SUCCESS",
        message: "Voucher Payment success!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };

  governmentPayment = async (req, res, next) => {
    try {
      const data = await transactionSvc.serviceCheckLayer(
        req,
        "GOVERNMENT_PAYMENT_SERVICE",
      );
      let payload = req.body;

      const response = await khaltiSvc.govPayment(payload);
      const { credits_consumed, credits_available, ...safeResponse } = response;

      if (
        !response ||
        response.status === false ||
        response.error ||
        response.state !== "Success"
      ) {
        return res.status(400).json({
          message: response?.message || response?.Error || "Transaction failed",
          detail: response,
        });
      }
      const transaction = await transactionSvc.transaction({
        from: data.userAccount,
        to: data.adminAccount,
        amount: data.amount,
        idempotencyKey: data.idempotencyKey,
        code: "GOVERNMENT_PAYMENT_SERVICE",
      });
      return res.json({
        detail: {
          data: safeResponse,
          transaction: transaction,
        },
        status: "PAYMENT_SUCCESS",
        message: "Voucher Payment success!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
  meroShareCounters = async (req, res, next) => {
    try {
      const response = await khaltiSvc.meroshareCounters();
      return res.json({
        data: response,
        status: "MEROSHARE_COUNTERS",
        message: "Meroshare counter fetch success!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
  meroShareDetails = async (req, res, next) => {
    try {
      let data = req.body;
      const response = await khaltiSvc.meroshareDetails(data);
      return res.json({
        data: response,
        status: "MEROSHARE_DETAILS",
        message: "Meroshare detail fetch success!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
  meroSharePayment = async (req, res, next) => {
    try {
      const data = await transactionSvc.serviceCheckLayer(
        req,
        "MEROSHARE_SERVICE",
      );
      let payload = req.body;
      const response = await khaltiSvc.merosharePayment(payload);
      const { credits_consumed, credits_available, ...safeResponse } = response;

      if (
        !response ||
        response.status === false ||
        response.error ||
        response.state !== "Success"
      ) {
        return res.status(400).json({
          message: response?.message || response?.Error || "Transaction failed",
          detail: response,
        });
      }
      const transaction = await transactionSvc.transaction({
        from: data.userAccount,
        to: data.adminAccount,
        amount: data.amount,
        idempotencyKey: data.idempotencyKey,
        code: "MEROSHARE_SERVICE",
      });
      return res.json({
        detail: {
          data: safeResponse,
          transaction: transaction,
        },
        status: "PAYMENT_SUCCESS",
        message: "Meroshare payment  success!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
}

const utilityCtrl = new UtilityController();
module.exports = utilityCtrl;
