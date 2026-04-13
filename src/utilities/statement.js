const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const generateStatement = async (user, transactions, period = {}) => {
  try {
    const dir = path.join(__dirname, "../../public/statements");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();

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
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          primary: "#3F95EC",
          "primary-container": "#2e5bff",
          secondary: "#565e74",
          tertiary: "#006242",
          error: "#ba1a1a",

          surface: "#f7f9fb",
          "surface-container": "#eceef0",
          "surface-container-low": "#f2f4f6",
          "surface-container-lowest": "#ffffff",

          "on-surface": "#191c1e",
          "on-surface-variant": "#434656",

          outline: "#747688",
          "outline-variant": "#c4c5d9",
        }
      }
    }
  }
</script>
        <style>
          @media print {
            body { background: white; }
          }
        </style>
      </head>
      <body class="bg-surface-container font-body text-on-surface antialiased p-4">
        <main class="max-w-4xl mx-auto bg-surface-container-lowest shadow-sm min-h-[297mm] p-12 flex flex-col gap-12">
          <!-- Header -->
          <header class="flex justify-between items-start">
            <div class="flex flex-col gap-2">
              <div class="text-3xl flex text-primary">  <svg
   width="40"
                                height="auto"
                                viewBox="0 0 50 39"
                                fill="#3F95EC"
                                xmlns="http://www.w3.org/2000/svg"
                                
                            >
                                <path
                                    d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z"
                                    stopColor="#000000"
                                ></path>
                                <path
                                    d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z"
                                    stopColor="#000000"
                                ></path>
                            </svg>
                            <span>Payu</span></h1></div>
              <div class="text-[10px] tracking-[0.2em] uppercase text-outline font-bold">Financial Services Inc.</div>
            </div>
            <div class="text-right">
              <h1 class="text-3xl font-light tracking-tight text-on-surface">Account Statement</h1>
              <p class="text-label-sm text-on-surface-variant font-medium mt-1">Generated on ${new Date().toLocaleDateString()}</p>
            </div>
          </header>

          <!-- User Info -->
          <section class="grid grid-cols-2 gap-8 py-8 border-y border-outline-variant/20">
            <div class="flex flex-col gap-4">
              <div>
                <span class="text-[10px] uppercase font-bold tracking-wider text-outline block mb-1">Account Holder</span>
                <p class="text-lg font-semibold text-on-surface">${user.name}</p>
                <p class="text-sm text-on-surface-variant">${user.email || "N/A"}</p>
              </div>
              <div>
                <span class="text-[10px] uppercase font-bold tracking-wider text-outline block mb-1">Account Number</span>
                <p class="text-sm font-mono tracking-tight">#PU-${user._id || "VP-XXXX-XXXX-XXXX"}</p>
              </div>
            </div>
            <div class="flex flex-col gap-4 text-right">
              <div>
                <span class="text-[10px] uppercase font-bold tracking-wider text-outline block mb-1">Statement Period</span>
                <p class="text-sm font-semibold">${period.start || "N/A"} – ${period.end || "N/A"}</p>
              </div>
              <div>
                <span class="text-[10px] uppercase font-bold tracking-wider text-outline block mb-1">Currency</span>
                <p class="text-sm font-semibold">Nepalese Rupee (NPR)</p>
              </div>
            </div>
          </section>

          <!-- Summary -->
          <section class="grid grid-cols-4 gap-0.5 bg-outline-variant/10 rounded-xl overflow-hidden">
            <div class="bg-surface-container-lowest p-6 flex flex-col gap-1">
              <span class="text-[10px] uppercase font-bold text-outline">Opening Balance</span>
              <span class="text-xl font-bold text-on-surface">Rs ${openingBalance.toFixed(2)}</span>
            </div>
            <div class="bg-surface-container-lowest p-6 flex flex-col gap-1">
              <span class="text-[10px] uppercase font-bold text-outline">Total Inflow</span>
              <span class="text-xl font-bold text-tertiary">+Rs ${totalInflow.toFixed(2)}</span>
            </div>
            <div class="bg-surface-container-lowest p-6 flex flex-col gap-1">
              <span class="text-[10px] uppercase font-bold text-outline">Total Outflow</span>
              <span class="text-xl font-bold text-error">-Rs ${totalOutflow.toFixed(2)}</span>
            </div>
            <div class="bg-surface-container-low p-6 flex flex-col gap-1">
              <span class="text-[10px] uppercase font-bold text-primary">Closing Balance</span>
              <span class="text-xl font-extrabold text-on-surface">Rs ${closingBalance.toFixed(2)}</span>
            </div>
          </section>

          <!-- Transactions -->
          <section class="flex-grow">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-sm font-bold uppercase tracking-widest text-on-surface">Transaction History</h2>
              <div class="h-px flex-grow mx-4 bg-outline-variant/20"></div>
            </div>
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="text-[10px] uppercase tracking-widest text-outline border-b border-outline-variant">
                  <th class="py-4 font-bold">Date</th>
                  <th class="py-4 font-bold">Counter Party</th>
                  <th class="py-4 font-bold">Reference ID</th>
                  <th class="py-4 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody class="text-sm">
                ${transactions
                  .map(
                    (txn) => `
                    <tr class="border-b border-outline-variant/10">
                      <td class="py-4 font-medium">${new Date(txn.createdAt).toLocaleDateString()}</td>
                      <td class="py-4">
                        <div class="font-semibold text-on-surface"> ${
                          txn.from?.user?._id === user._id
                            ? txn.to?.user?.name || "Unknown"
                            : txn.from?.user?.name || "Unknown"
                        }</div>
                        <div class="text-[11px] text-on-surface-variant"> ${
                          txn.from?.user?._id === user._id ? "Sent" : "Received"
                        }</div>
                      </td>
                      <td class="py-4 font-mono text-xs text-outline">${txn._id}</td>
                      <td class="py-4 text-right font-bold ${txn.from?.user?._id === user._id ? "text-error" : "text-tertiary"}">
                        ${txn.from?.user?._id === user._id ? "-" : "+"}Rs ${txn.amount.toFixed(2)}
                      </td>
                    </tr>
                  `,
                  )
                  .join("")}
              </tbody>
            </table>
          </section>

          <!-- Footer -->
          <footer class="mt-auto pt-8 border-t border-outline-variant/20 flex flex-col gap-6">
            <div class="flex justify-between text-[9px] text-outline font-medium tracking-wide">
              <span>© 2026 PayU Financial Services Inc. All rights reserved.</span>
              <span>STMT-ID: ${signature}</span>
            </div>
          </footer>
        </main>
      </body>
      </html>
    `;

    await page.setContent(html, { waitUntil: "networkidle0" });

    const filePath = path.join(dir, `${user._id}_${Date.now()}.pdf`);
    await page.pdf({ path: filePath, format: "A4", printBackground: true });

    await browser.close();

    return { path: filePath, url: `/statements/${path.basename(filePath)}` };
  } catch (error) {
    console.error("Statement generation error:", error);
    throw new Error("Failed to generate statement");
  }
};

module.exports = generateStatement;
