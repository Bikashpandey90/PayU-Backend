const crypto = require("crypto");
const getBrowser = require("../services/browser.service");
const QRCode = require("qrcode");

const generateReceipt = async (transaction) => {
  let page;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();
    page.setDefaultNavigationTimeout(30000);
    await page.setViewport({
      width: 1200,
      height: 1600,
    });

    const signature = crypto
      .createHmac("sha256", process.env.RECEIPT_SECRET || "secret")
      .update(transaction._id + transaction.amount)
      .digest("hex");

    const qrCode = await QRCode.toDataURL(signature);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />

  <style>
    *{
      margin:0;
      padding:0;
      box-sizing:border-box;
    }

    body{
      font-family: Arial, sans-serif;
      background:#f3f4f6;
      display:flex;
      justify-content:center;
      padding:40px 0;
      color:#111827;
    }

    .receipt{
      width:800px;
      background:white;
      border-radius:16px;
      overflow:hidden;
      box-shadow:
        0 10px 15px -3px rgb(0 0 0 / 0.1),
        0 4px 6px -4px rgb(0 0 0 / 0.1);
    }

    .header{
      padding:40px;
      display:flex;
      justify-content:space-between;
      border-bottom:1px solid #e5e7eb;
    }

    .logo-title{
      display:flex;
      align-items:center;
      gap:16px;
      font-size:30px;
      font-weight:800;
      color:#2563eb;
    }

    .subtext{
      font-size:12px;
      color:#6b7280;
      text-transform:uppercase;
      letter-spacing:2px;
      margin-top:6px;
    }

    .right{
      text-align:right;
    }

    .right h2{
      font-size:24px;
      font-weight:700;
    }

    .right p{
      font-size:14px;
      color:#6b7280;
      margin-top:4px;
    }

    .success{
      margin:40px;
      margin-bottom:0;
      background:#dcfce7;
      border-radius:16px;
      padding:24px;
      display:flex;
      justify-content:space-between;
      align-items:center;
    }

    .success-left{
      display:flex;
      align-items:center;
      gap:16px;
    }

    .check{
      width:48px;
      height:48px;
      border-radius:999px;
      background:#16a34a;
      color:white;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:22px;
      font-weight:bold;
    }

    .success-title{
      font-size:22px;
      font-weight:700;
      color:#15803d;
    }

    .success-sub{
      font-size:14px;
      color:#4b5563;
      margin-top:4px;
    }

    .content{
      padding:40px;
    }

    .section-title{
      font-size:12px;
      text-transform:uppercase;
      letter-spacing:2px;
      font-weight:700;
      color:#9ca3af;
      margin-bottom:20px;
    }

    .details{
      display:flex;
      flex-direction:column;
      gap:16px;
      font-size:14px;
    }

    .row{
      display:flex;
      justify-content:space-between;
      align-items:center;
    }

    .row-box{
      display:flex;
      justify-content:space-between;
      align-items:center;
      background:#f9fafb;
      padding:14px 16px;
      border-radius:8px;
    }

    .label{
      color:#6b7280;
    }

    .bold{
      font-weight:700;
    }

    .semi{
      font-weight:600;
    }

    .green{
      color:#16a34a;
      font-weight:700;
    }

    .amount{
      margin-top:24px;
      padding-top:24px;
      border-top:1px solid #e5e7eb;
      display:flex;
      justify-content:space-between;
      align-items:flex-end;
    }

    .amount-label{
      font-size:20px;
      font-weight:700;
    }

    .amount-value{
      font-size:36px;
      font-weight:800;
      color:#2563eb;
    }

    .verify{
      margin-top:40px;
      padding-top:40px;
      border-top:1px solid #e5e7eb;
      display:flex;
      justify-content:space-between;
      align-items:center;
    }

    .verify-left{
      max-width:320px;
    }

    .verify-left h4{
      font-size:16px;
      font-weight:700;
      margin-bottom:8px;
    }

    .verify-left p{
      font-size:12px;
      color:#6b7280;
      line-height:1.5;
    }

    .signature{
      margin-top:10px;
      font-family:monospace;
      word-break:break-all;
    }

    .qr{
      border:1px solid #e5e7eb;
      padding:16px;
      border-radius:12px;
      text-align:center;
    }

    .qr img{
      width:120px;
      height:120px;
    }

    .qr p{
      margin-top:8px;
      font-size:10px;
      text-transform:uppercase;
      color:#9ca3af;
      letter-spacing:1px;
    }

    .footer{
      background:#f9fafb;
      padding:24px;
      font-size:12px;
      color:#6b7280;
      display:flex;
      justify-content:space-between;
    }

    .bottom-bar{
      height:8px;
      background:linear-gradient(to right,#3b82f6,#1d4ed8);
    }
  </style>
</head>

<body>

  <main class="receipt">

    <!-- Header -->
    <div class="header">

      <div>

        <div class="logo-title">

          <svg
            width="40"
            height="auto"
            viewBox="0 0 50 39"
            fill="#3F95EC"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z"
            ></path>

            <path
              d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z"
            ></path>
          </svg>

          <span>Payu</span>

        </div>

        <p class="subtext">
          Financial Services Ecosystem
        </p>

      </div>

      <div class="right">
        <h2>Official Transaction Receipt</h2>
        <p>Secure Digital Record</p>
      </div>

    </div>

    <!-- Success -->
    <div class="success">

      <div class="success-left">

        <div class="check">
          ✓
        </div>

        <div>
          <div class="success-title">
            Transaction Successful
          </div>

          <div class="success-sub">
            Funds transferred successfully
          </div>
        </div>

      </div>

    </div>

    <!-- Content -->
    <div class="content">

      <div class="section-title">
        Transaction Details
      </div>

      <div class="details">

        <div class="row">
          <span class="label">Receipt Number</span>
          <span class="bold">${transaction._id}</span>
        </div>

        <div class="row-box">
          <span class="label">Date & Time</span>
          <span>${new Date(transaction.createdAt).toLocaleString()}</span>
        </div>

        <div class="row">
          <span class="label">Sender</span>
          <span class="semi">${transaction.from?.user?.name}</span>
        </div>

        <div class="row-box">
          <span class="label">Receiver</span>
          <span class="semi">${transaction.to?.user?.name}</span>
        </div>

        <div class="row-box">
          <span class="label">Status</span>
          <span class="green">COMPLETED</span>
        </div>

        <!-- Amount -->
        <div class="amount">
          <span class="amount-label">Total Amount</span>

          <span class="amount-value">
            Rs ${transaction.amount.toFixed(2)}
          </span>
        </div>

      </div>

      <!-- Verification -->
      <div class="verify">

        <div class="verify-left">

          <h4>Verification</h4>

          <p>
            This is a digitally generated receipt.
            Use the verification code to confirm authenticity.
          </p>

          <p class="signature">
            ${signature}
          </p>

        </div>

        <div class="qr">

          <img src="${qrCode}" />

          <p>
            Scan to verify
          </p>

        </div>

      </div>

    </div>

    <!-- Footer -->
    <div class="footer">
      <span>© 2026 Payu Financial Services</span>
      <span>Secure • Encrypted • Verified</span>
    </div>

    <div class="bottom-bar"></div>

  </main>

</body>
</html>
`;
    await page.setContent(html, {
      waitUntil: "networkidle0",
    });
    await page.emulateMediaType("screen");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    return pdfBuffer;
  } catch (error) {
    console.error("Receipt generation error:", error);
    throw error;
  } finally {
    if (page) {
      await page.close();
    }
  }
};

module.exports = generateReceipt;
