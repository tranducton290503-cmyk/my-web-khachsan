require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

// Hàm tiện ích tạo Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

/**
 * @desc    Đăng ký người dùng mới
 * @route   POST /api/auth/register
 */
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("Email này đã được sử dụng");
  }

  // Nếu bạn dùng Model có pre("save"), mật khẩu sẽ tự hash tại đây
  const user = await User.create({
    name,
    email,
    password, 
    role
  });

  if (user) {
    res.status(201).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  }
});

/**
 * @desc    Đăng nhập & Lấy Token
 * @route   POST /api/auth/login
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Tìm user và lấy luôn trường password (vì mặc định ta đã để select: false)
  const user = await User.findOne({ email }).select("+password");

  if (user && (await user.matchPassword(password))) {
    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });

    
  } else {
    res.status(401);
    throw new Error("Email hoặc mật khẩu không chính xác");
  }
  if (res.ok) {
  localStorage.setItem("token", data.token);
  // Lưu thêm role để phân quyền ở Frontend
  localStorage.setItem("userRole", data.role); 
  localStorage.setItem("userName", data.name);

  router.push("/dashboard");
}

});


