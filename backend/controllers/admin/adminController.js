const db = require('../../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Chạy nhiều câu truy vấn đếm cùng lúc (dùng Promise.all cho nhanh)
        const [
            [candidates],
            [companies],
            [pendingJobs],
            [activeReports],
            [categories],
            [trends] // Lấy dữ liệu danh sách rows của câu query trends
        ] = await Promise.all([
            db.query("SELECT COUNT(*) as total FROM Users WHERE role = 'candidate'"),
            db.query("SELECT COUNT(*) as total FROM Companies WHERE is_verified = 1"),
            db.query("SELECT COUNT(*) as total FROM Jobs WHERE status = 'pending'"),
            db.query("SELECT COUNT(*) as total FROM Reports WHERE status = 'pending'"),
            // Đếm số lượng tin tuyển dụng theo từng danh mục để vẽ Pie Chart
            db.query(`
                SELECT cat.name, COUNT(j.id) as value 
                FROM Categories cat 
                LEFT JOIN Jobs j ON cat.id = j.category_id 
                GROUP BY cat.id
                HAVING value > 0
            `),
            // Câu truy vấn mới: Lấy số lượng Job theo từng thứ trong tuần của 7 ngày gần đây
            db.query(`
                SELECT WEEKDAY(created_at) as dayIndex, COUNT(*) as count
                FROM Jobs
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
                GROUP BY WEEKDAY(created_at)
            `)
        ]);

        // Mảng định danh thứ tự để mapping (WEEKDAY trả về: 0 = Mon, 1 = Tue,..., 6 = Sun)
        const daysMap = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const trendsData = daysMap.map((dayName, index) => {
            const found = trends.find(t => t.dayIndex === index);
            return {
                name: dayName,
                postings: found ? found.count : 0
            };
        });

        // 2. Mảng màu cho Pie Chart (sẽ gán tự động xoay vòng nếu có nhiều category)
        const colors = ["#4F46E5", "#0F172A", "#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalCandidates: candidates[0].total,
                    verifiedCompanies: companies[0].total,
                    pendingJobs: pendingJobs[0].total,
                    activeReports: activeReports[0].total,
                },
                categoryData: categories.map((c, index) => ({
                    name: c.name,
                    value: c.value,
                    color: colors[index % colors.length]
                })),
                trendsData: trendsData // Trả mảng trends thật về cho frontend
            }
        });
    } catch (error) {
        console.error("Lỗi getDashboardStats:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi lấy dữ liệu Dashboard" });
    }
};