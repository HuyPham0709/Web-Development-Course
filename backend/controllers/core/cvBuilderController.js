// backend/routes/core/cvBuilderRoutes.js

const express = require("express");
const router = express.Router();
const html_to_pdf = require("html-pdf-node");

// Import Cloudinary helper
const { uploadToCloudinary } = require("../../config/cloudinary"); 

/**
 * @route   POST /api/cv/export-pdf
 * @desc    Generate CV from HTML data, upload directly to Cloudinary as public, and return URL
 */
router.post("/export-pdf", async (req, res) => {
  try {
    const {
      personal,
      experience = [],
      education = [],
      skills,
      languages = [],
      certs,
      hobbies,
    } = req.body;

    // Prevent server crash if personal object is missing fields
    const safePersonal = personal || {};

    // 1. Generate English HTML Template (With UTF-8 Meta support)
    const html = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>CV - ${safePersonal.full_name || "Candidate"}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; line-height: 1.5; }
            h1 { margin-bottom: 5px; color: #111; font-size: 28px; }
            h2 { color: #0056b3; margin-top: 25px; border-bottom: 2px solid #0056b3; padding-bottom: 5px; font-size: 18px; text-transform: uppercase; letter-spacing: 0.5px; }
            h3 { margin-bottom: 5px; margin-top: 10px; font-size: 16px; color: #222; }
            p { margin: 6px 0; font-size: 14px; }
            hr { border: 0; border-top: 1px solid #eee; margin: 20px 0; }
            .meta-info { color: #555; font-size: 15px; font-style: italic; margin-bottom: 15px; }
            .section-item { margin-bottom: 15px; }
            .bullet-list { margin: 5px 0; padding-left: 15px; }
          </style>
        </head>
        <body>

          <h1>${safePersonal.full_name || "Untitled Profile"}</h1>
          <p class="meta-info">${safePersonal.headline || ""}</p>

          <h2>Personal Information</h2>
          <p><strong>Email:</strong> ${safePersonal.email || "Not specified"}</p>
          <p><strong>Phone:</strong> ${safePersonal.phone || "Not specified"}</p>
          <p><strong>Address:</strong> ${safePersonal.address || "Not specified"}</p>

          <h2>Professional Skills</h2>
          <p>${skills || "No skills listed yet."}</p>

          <h2>Work Experience</h2>
          ${experience.length > 0 
            ? experience.map(exp => `
                <div class="section-item">
                  <h3>${exp.role || "Position"}</h3>
                  <p><strong>${exp.company || "Company Name"}</strong></p>
                  <p>${exp.desc || ""}</p>
                </div>
              `).join("")
            : "<p>No work experience listed yet.</p>"
          }

          <h2>Education</h2>
          ${education.length > 0 
            ? education.map(edu => `
                <div class="section-item">
                  <h3>${edu.school || "Institution / School"}</h3>
                  <p><strong>Major:</strong> ${edu.major || "Not specified"}</p>
                </div>
              `).join("")
            : "<p>No education history listed yet.</p>"
          }

          <h2>Languages</h2>
          ${languages.length > 0 
            ? languages.map(lang => `
                <p class="bullet-list">• <strong>${lang.language || ""}</strong>: ${lang.level || ""}</p>
              `).join("")
            : "<p>No languages listed yet.</p>"
          }

          <h2>Certifications</h2>
          <p>${certs || "No certifications listed yet."}</p>

          <h2>Interests & Hobbies</h2>
          <p>${hobbies || "No interests listed yet."}</p>

        </body>
      </html>
    `;

    const file = { content: html };

    // 2. Generate PDF Buffer from HTML content
    const pdfBuffer = await html_to_pdf.generatePdf(file, {
      format: "A4",
      margin: { top: "25px", bottom: "25px", left: "25px", right: "25px" }
    });

    // 3. Upload PDF Buffer to Cloudinary with isPdf = true parameter
    const fileName = `${safePersonal.full_name || "candidate"}_cv.pdf`;
    const cloudinaryResult = await uploadToCloudinary(pdfBuffer, "job_finder/cvs", fileName);
    // 4. Return the clean, public Cloudinary link to Frontend
    return res.status(200).json({
      success: true,
      message: "CV generated and uploaded successfully!",
      cv_url: cloudinaryResult.secure_url, 
    });

  } catch (err) {
    console.error("Error generating/uploading English CV:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error during CV export: " + err.message,
    });
  }
});

module.exports = router;