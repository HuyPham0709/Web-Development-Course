const db = require('../../config/db');

exports.getEmployerJobs = async (req, res) => {
    try {
        const employerId = req.user.id; 
        const [jobs] = await db.execute(
            `SELECT id, title FROM Jobs 
             WHERE posted_by = ? AND status IN ('pending', 'approved')
             ORDER BY created_at DESC`,
            [employerId]
        );
        res.status(200).json({ success: true, data: jobs });
    } catch (error) {
        console.error("Lỗi lấy danh sách job:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

exports.sendInvitation = async (req, res) => {
    try {
        const { candidateId, jobId, message } = req.body;
        const employerId = req.user.id;

        if (!candidateId || !jobId || !message) {
            return res.status(400).json({ success: false, message: "Lack of information." });
        }

        const [existing] = await db.execute(
            `SELECT id FROM Job_Invitations WHERE employer_id = ? AND candidate_id = ? AND job_id = ?`,
            [employerId, candidateId, jobId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: "Invitation already sent." });
        }

        await db.execute(
            `INSERT INTO Job_Invitations (employer_id, candidate_id, job_id, message) VALUES (?, ?, ?, ?)`,
            [employerId, candidateId, jobId, message]
        );

        res.status(201).json({ success: true, message: "Invitation sent successfully!" });
    } catch (error) {
        console.error("Error sending invitation:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.getCandidateInvitations = async (req, res) => {
    try {
        const candidateId = req.user.id; 

        const [invitations] = await db.execute(
            `SELECT 
                ji.id, 
                ji.message, 
                ji.status, 
                ji.created_at,
                j.title AS job_title,
                j.id AS job_id,
                u.display_name AS employer_name,
                c.name AS company_name,
                c.logo_url AS company_logo
             FROM job_invitations ji
             JOIN Jobs j ON ji.job_id = j.id
             JOIN Users u ON ji.employer_id = u.id
             LEFT JOIN Companies c ON u.company_id = c.id
             WHERE ji.candidate_id = ?
             ORDER BY ji.created_at DESC`,
            [candidateId]
        );

        res.status(200).json({ 
            success: true, 
            data: invitations 
        });
    } catch (error) {
        console.error("Lỗi lấy lời mời ứng viên:", error.message);
        res.status(500).json({ success: false, message: "System error when sending invitations." });
    }
};