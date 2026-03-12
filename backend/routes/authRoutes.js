const router = require("express").Router();
const authController = require("../controllers/authController");
const { check, validationResult } = require("express-validator");

// Middleware xử lý lỗi validation nhanh
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array().map(err => err.msg) });
  }
  next();
};

/**
 * @route   POST /api/auth/register
 * @desc    Đăng ký tài khoản mới với kiểm tra dữ liệu đầu vào
 */
router.post(
  "/register",
  [
    check("name", "Tên không được để trống").not().isEmpty(),
    check("email", "Email không hợp lệ").isEmail(),
    check("password", "Mật khẩu phải từ 6 ký tự trở lên").isLength({ min: 6 }),
    validate
  ],
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Đăng nhập hệ thống
 */
router.post(
  "/login",
  [
    check("email", "Email không hợp lệ").isEmail(),
    check("password", "Mật khẩu là bắt buộc").exists(),
    validate
  ],
  authController.login
);



module.exports = router;

