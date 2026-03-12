/**
 * Middleware xử lý lỗi 404 (Khi người dùng truy cập Route không tồn tại)
 */
const notFound = (req, res, next) => {
  const error = new Error(`Không tìm thấy đường dẫn - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Middleware xử lý lỗi tập trung (Hứng mọi lỗi từ Controller đổ về)
 */
const errorHandler = (err, req, res, next) => {
  // Nếu status code là 200 nhưng vẫn có lỗi, ép về 500 (Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message,
    // Chỉ hiện stack trace (chi tiết lỗi) khi đang ở môi trường phát triển (Dev)
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
