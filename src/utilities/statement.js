const crypto = require("crypto");
const getBrowser = require("../services/browser.service");

const generateStatement = async (user, transactions, period = {}) => {
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
      .createHmac("sha256", process.env.STATEMENT_SECRET || "secret")
      .update(user._id + Date.now())
      .digest("hex");

    let openingBalance = 0;
    let totalInflow = 0;
    let totalOutflow = 0;
    transactions.forEach((txn) => {
      if (txn.from?.user?._id === user._id) {
        totalOutflow += txn.amount;
      } else {
        totalInflow += txn.amount;
      }
    });
    const closingBalance = openingBalance + totalInflow - totalOutflow;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <style>
    :root {
      --primary: #3F95EC;
      --primary-container: #2e5bff;
      --secondary: #565e74;
      --tertiary: #006242;
      --error: #ba1a1a;

      --surface: #f7f9fb;
      --surface-container: #eceef0;
      --surface-container-low: #f2f4f6;
      --surface-container-lowest: #ffffff;

      --on-surface: #191c1e;
      --on-surface-variant: #434656;

      --outline: #747688;
      --outline-variant: #c4c5d9;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: Arial, sans-serif;
    }

    body {
      background: var(--surface-container);
      color: var(--on-surface);
      padding: 16px;
    }

    .container {
      max-width: 900px;
      margin: auto;
      background: var(--surface-container-lowest);
      min-height: 297mm;
      padding: 48px;
      display: flex;
      flex-direction: column;
      gap: 48px;
      box-shadow: 0 10px 15px rgba(0,0,0,0.1);
    }

    /* HEADER */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .logo {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 28px;
      font-weight: 700;
      color: var(--primary);
    }

    .subtitle {
      font-size: 10px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--outline);
      font-weight: 700;
    }

    .right {
      text-align: right;
    }

    .right h1 {
      font-size: 28px;
      font-weight: 300;
    }

    .right p {
      font-size: 14px;
      color: var(--on-surface-variant);
      margin-top: 4px;
    }

    /* USER INFO */
    .user-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      padding: 32px 0;
      border-top: 1px solid var(--outline-variant);
      border-bottom: 1px solid var(--outline-variant);
    }

    .block span {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--outline);
      display: block;
      margin-bottom: 6px;
    }

    .block p {
      font-size: 16px;
    }

    .right-info {
      text-align: right;
    }

    /* SUMMARY */
    .summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2px;
      background: var(--outline-variant);
      border-radius: 12px;
      overflow: hidden;
    }

    .card {
      background: var(--surface-container-lowest);
      padding: 20px;
    }

    .card span {
      font-size: 10px;
      text-transform: uppercase;
      color: var(--outline);
      font-weight: 700;
    }

    .card p {
      font-size: 18px;
      font-weight: 700;
      margin-top: 6px;
    }

    .primary { color: var(--primary); }
    .error { color: var(--error); }
    .tertiary { color: var(--tertiary); }

    /* TABLE */
    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead th {
      font-size: 10px;
      text-transform: uppercase;
      text-align: left;
      padding: 16px 0;
      border-bottom: 1px solid var(--outline-variant);
      color: var(--outline);
    }

    tbody td {
      padding: 14px 0;
      border-bottom: 1px solid rgba(196,197,217,0.2);
      font-size: 14px;
    }

    .right-text {
      text-align: right;
      font-weight: bold;
    }

    .negative { color: var(--error); }
    .positive { color: var(--tertiary); }

    /* FOOTER */
    .footer {
      margin-top: auto;
      border-top: 1px solid var(--outline-variant);
      padding-top: 24px;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: var(--outline);
    }
  </style>
</head>

<body>

<div class="container">

  <!-- HEADER -->
  <div class="header">

    <div class="logo">

      <div class="brand">
        <svg width="40" viewBox="0 0 50 39" fill="#3F95EC" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z"/>
          <path d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z"/>
        </svg>
        <span>Payu</span>
      </div>

      <div class="subtitle">
        Financial Services Inc.
      </div>

    </div>

    <div class="right">
      <h1>Account Statement</h1>
      <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>

  </div>

  <!-- USER INFO -->
  <div class="user-info">

    <div class="block">
      <span>Account Holder</span>
      <p>${user.name}</p>
      <p>${user.email || "N/A"}</p>
    </div>

    <div class="block right-info">
      <span>Account Number</span>
      <p>#PU-${user._id}</p>
    </div>

    <div class="block">
      <span>Statement Period</span>
      <p>${period.start || "N/A"} – ${period.end || "N/A"}</p>
    </div>

    <div class="block right-info">
      <span>Currency</span>
      <p>Nepalese Rupee (NPR)</p>
    </div>

  </div>

  <!-- SUMMARY -->
  <div class="summary">

    <div class="card">
      <span>Opening Balance</span>
      <p>Rs ${openingBalance.toFixed(2)}</p>
    </div>

    <div class="card">
      <span>Total Inflow</span>
      <p class="tertiary">+Rs ${totalInflow.toFixed(2)}</p>
    </div>

    <div class="card">
      <span>Total Outflow</span>
      <p class="error">-Rs ${totalOutflow.toFixed(2)}</p>
    </div>

    <div class="card">
      <span>Closing Balance</span>
      <p class="primary">Rs ${closingBalance.toFixed(2)}</p>
    </div>

  </div>

  <!-- TRANSACTIONS -->
  <div>

    <table>

      <thead>
        <tr>
          <th>Date</th>
          <th>Counter Party</th>
          <th>Reference ID</th>
          <th class="right-text">Amount</th>
        </tr>
      </thead>

      <tbody>
        ${transactions
          .map(
            (txn) => `
          <tr>
            <td>${new Date(txn.createdAt).toLocaleDateString()}</td>

            <td>
              ${
                txn.from?.user?._id === user._id
                  ? txn.to?.user?.name || "Unknown"
                  : txn.from?.user?.name || "Unknown"
              }
              <div style="font-size:11px;color:var(--on-surface-variant);">
                ${txn.from?.user?._id === user._id ? "Sent" : "Received"}
              </div>
            </td>

            <td style="font-family:monospace;font-size:12px;">
              ${txn._id}
            </td>

            <td class="right-text ${txn.from?.user?._id === user._id ? "negative" : "tertiary"}">
              ${txn.from?.user?._id === user._id ? "-" : "+"}Rs ${txn.amount.toFixed(2)}
            </td>

          </tr>
        `,
          )
          .join("")}
      </tbody>

    </table>

  </div>

  <!-- FOOTER -->
  <div class="footer">
    <span>© 2026 PayU Financial Services Inc.</span>
    <span>STMT-ID: ${signature}</span>
  </div>

</div>

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
    console.error("Statement generation error:", error);
    throw new Error("Failed to generate statement");
  } finally {
    if (page) {
      await page.close();
    }
  }
};

module.exports = generateStatement;
