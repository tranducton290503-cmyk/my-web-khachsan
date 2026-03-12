const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");


// 1. Kiểm tra xem người dùng đã đăng nhập chưa (Protect)
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Kiểm tra token trong Header (Bearer Token)
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      
      token = req.headers.authorization.split(" ")[1];

      // Giải mã token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);



      // Gán thông tin user vào request để các hàm sau sử dụng
      req.user = await User.findById(decoded.id);
      next();
         } catch (error) {
      res.status(401);
      throw new Error("Không có quyền truy cập, token không hợp lệ");
          }
  }

  if (!token) {
    res.status(401);
    throw new Error("Bạn chưa đăng nhập");
  }
});

// 2. Kiểm tra quyền hạn (Authorize)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Thêm log để nhìn tận mắt role là gì trong Terminal
    console.log("🔍 Role kiểm tra được:", req.user ? req.user.role : "Không thấy User");

    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Quyền ${req.user ? req.user.role : 'không xác định'} không có quyền này`
      });
    }
    next();
  };
};


