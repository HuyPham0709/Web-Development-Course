const express = require("express");
const puppeteer = require("puppeteer");

const router = express.Router();

router.post("/export-pdf", async (req, res) => {
  try {
    const data = req.body;

    const html = `
      <html>
        <body>
          <h1>${data.personal.full_name}</h1>
          <p>${data.personal.email}</p>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="CV.pdf"',
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;