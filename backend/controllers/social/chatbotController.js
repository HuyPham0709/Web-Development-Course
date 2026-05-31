// backend/controllers/chatbotController.js

const db = require('../../config/db');
const Message = require('../../models/Message');
// ======================================================================
// [POST] Chatbot nội bộ thông minh - Phiên bản Hiện đại & Gọn gàng
// ======================================================================
exports.chatWithBot = async (req, res, next) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ success: false, reply: "Xin chào! Bạn cần tôi trợ giúp gì không?" });
        }

        // 1. Chuẩn hóa tin nhắn (Xóa dấu câu, đưa về chữ thường)
        const cleanText = text.toLowerCase()
            .replace(/[.,?\/#!$%\^&\*;:{}=\-_`~()]/g, "")
            .trim();

        // 2. Nhận diện Ý định (Intents) dựa trên tập từ khóa mở rộng
        const addressKeywords = ["địa chỉ", "ở đâu", "vị trí", "trụ sở", "nơi ở", "dia chi", "o dau", "địa điểm"];
        const jobKeywords = ["việc làm", "công việc", "tuyển dụng", "job", "tuyển", "viec lam", "tuyen dung", "tìm việc"];
        const cvKeywords = ["tạo cv", "viết cv", "làm cv", "hồ sơ xin việc", "cv builder", "làm hồ sơ"];
        const historyKeywords = ["lịch sử", "đã nộp", "đã ứng tuyển", "trạng thái đơn", "lịch sử ứng tuyển"];
        const greetingKeywords = ["chào", "hello", "hi", "hey", "tư vấn", "giúp"];

        let intent = { address: 0, job: 0, cv: 0, history: 0, greeting: 0 };

        addressKeywords.forEach(kw => { if (cleanText.includes(kw)) intent.address++; });
        jobKeywords.forEach(kw => { if (cleanText.includes(kw)) intent.job++; });
        cvKeywords.forEach(kw => { if (cleanText.includes(kw)) intent.cv++; });
        historyKeywords.forEach(kw => { if (cleanText.includes(kw)) intent.history++; });
        greetingKeywords.forEach(kw => { if (cleanText.includes(kw)) intent.greeting++; });

        // 3. Quét Database lấy thông tin thực tế để đối chiếu (Động 100%)
        const [companies] = await db.query("SELECT id, name, address FROM Companies");
        let matchedCompany = companies.find(c => cleanText.includes(c.name.toLowerCase()));

        const [categories] = await db.query("SELECT id, name FROM Categories");
        let matchedCategory = categories.find(c => cleanText.includes(c.name.toLowerCase()));

        // Chuẩn bị sẵn một vài cái tên có thật trong DB để làm gợi ý cho User (Đã xóa bỏ dấu markdown)
        const sampleCompanies = companies.slice(0, 3).map(c => c.name).join(", ");
        const sampleCategories = categories.slice(0, 3).map(c => c.name).join(", ");

        let reply = "";

        // ==================================================================
        // KỊCH BẢN 1: Hỏi hướng dẫn chức năng hệ thống (Không chứa ký tự **)
        // ==================================================================
        if (intent.cv > 0) {
            return res.status(200).json({
                success: true,
                reply: "📝 Hướng dẫn tạo CV: Bạn chỉ cần nhấn vào mục 'CV Builder' trên thanh Menu phía trên màn hình. Tại đó, bạn có thể tự điền thông tin và tải xuống một bản CV chuyên nghiệp chuẩn ATS hoàn toàn miễn phí nhé!"
            });
        }

        if (intent.history > 0) {
            return res.status(200).json({
                success: true,
                reply: "📂 Hướng dẫn xem Lịch sử ứng tuyển: Bạn hãy bấm vào Ảnh đại diện của mình ở góc phải màn hình ➡️ chọn Dashboard ➡️ truy cập mục 'Lịch sử ứng tuyển' (My Applications). Tại đây bạn sẽ thấy toàn bộ danh sách các công việc mình đã nộp đơn và trạng thái phản hồi thực tế từ Nhà tuyển dụng."
            });
        }

        // ==================================================================
        // KỊCH BẢN 2: Người dùng hỏi chung chung nhưng THIẾU TÊN CỤ THỂ
        // ==================================================================
        
        // Hỏi địa chỉ nhưng không nói rõ công ty nào
        if (intent.address > 0 && !matchedCompany) {
            reply = `🔍 Tôi hiểu bạn đang cần tìm địa chỉ văn phòng, nhưng bạn chưa nhập tên công ty cụ thể.\n\n` +
                    `Bạn muốn tra cứu địa chỉ của doanh nghiệp nào trong số này: ${sampleCompanies || "các công ty trên hệ thống"}?\n\n` +
                    `👉 Mẹo nhỏ: Hãy nhập đầy đủ câu, ví dụ: Địa chỉ của công ty ${companies[0]?.name || 'FPT'}`;
            return res.status(200).json({ success: true, reply });
        }

        // Hỏi việc làm nhưng không nói rõ ngành nào hay công ty nào
        if (intent.job > 0 && !matchedCompany && !matchedCategory) {
            reply = `💼 Bạn đang cần tìm kiếm cơ hội việc làm đúng không? Để tôi hỗ trợ tốt nhất, bạn có thể hỏi theo 2 hướng:\n\n` +
                    `🏢 Theo doanh nghiệp: Nhập kèm tên công ty. Ví dụ: Tuyển dụng tại ${companies[0]?.name || 'FPT'}\n` +
                    `🎯 Theo ngành nghề: Nhập kèm tên lĩnh vực. Ví dụ: Tìm việc ngành ${categories[0]?.name || 'IT'}\n\n` +
                    `Hệ thống đang có sẵn rất nhiều vị trí thuộc các nhóm ngành: ${sampleCategories || "Công nghệ, Kinh doanh"}... Bạn đang quan tâm đến lĩnh vực nào thế?`;
            return res.status(200).json({ success: true, reply });
        }

        // ==================================================================
        // KỊCH BẢN 3: Có đầy đủ thông tin (Kết hợp dữ liệu DB thực tế)
        // ==================================================================
        
        // Có từ khóa Địa chỉ + Khớp tên Công ty
        if (intent.address > 0 && matchedCompany) {
            reply = `🏢 Trụ sở văn phòng của công ty ${matchedCompany.name} hiện đang đặt tại địa chỉ:\n📍 ${matchedCompany.address || "Hiện tại chưa cập nhật dữ liệu vị trí cụ thể."}`;
        } 
        // Có từ khóa Việc làm + Khớp tên Công ty
        else if (intent.job > 0 && matchedCompany) {
            const [jobs] = await db.query(
                "SELECT title FROM Jobs WHERE company_id = ? AND status = 'approved' LIMIT 5", 
                [matchedCompany.id]
            );

            if (jobs.length > 0) {
                const jobList = jobs.map((j, index) => `${index + 1}️⃣  ${j.title}`).join("\n");
                reply = `💼 Tin vui đây! Công ty ${matchedCompany.name} đang mở tuyển các vị trí hấp dẫn sau:\n\n${jobList}\n\n👉 Bạn hãy gõ tên công việc này lên thanh tìm kiếm ở trang chủ để nộp CV ứng tuyển ngay nhé!`;
            } else {
                reply = `Các vị trí tuyển dụng tại công ty ${matchedCompany.name} hiện đã đóng hoặc đang trong quá trình phê duyệt đơn. Bạn có thể quay lại kiểm tra sau nha!`;
            }
        } 
        // Có từ khóa Việc làm + Khớp danh mục Ngành nghề
        else if (intent.job > 0 && matchedCategory) {
            const [jobs] = await db.query(
                `SELECT j.title, c.name as company_name FROM Jobs j 
                 JOIN Companies c ON j.company_id = c.id 
                 WHERE j.category_id = ? AND j.status = 'approved' LIMIT 5`, 
                [matchedCategory.id]
            );
            
            if (jobs.length > 0) {
                const jobList = jobs.map((j, index) => `${index + 1}️⃣  ${j.title} tại ${j.company_name}`).join("\n");
                reply = `🔥 Đây là top 5 công việc thuộc ngành ${matchedCategory.name} mới nhất vừa được cập nhật trên hệ thống:\n\n${jobList}\n\nBạn có muốn tôi tìm kiếm thêm thông tin gì thuộc lĩnh vực này nữa không?`;
            } else {
                reply = `Hiện tại hệ thống chưa có tin tuyển dụng nào thuộc ngành ${matchedCategory.name} được mở. Bạn thử tìm kiếm một ngành nghề khác xem sao nhé.`;
            }
        }
        // Khớp tên công ty nhưng người dùng không nói rõ muốn hỏi địa chỉ hay việc làm
        else if (matchedCompany) {
            reply = `🤖 Tôi đã nhận diện được bạn đang quan tâm tới công ty ${matchedCompany.name}.\n\nBạn đang muốn tìm địa chỉ trụ sở hay muốn xem các vị trí việc làm của công ty này thế? Hãy nhắn cụ thể hơn một chút để tôi hỗ trợ nhé!`;
        } 
        
        // ==================================================================
        // KỊCH BẢN BẤT KHẢ KHÁNG: Câu chào mặc định hoặc không hiểu người dùng nói gì
        // ==================================================================
        else {
            reply = `👋 Xin chào! Tôi là Trợ lý ảo hỗ trợ tìm việc thông minh nội bộ.\n\n` +
                    `Bạn có thể chat tự nhiên với tôi để:\n` +
                    `1️⃣  Tra cứu vị trí: Địa chỉ công ty ${companies[0]?.name || 'FPT'} ở đâu vậy\n` +
                    `2️⃣  Tìm việc theo công ty: Bên ${companies[1]?.name || 'Viettel'} có job nào hot không\n` +
                    `3️⃣  Tìm việc theo ngành: Tôi muốn tìm việc làm ngành ${categories[0]?.name || 'IT'}\n` +
                    `4️⃣  Hỏi tính năng: Hướng dẫn mình cách tạo CV hoặc Xem đơn đã nộp ở đâu`;
        }

        return res.status(200).json({ success: true, reply });

    } catch (error) {
        console.error("Lỗi Chatbot Controller nâng cấp:", error);
        res.status(500).json({ success: false, reply: "Hệ thống chatbot đang gặp sự cố nhỏ, vui lòng thử lại sau ít phút." });
    }
};