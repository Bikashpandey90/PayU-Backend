const { default: axios } = require("axios");
const QRCode = require("qrcode");
const { createCanvas, loadImage } = require("canvas");

class QrService {
  createQr = async (user) => {
    try {
      const paymentLink = `${process.env.FRONETEND_BASE_URL}/send?user=${user._id}`;
      const response = await axios.post(
        process.env.ME_QR_SERVICE_URL,
        {
          qrFieldsData: {
            link: paymentLink,
          },
          title: `${user.name}-QR`,
          format: "png",
          designType: "base",
          qrOptions: {
            size: 300,
            pattern: "rounded",
            patternColor: "#BBCBD3",
            patternBackground: "#ffffff",
            cornetsOuter: "extra-rounded",
            cornetsOuterColor: "#89A3B2",
            cornetsInterior: "dot",
            cornetsInteriorColor: "#89A3B2",
            errorCorrectionLevel: "H",
          },
          qrFrame: {
            name: "noFrame",
          },
        },
        {
          headers: {
            "X-AUTH-TOKEN": process.env.ME_QR_API_KEY,
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer",
        },
      );

      const base64Image = Buffer.from(response.data, "binary").toString(
        "base64",
      );
      return `data:image/png;base64,${base64Image}`;
    } catch (exception) {
      console.log(
        "QR ERROR:",
        exception.response?.data?.toString() || exception,
      );

      console.log(exception);
      return null;
    }
  };
  // createSelfQr = async (user) => {
  //   try {
  //     const paymentLink = `${process.env.FRONETEND_BASE_URL}/send?user=${user._id}`;

  //     const qrCode = new QRCodeStyling({
  //       width: 300,
  //       height: 300,
  //       data: paymentLink,

  //       image: "",

  //       dotsOptions: {
  //         color: "#BBCBD3",
  //         type: "rounded",
  //       },

  //       backgroundOptions: {
  //         color: "#ffffff",
  //       },

  //       cornersSquareOptions: {
  //         type: "extra-rounded",
  //         color: "#89A3B2",
  //       },

  //       cornersDotOptions: {
  //         type: "dot",
  //         color: "#89A3B2",
  //       },

  //       qrOptions: {
  //         errorCorrectionLevel: "H",
  //       },
  //     });

  //     const buffer = await qrCode.getRawData("png");

  //     const base64Image = buffer.toString("base64");
  //     return `data:image/png;base64,${base64Image}`;
  //   } catch (err) {
  //     console.error("QR ERROR:", err);
  //     return null;
  //   }
  // };
  
  
  createSelfQr = async (user) => {
    try {
      const paymentLink = `${process.env.FRONETEND_BASE_URL}/send?user=${user._id}`;

      const canvas = createCanvas(300, 300);
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 300, 300);

      const qrDataUrl = await QRCode.toDataURL(paymentLink, {
        errorCorrectionLevel: "H",
        margin: 1,
        color: {
          dark: "#89A3B2",
          light: "#ffffff",
        },
        width: 260,
      });

      const qrImage = await loadImage(qrDataUrl);

      // center QR
      ctx.drawImage(qrImage, 20, 20, 260, 260);

      const buffer = canvas.toBuffer("image/png");

      return `data:image/png;base64,${buffer.toString("base64")}`;
    } catch (err) {
      console.error("QR ERROR:", err);
      return null;
    }
  };
}

const qrSvc = new QrService();
module.exports = qrSvc;
