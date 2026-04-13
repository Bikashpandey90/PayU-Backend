const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const generateReceipt = async (transaction) => {
  try {
    const dir = path.join(__dirname, "../../public/receipts");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();

    const signature = crypto
      .createHmac("sha256", process.env.RECEIPT_SECRET || "secret")
      .update(transaction._id + transaction.amount)
      .digest("hex");


    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body { font-family: 'Arial', sans-serif; }
      </style>
    </head>

    <body class="bg-gray-100 flex justify-center py-10">

      <main class="bg-white w-[800px] shadow-xl rounded-xl overflow-hidden">

        <!-- Header -->
        <div class="p-10 flex justify-between border-b">
          <div>
             
            <h1 class="text-3xl flex gap-4 font-extrabold text-blue-600">
            <svg
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
                            <span>Payu</span></h1>
            <p class="text-xs text-gray-500 uppercase tracking-widest">
              Financial Services Ecosystem
            </p>
          </div>

          <div class="text-right">
            <h2 class="text-xl font-bold">Official Transaction Receipt</h2>
            <p class="text-sm text-gray-500">Secure Digital Record</p>
          </div>
        </div>

        <!-- Success Banner -->
        <div class="mx-10 mt-10 bg-green-100 rounded-xl p-6 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-green-600 text-white flex items-center justify-center rounded-full">
              ✓
            </div>
            <div>
              <h2 class="text-xl font-bold text-green-700">Transaction Successful</h2>
              <p class="text-sm text-gray-600">Funds transferred successfully</p>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-10 space-y-8">

          <!-- Details -->
          <div>
            <h3 class="text-xs uppercase tracking-widest font-bold text-gray-400 mb-4">
              Transaction Details
            </h3>

            <div class="space-y-4 text-sm">

              <div class="flex justify-between">
                <span class="text-gray-500">Receipt Number</span>
                <span class="font-bold">${transaction._id}</span>
              </div>

              <div class="flex justify-between bg-gray-50 px-4 py-3 rounded">
                <span class="text-gray-500">Date & Time</span>
                <span>${new Date(transaction.createdAt).toLocaleString()}</span>
              </div>

              <div class="flex justify-between">
                <span class="text-gray-500">Sender</span>
                <span class="font-semibold">${transaction.from?.user?.name}</span>
              </div>

              <div class="flex justify-between bg-gray-50 px-4 py-3 rounded">
                <span class="text-gray-500">Receiver</span>
                <span class="font-semibold">${transaction.to?.user?.name}</span>
              </div>

              

              <div class="flex justify-between bg-gray-50 px-4 py-3 rounded">
                <span class="text-gray-500">Status</span>
                <span class="text-green-600 font-bold">COMPLETED</span>
              </div>

              <!-- Amount -->
              <div class="flex justify-between items-end pt-6 border-t">
                <span class="text-lg font-bold">Total Amount</span>
                <span class="text-3xl font-extrabold text-blue-600">
                  Rs ${transaction.amount.toFixed(2)}
                </span>
              </div>

            </div>
          </div>

          <!-- Verification -->
          <div class="flex justify-between items-center pt-10 border-t">

            <div class="max-w-xs">
              <h4 class="font-bold mb-2">Verification</h4>
              <p class="text-xs text-gray-500">
                This is a digitally generated receipt. Use the verification code to confirm authenticity.
              </p>
              <p class="text-xs mt-2 font-mono">${signature}</p>
            </div>

            <!-- QR -->
            <div class="border p-4 rounded-lg">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${signature}" />
              <p class="text-[10px] text-center mt-2 text-gray-400 uppercase">
                Scan to verify
              </p>
            </div>

          </div>

        </div>

        <!-- Footer -->
        <div class="bg-gray-50 p-6 text-xs text-gray-500 flex justify-between">
          <span>© 2026 Payu Financial Services</span>
          <span>Secure • Encrypted • Verified</span>
        </div>

        <div class="h-2 bg-gradient-to-r from-blue-500 to-blue-700"></div>

      </main>

    </body>
    </html>
    `;

    await page.setContent(html, { waitUntil: "networkidle0" });

    const filePath = path.join(dir, `${transaction._id}.pdf`);
    await page.pdf({ path: filePath, format: "A4", printBackground: true });

    await browser.close();

    return { path: filePath, url: `/receipts/${transaction._id}.pdf` };
  } catch (error) {
    console.error("Receipt generation error:", error);
    throw error;
  }
};

module.exports = generateReceipt;
