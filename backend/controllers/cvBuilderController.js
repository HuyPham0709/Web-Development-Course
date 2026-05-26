const express = require("express");

const router = express.Router();

const html_to_pdf = require("html-pdf-node");

router.post("/export-pdf", async (req, res) => {

  try {

    const {
      personal,
      experience,
      education,
      skills,
      languages,
      certs,
      hobbies,
    } = req.body;

    const html = `
      <html>
        <body style="font-family: Arial; padding: 40px;">

          <h1>${personal.full_name || ""}</h1>

          <p>${personal.headline || ""}</p>

          <hr/>

          <h2>Thông tin</h2>

          <p>Email: ${personal.email || ""}</p>

          <p>Phone: ${personal.phone || ""}</p>

          <p>Address: ${personal.address || ""}</p>

          <hr/>

          <h2>Kỹ năng</h2>

          <p>${skills || ""}</p>

          <hr/>

          <h2>Kinh nghiệm</h2>

          ${experience.map(exp => `
            <div style="margin-bottom:20px;">
              <h3>${exp.role || ""}</h3>
              <p>${exp.company || ""}</p>
              <p>${exp.desc || ""}</p>
            </div>
          `).join("")}

          <hr/>

          <h2>Học vấn</h2>

          ${education.map(edu => `
            <div style="margin-bottom:20px;">
              <h3>${edu.school || ""}</h3>
              <p>${edu.major || ""}</p>
            </div>
          `).join("")}

          <hr/>

          <h2>Ngôn ngữ</h2>

          ${languages.map(lang => `
            <p>${lang.language} - ${lang.level}</p>
          `).join("")}

          <hr/>

          <h2>Chứng chỉ</h2>

          <p>${certs || ""}</p>

          <hr/>

          <h2>Sở thích</h2>

          <p>${hobbies || ""}</p>

        </body>
      </html>
    `;

    const file = {
      content: html,
    };

    const pdfBuffer =
      await html_to_pdf.generatePdf(
        file,
        {
          format: "A4",
        }
      );

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=CV.pdf"
    );

    res.send(pdfBuffer);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

});

module.exports = router;