const { check, validationResult } = require("express-validator");

/**
 * Bộ quy tắc kiểm tra dữ liệu cho Phòng (Room)
 */
exports.validateRoom = [
  check("number")
    .notEmpty().withMessage("Số phòng không được để trống")
    .isString().withMessage("Số phòng phải là chuỗi"),
  
  check("type")
    .notEmpty().withMessage("Loại phòng không được để trống")
    .isIn(["Single", "Double", "Suite", "Deluxe"]).withMessage("Loại phòng không hợp lệ"),
  
  check("price")
    .notEmpty().withMessage("Giá phòng không được để trống")
    .isNumeric().withMessage("Giá phòng phải là một con số")
    .custom((value) => value >= 0).withMessage("Giá phòng không thể âm"),

  // Middleware để xử lý kết quả kiểm tra
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array().map(err => err.msg) 
      });
    }
    next();
  },
];
