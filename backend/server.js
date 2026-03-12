require("dotenv").config(); // 1. Load biến môi trường ngay đầu tiên
const express = require("express");
const dotenv = require("dotenv");
const result = dotenv.config();
const cors = require("cors");
const morgan = require("morgan"); // Middleware để log request
const connectDB = require("./config/db");
const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const authRoutes = require("./routes/authRoutes");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const posRoutes = require("./routes/posRoutes");
const serviceRoutes = require("./routes/serviceRoutes");


if (result.error) {
  console.log("❌ Không tìm thấy file .env!");
} else {
  console.log("✅ Nội dung file .env đọc được:", result.parsed);
}


const app = express();

// 2. Kết nối Database
connectDB();

// 3. Middleware hệ thống
app.use(cors());
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// 4. Logging khi ở môi trường phát triển (Development)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// 5. Định nghĩa Routes
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pos", posRoutes);
app.use("/api/services", serviceRoutes);

// Route kiểm tra sức khỏe server (Health Check)
app.get("/", (req, res) => {
  res.send("API Hotel is running...");
});

// 6. Middleware xử lý lỗi (Phải đặt SAU các Routes)
app.use(notFound); // Xử lý lỗi 404 (Route không tồn tại)
app.use(errorHandler); // Xử lý lỗi tập trung

const PORT = process.env.PORT || 5000;

// 7. Khởi chạy server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// 8. Xử lý lỗi Unhandled Rejection (Ví dụ: lỗi DB mà không có catch)
process.on("unhandledRejection", (err) => {
  console.error(`❌ Error: ${err.message}`);
  // Đóng server và thoát tiến trình
  server.close(() => process.exit(1));
});
