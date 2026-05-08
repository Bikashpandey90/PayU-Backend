require("dotenv").config();
const axios = require("axios");

class KhaltiService {
  constructor() {
    this.baseURL = process.env.KHALTI_SERVICE_URL;
    this.checkOutURL = process.env.KHALTI_CHECKOUT_URL;
    this.apiToken = process.env.KHALTI_SERVICE_TOKEN;
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
  bookBus = async ({ bus_id, session_id, seats }) => {
    try {
      const res = await axios.post(
        `${this.baseURL}/api/servicegroup/book-v2/bus/`,
        {
          token: this.apiToken,
          bus_id,
          session_id,
          seats: JSON.stringify(seats),
          reference: crypto.randomUUID(),
        },
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };
  addPassengerInfo = async ({
    bus_id,
    session_id,
    seats,
    name,
    email,
    mobile_number,
    ticket_serial_no,
    boarding_point,
  }) => {
    try {
      console.log(session_id);
      const res = await axios.post(
        `${this.baseURL}/api/servicegroup/addinfo-v2/bus/`,
        {
          token: this.apiToken,
          session_id,
          bus_id,
          seats: JSON.stringify(seats),
          boarding_point,
          name,
          email,
          mobile_number,
          ticket_serial_no,
        },
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };

  commitBooking = async ({ session_id }) => {
    try {
      const res = await axios.post(
        `${this.baseURL}/api/servicegroup/commit-v2/bus/`,
        {
          token: this.apiToken,
          session_id,
        },
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };

  downloadTicket = async ({ bus_id, session_id }) => {
    // ticketId would come from commit result or download API
    try {
      const res = await axios.get(
        `${this.baseURL}/api/servicegroup/downloadticket/bus/`,
        {
          token: this.apiToken,
          reference: crypto.randomUUID(),
          bus_id: bus_id,
          session_id: session_id,
        },
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };

  rechargeMobile = async ({ number, amount, serviceName, idempotencyKey }) => {
    try {
      const res = await axios.post(`${this.baseURL}/api/use/${serviceName}/`, {
        token: this.apiToken,
        number,
        amount,
        reference: idempotencyKey,
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
  zooPayment = async ({ name, email, phone, products, idempotencyKey }) => {
    try {
      const res = await axios.post(
        `${this.baseURL}/api/servicegroup/commit/zoo/`,
        {
          token: this.apiToken,
          reference: idempotencyKey,
          name,
          email,
          mobile_number: phone,
          products,
        },
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };
  zooTicket = async ({ session }) => {
    try {
      const res = await axios.post(
        `${this.baseURL}/api/servicegroup/downloadticket/zoo/`,
        {
          token: this.apiToken,
          log_id: session,
        },
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };

  cableCar = async ({ service, trip_type }) => {
    try {
      const res = await axios.post(
        `${this.baseURL}/api/servicegroup/details/cable-car/`,
        {
          token: this.apiToken,
          reference: crypto.randomUUID(),
          service: service,
          trip_type: trip_type,
        },
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };
  cableCarPayment = async ({
    name,
    trip_type,
    phone,
    tickets,
    amount,
    session,
    idempotencyKey,
  }) => {
    try {
      const res = await axios.post(
        `${this.baseURL}/api/servicegroup/commit/cable-car/`,
        {
          token: this.apiToken,
          reference: idempotencyKey,
          trip_type: trip_type,
          contact_name: name,
          amount: amount,
          mobile_number: phone,
          tickets: JSON.stringify(tickets),
          session_id: session,
        },
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };
  cableCarTicket = async ({ session, service }) => {
    try {
      const res = await axios.post(
        `${this.baseURL}/api/servicegroup/downloadticket/cable-car/`,
        {
          token: this.apiToken,
          session_id: session,
          service: service,
          base64: true,
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

  makeAntiPayment = async (data) => {
    try {
      let payload = {
        token: this.apiToken,
        product_code: data.product_code,
        amount: data.amount,
        name: "Dev Dev",
        email: "Dev Dev",
        mobile: "1234567899",
        reference: data.idempotencyKey,
      };
      const response = await axios.post(
        `${this.baseURL}/api/servicegroup/commit/antivirus-service/`,
        payload,
      );
      return response.data;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };

  datapacks = async (service) => {
    try {
      let route;
      if (service === "ntc") {
        route = "ntc-package";
      } else {
        route = "ncell-product";
      }
      const res = await axios.post(
        `${this.baseURL}/api/servicegroup/getpackages/${route}/`,
        {
          token: this.apiToken,
        },
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
    }
  };

  buyDataPack = async ({
    service,
    package_id,
    amount,
    number,
    idempotencyKey,
  }) => {
    try {
      let data = {};
      let route;
      if (service === "ntc") {
        route = "ntc-package";
        data = {
          token: this.apiToken,
          package_id: package_id,
          amount: amount,
          number: number,
          reference: idempotencyKey,
        };
      } else {
        route = "ncell-product";
        data = {
          amount: amount,
          reference: idempotencyKey,
          product_code: package_id,
          number: number,
          token: this.apiToken,
        };
      }
      console.log("Sending this data", data);
      const res = await axios.post(`${this.baseURL}/api/use/${route}/`, data);
      const response = res.data;

      return response;
    } catch (exception) {
      console.log(exception);
    }
  };

  wasteManagement = async () => {
    try {
      const res = await axios.post(
        `${this.baseURL}/api/servicegroup/servicelist/waste-management/`,
        {
          token: this.apiToken,
        },
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
    }
  };
  wasteManagementDetail = async ({ service, mobile_no, card_no }) => {
    try {
      const res = await axios.post(
        `${this.baseURL}/api/servicegroup/details/waste-management/`,
        {
          token: this.apiToken,
          reference: crypto.randomUUID(),
          mobile_no: mobile_no,
          service_slug: service,
          card_no: card_no,
        },
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
    }
  };
  wasteManagementCalculate = async ({
    service,
    session_id,
    month_from,
    month_to,
    year_from,
    year_to,
  }) => {
    try {
      console.log(service);
      const res = await axios.post(
        `${this.baseURL}/api/servicegroup/calculate/waste-management/`,
        {
          token: this.apiToken,
          session_id: session_id,
          month_from: month_from,
          month_to: month_to,
          year_from: year_from,
          year_to: year_to,
        },
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
    }
  };

  wasteManagementPayment = async ({
    service,
    session,
    amount,
    idempotencyKey,
  }) => {
    try {
      const res = await axios.post(
        `${this.baseURL}/api/servicegroup/commit/waste-management/`,
        {
          token: this.apiToken,
          reference: idempotencyKey,
          session_id: session,
          service_slug: service,
          amount: amount,
        },
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
    }
  };

  landline = async ({ amount, number, idempotencyKey }) => {
    try {
      const res = await axios.post(`${this.baseURL}/api/use/landline/`, {
        token: this.apiToken,
        reference: idempotencyKey,
        amount: amount,
        number: number,
      });
      return res.data;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };
  socialSecurityDetail = async ({ submision_number, employee_id }) => {
    try {
      const res = await axios.post(
        `${this.baseURL}/api/servicegroup/details/social-security-fund/`,
        {
          token: this.apiToken,
          reference: crypto.randomUUID(),
          submision_no: submision_number,
          emp_id: employee_id,
        },
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };
  socialSecurityPayment = async ({ amount, session_id }) => {
    try {
      const res = await axios.post(
        `${this.baseURL}/api/servicegroup/commit/social-security-fund/`,
        {
          token: this.apiToken,
          amount: amount,
          session_id: session_id,
        },
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };

  emiDetail = async ({ customer_code, serviceProvider, idempotencyKey }) => {
    try {
      let data = {};
      if (!serviceProvider) {
        throw new Error("serviceProvider is required");
      }
      if (serviceProvider === "synergy") {
        data = {
          token: this.apiToken,
          reference: crypto.randomUUID(),
          customer_code: customer_code,
          service_slug: "batas-hire-purchase",
        };
      } else if (serviceProvider === "code-himalayan-emi") {
        data = {
          token: this.apiToken,
          reference: crypto.randomUUID(),
          request_id: customer_code,
          service_slug: "hulas-fin-serve-ltd",
        };
      } else if (serviceProvider === "maw-emi") {
        data = {
          token: this.apiToken,
          reference: crypto.randomUUID(),
          client_code: customer_code,
          service_slug: "maw",
        };
      }
      const res = await axios.post(
        `${this.baseURL}/api/servicegroup/details/${serviceProvider}/`,
        data,
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };
  emiPayment = async ({
    serviceProvider,
    session_id,
    amount,
    vehicle,
    name,
  }) => {
    try {
      let data = {
        token: this.apiToken,
        amount: amount,
        session_id: session_id,
      };
      if (!serviceProvider) {
        throw new Error("serviceProvider is required");
      }
      if (serviceProvider === "maw-emi") {
        data = {
          ...data,
          vehicle: vehicle,
        };
      } else if (serviceProvider === "synergy") {
        data = {
          ...data,
          service_slug: "batas-hire-purchase",
          reference: idempotencyKey,
          deposited_by: name,
        };
      } else if (serviceProvider === "code-himalayan-emi") {
        data = {
          ...data,
          reference: idempotencyKey,
        };
      }
      const res = await axios.post(
        `${this.baseURL}/api/servicegroup/commit/${serviceProvider}/`,
        data,
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };

  communityElectricityDetail = async (data) => {
    try {
      const { service } = data;
      let route;
      let payload = {
        customer_number: data.customer_number,
        token: this.apiToken,
        reference: crypto.randomUUID(),
      };
      if (service === "himchuli") {
        route = "easternhawk";
        payload = {
          ...payload,
          service_slug: "himchuli",
        };
      } else if (service === "watermark") {
        route = "watermark-electricity";
        payload = {
          ...payload,
          service_slug: "watermark-electricity",
        };
      }
      const res = await axios.post(
        `${this.baseURL}/api/servicegroup/details/${route}/`,
        payload,
      );
      return res.data;
    } catch (exception) {
      throw exception;
      console.log(exception);
    }
  };

  flightSector = async () => {
    try {
      const res = await axios.post(
        `${this.baseURL}/api/servicegroup/sectors/flight/`,
        {
          token: this.apiToken,
        },
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
    }
  };
  searchFlight = async ({
    flight_type,
    trip_type,
    flight_date,
    return_date,
    to,
    from,
    nationality,
    child,
    adult,
  }) => {
    try {
      let data = {
        token: this.apiToken,
        flight_type: flight_type,
        trip_type: trip_type,
        flight_date: flight_date,
        adult: adult,
        child: child,
        from: from,
        to: to,
        reference: crypto.randomUUID(),
        nationality: nationality,
      };
      if (data.trip_type === "R") {
        data = {
          ...data,
          return_date: return_date,
        };
      }
      const res = await axios.get(
        `${this.baseURL}/api/servicegroup/search/flight/`,
        {
          params: data,
        },
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
    }
  };
  govPayment = async ({ session, amount, idempotencyKey }) => {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/servicegroup/commit/govpayment/`,
        {
          token: this.apiToken,
          session_id: session,
          amount: amount,
          reference: idempotencyKey,
        },
      );
      return response.data;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };

  govVoucher = async ({
    voucher,
    amount,
    service,
    province_code,
    district_code,
    fiscal_year,
  }) => {
    try {
      let data = {
        token: this.apiToken,
        reference: crypto.randomUUID(),
        app_id: process.env.KHALTI_APP_ID,
        voucher_no: voucher,
        amount: amount,
      };
      console.log(data);
      if (service === "echalan") {
        data = {
          ...data,
          service,
          province_code,
          district_code,
          fiscal_year,
        };
      }
      const response = await axios.post(
        `${this.baseURL}/api/servicegroup/details/govpayment/`,
        data,
      );
      return response.data;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };
  meroshareCounters = async () => {
    try {
      const res = await axios.post(
        `${this.baseURL}/api/servicegroup/info/cdsc/`,
        {
          token: this.apiToken,
          reference: crypto.randomUUID(),
        },
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
    }
  };
  meroshareDetails = async ({ payment_type, service, boid }) => {
    try {
      const res = await axios.post(
        `${this.baseURL}/api/servicegroup/details/cdsc/`,
        {
          token: this.apiToken,
          reference: crypto.randomUUID(),
          client_code: boid,
          payment_type: "Both",
          service_slug: service,
        },
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
    }
  };
  merosharePayment = async ({
    meroshare_renew_year,
    demat_renew_year,
    amount,
    session,
  }) => {
    try {
      const res = await axios.post(
        `${this.baseURL}/api/servicegroup/commit/cdsc/`,
        {
          token: this.apiToken,
          session_id: session,
          meroshare_renew_year: meroshare_renew_year,
          demat_renew_year: demat_renew_year,
          amount: amount,
        },
      );
      return res.data;
    } catch (exception) {
      console.log(exception);
    }
  };
}

const khaltiSvc = new KhaltiService();
module.exports = khaltiSvc;
