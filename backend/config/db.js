const mongoose = require("mongoose");

/**
 * Kết nối tới cơ sở dữ liệu MongoDB với các cấu hình tối ưu.
 */
const connectDB = async () => {
  // 1. Sử dụng biến môi trường (Environment Variables) để bảo mật thông tin
  const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hotel";

  try {
    const conn = await mongoose.connect(MONGO_URI, {
      // Các tùy chọn này giúp kết nối ổn định hơn ở các phiên bản cũ
      // (Mongoose 6+ đã mặc định bật các tính năng này)
      autoIndex: true, 
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    
    // 2. Không nên dập tắt app ngay lập tức nếu đang ở môi trường dev
    // Hoặc có thể thêm cơ chế retry ở đây
    process.exit(1);
  }
};

// 3. Xử lý sự kiện khi kết nối bị ngắt đột ngột
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected! Chờ kết nối lại...");
});

module.exports = connectDB;
