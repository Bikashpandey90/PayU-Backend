const { checkLogin } = require("../../middlewares/auth.middleware");
const { allowRole } = require("../../middlewares/rbac.middleware");
const utilityCtrl = require("./utility.controller");

const utilityRouter = require("express").Router();

utilityRouter.get("/bus-routes", utilityCtrl.getBusRoutes);
utilityRouter.post("/buses", utilityCtrl.getBuses);
utilityRouter.post("/seats", utilityCtrl.getSeats);
utilityRouter.post(
  "/book",
  checkLogin,
  allowRole(["admin", "user"]),
  utilityCtrl.bookBus,
);
utilityRouter.post(
  "/ticket-info",
  checkLogin,
  allowRole(["admin", "user"]),
  utilityCtrl.addTicketInfo,
);
utilityRouter.post(
  "/bus-ticket-payment",
  checkLogin,
  allowRole(["admin", "user"]),
  utilityCtrl.busPayment,
);
utilityRouter.post(
  "/bus-ticket",
  checkLogin,
  allowRole(["admin", "user"]),
  utilityCtrl.busTicket,
);

utilityRouter.post(
  "/topup",
  checkLogin,
  allowRole(["admin", "user"]),
  utilityCtrl.balanceTopUp,
);

utilityRouter.get("/zoo", utilityCtrl.zoodetails);
utilityRouter.post(
  "/zoo-payment",
  checkLogin,
  allowRole(["admin", "user"]),
  utilityCtrl.zooPay,
);
utilityRouter.post(
  "/zoo-ticket",
  checkLogin,
  allowRole(["admin", "user"]),
  utilityCtrl.zooTicket,
);

utilityRouter.post("/cable-car", utilityCtrl.cableCarTickets);
utilityRouter.post(
  "/cable-car-payment",
  checkLogin,
  allowRole(["admin", "user"]),
  utilityCtrl.cableCarPay,
);
utilityRouter.get(
  "/cable-car-ticket",
  checkLogin,
  allowRole(["admin", "user"]),
  utilityCtrl.cableCarTicketFetch,
);

utilityRouter.post("/antivirus-details", utilityCtrl.antivirusDetails);
utilityRouter.post(
  "/antivirus-purchase",
  checkLogin,
  allowRole(["admin", "user"]),
  utilityCtrl.antiPayment,
);

utilityRouter.get("/data-packs/:service", utilityCtrl.fetchDataPacks);
utilityRouter.post(
  "/buy-data-pack",
  checkLogin,
  allowRole(["admin", "user"]),
  utilityCtrl.buyDataPacks,
);

utilityRouter.get("/waste-management-list", utilityCtrl.listWaste);
utilityRouter.post(
  "/waste-management-details",
  checkLogin,
  allowRole(["admin", "user"]),
  utilityCtrl.wasteDetail,
);
utilityRouter.post(
  "/waste-management-calculate",
  checkLogin,
  allowRole(["admin", "user"]),
  utilityCtrl.calculateWaste,
);
utilityRouter.post(
  "/waste-management-payment",
  checkLogin,
  allowRole(["admin", "user"]),
  utilityCtrl.wastePayment,
);

utilityRouter.post(
  "/landline",
  checkLogin,
  allowRole(["admin", "user"]),
  utilityCtrl.landlinePayment,
);

utilityRouter.post(
  "/social-security-detail",
  checkLogin,
  allowRole(["admin", "user"]),
  utilityCtrl.socialSecDetail,
);
utilityRouter.post(
  "/social-security-payment",
  checkLogin,
  allowRole(["admin", "user"]),
  utilityCtrl.socialSecPayment,
);

utilityRouter.post(
  "/emi-details",
  checkLogin,
  allowRole(["admin", "user"]),
  utilityCtrl.emiDetail,
);
utilityRouter.post(
  "/emi-payment",
  checkLogin,
  allowRole(["admin", "user"]),
  utilityCtrl.emiPayment,
);

utilityRouter.post(
  "/community-electricity",

  utilityCtrl.communityElectricityDetail,
);

utilityRouter.post("/government-voucher", utilityCtrl.governmentVoucher);
utilityRouter.post(
  "/government-payment",
  checkLogin,
  allowRole(["admin", "user"]),
  utilityCtrl.governmentPayment,
);

utilityRouter.post("/flight-sectors", utilityCtrl.getFlightSectors);
utilityRouter.post("/search-flight", utilityCtrl.searchFlight);

utilityRouter.get("/meroshare", utilityCtrl.meroShareCounters);
utilityRouter.post("/meroshare-details", utilityCtrl.meroShareDetails);
utilityRouter.post(
  "/meroshare-payment",
  checkLogin,
  allowRole(["admin", "user"]),
  utilityCtrl.meroSharePayment,
);

module.exports = utilityRouter;
