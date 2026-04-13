const axios = require("axios");

class KhaltiService {
  constructor() {
    this.baseURL = process.env.KHALTI_SERVICE_URL;
    this.checkOutURL = process.env.KHALTI_CHECKOUT_URL;
    this.apiToken = process.env.KHALTI_SECRET_KEY;
  }

  async initiatePayment({ amount, purchase_order_id, purchase_order_name }) {
    try {
      const response = await axios.post(
        `${this.checkOutURL}/epayment/initiate/`,
        {
          return_url: `${process.env.BACKEND_BASE_URL}/transaction/khalti/verify`,
          website_url: process.env.FRONETEND_BASE_URL,
          amount: amount * 100,
          purchase_order_id,
          purchase_order_name,
        },
        {
          headers: {
            Authorization: `Key ${this.apiToken}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.log("Khalti initiate error:", error.response?.data);
      throw error;
    }
  }

  async verifyPayment(token, amount) {
    const res = await axios.post(
      `${process.env.KHALTI_CHECKOUT_URL}/payment/verify/`,
      { token, amount },
      {
        headers: {
          Authorization: "Key YOUR_SECRET_KEY",
        },
      },
    );

    return res.data;
  }

  getRoutes = async () => {
    try {
      const res = await axios.post(
        `${this.baseURL}/api/servicegroup/routes/bus/`,
        {
          token: this.apiToken,
        },
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
    }
  };

  fetchBuses = async ({ from, to, date }) => {
    try {
      const res = await axios.get(
        `${this.baseURL}/api/servicegroup/search-v2/bus/`,
        {
          params: {
            token: this.apiToken,
            reference: crypto.randomUUID(),
            from,
            to,
            date,
          },
        },
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };

  getSeatInfo = async ({ bus_id, session_id }) => {
    try {
      const res = await axios.post(
        `${this.baseURL}/api/servicegroup/seatsinfo/bus/`,
        {
          token: this.apiToken,
          bus_id,
          session_id,
          reference: crypto.randomUUID(),
        },
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };

  async addPassengerInfo({ bus_id, session_id, seats, ...info }) {
    const res = await axios.post(
      `${this.baseURL}/api/servicegroup/addinfo-v2/bus/`,
      {
        token: this.apiToken,
        session_id,
        bus_id,
        seats,
        ...info,
      },
    );
    return res.data;
  }

  async commitBooking({ session_id }) {
    const res = await axios.post(
      `${this.baseURL}/api/servicegroup/commit-v2/bus/`,
      {
        token: this.apiToken,
        session_id,
      },
    );
    return res.data;
  }

  async downloadTicket({ ticketId }) {
    // ticketId would come from commit result or download API
    const res = await axios.get(`${this.baseURL}/api/download/${ticketId}`);
    return res.data;
  }

  rechargeMobile = async ({ number, amount, serviceName }) => {
    try {
      const res = await axios.post(`${this.baseURL}/api/use/${serviceName}/`, {
        token: this.apiToken,
        number,
        amount,
        reference: crypto.randomUUID(),
      });
      return res.data;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };

  zoodetails = async () => {
    try {
      const res = await axios.post(
        `${this.baseURL}/api/servicegroup/details/zoo/`,
        {
          token: this.apiToken,
          reference: crypto.randomUUID(),
        },
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };
  fetchAntiDetails = async (data) => {
    try {
      const { antivirus } = data;
      if (antivirus === "kaspersky") {
        const res = await axios.post(
          `${this.baseURL}/api/servicegroup/details/antivirus-service/`,
          {
            token: this.apiToken,
          },
        );
        return res.data;
      }
      const res = await axios.get(
        `${this.baseURL}/api/products/${antivirus}/`,
        {
          params: {
            token: this.apiToken,
          },
        },
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };
}

const khaltiSvc = new KhaltiService();
module.exports = khaltiSvc;
