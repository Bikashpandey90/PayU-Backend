class EsewaService {
  verifyEsewa = async (req, res) => {
    try {
      const { transaction_uuid, total_amount } = req.body;

      const url = `https://rc.esewa.com.np/api/epay/transaction/status/?product_code=EPAYTEST&total_amount=${total_amount}&transaction_uuid=${transaction_uuid}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "COMPLETE") {
        // ✅ credit wallet here
        return res.json({ success: true, detail: data });
      }

      return res.status(400).json({ success: false, detail: data });
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };
}

const esewaSvc = new EsewaService();
module.exports = esewaSvc;
