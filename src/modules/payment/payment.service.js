const khaltiSvc = require("../integration/khalti.service");
const walletSvc = require("../wallet/wallet.service");

class PaymentService {
  loadFromKhalti = async () => {
    try {
      const verification = await khaltiSvc.verifyPayment(token, amount);
      if (!verification.success) {
        throw new Error("Payment verification failed");
      }
      const load = await walletSvc.credit({ userId, amount });
      if (!load) {
        throw new Error("Wallet Load Failed");
      }
      return load;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };
}

const paymentSvc = new PaymentService();
module.exports = paymentSvc;
