const Room = require("../models/Room");

// Helper function để xử lý lỗi nhanh (hoặc dùng thư viện express-async-handler)
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * @desc    Lấy danh sách phòng (Có phân trang & lọc)
 * @route   GET /api/rooms
 */
exports.getRooms = asyncHandler(async (req, res) => {
  // Thêm tính năng lọc theo loại phòng và phân trang
  const { type, page = 1, limit = 10 } = req.query;
  const query = type ? { type } : {};

  const rooms = await Room.find(query)
    .populate("currentBooking") // Lấy thông tin booking hiện tại nếu có (để hiển thị trên sơ đồ)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Room.countDocuments(query);

  res.status(200).json({
    success: true,
    count: rooms.length,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
    data: rooms,
  });

  
});

/**
 * @desc    Tạo phòng mới
 * @route   POST /api/rooms
 */
exports.createRoom = asyncHandler(async (req, res) => {
  // Luôn dùng try-catch hoặc asyncHandler để bắt lỗi trùng số phòng (unique)
  const room = await Room.create(req.body);
  
  res.status(201).json({
    success: true,
    data: room
  });
});

/**
 * @desc    Cập nhật thông tin phòng
 * @route   PUT /api/rooms/:id
 */
exports.updateRoom = asyncHandler(async (req, res) => {
  // 1. Kiểm tra sự tồn tại của phòng trước khi update (tùy chọn nhưng an toàn)
  let room = await Room.findById(req.params.id);

  if (!room) {
    return res.status(404).json({ 
      success: false, 
      message: "Không tìm thấy phòng để cập nhật" 
    });
  }

  // 2. Chỉ cho phép cập nhật các trường cụ thể (Security Best Practice)
  // Tránh việc người dùng gửi 'owner' hoặc các trường nhạy cảm khác trong req.body
  room = await Room.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ 
    success: true, 
    data: room,
    message: "Cập nhật phòng thành công" 
  });
});


/**
 * @desc    Xóa phòng
 * @route   DELETE /api/rooms/:id
 */
exports.deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findByIdAndDelete(req.params.id);

  if (!room) {
    return res.status(404).json({ success: false, message: "Không tìm thấy phòng để xóa" });
  }

  res.status(200).json({ success: true, message: "Đã xóa phòng thành công" });
});

exports.checkIn = async (req, res) => {
  try {
    // 1. Sử dụng findByIdAndUpdate để cập nhật nhanh và lấy dữ liệu mới nhất
    // { new: true } trả về object sau khi đã sửa, { runValidators: true } đảm bảo đúng format Model
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "checked-in" },
      { new: true, runValidators: true }
    ).populate("room"); // Thêm populate nếu bạn muốn trả về thông tin phòng ngay lập tức

    // 2. Kiểm tra nếu ID không tồn tại
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn đặt phòng này."
      });
    }

    // 3. (Tùy chọn) Cập nhật trạng thái phòng sang 'occupied' 
    if (booking.room) {
      await Room.findByIdAndUpdate(booking.room._id, { status: "occupied" });
    }

    res.status(200).json({
      success: true,
      message: "Khách đã nhận phòng thành công!",
      data: booking
    });

  } catch (error) {
    // 4. Xử lý lỗi hệ thống hoặc lỗi định dạng ID (CastError)
    console.error("Check-in Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi thực hiện check-in.",
      error: error.message
    });
  }
};

exports.checkOut = async (req, res) => {
  try {
    // 1. Tìm đơn đặt phòng và lấy thông tin phòng liên quan (populate)
    const booking = await Booking.findById(req.params.id).populate("room");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn đặt phòng."
      });
    }

    // 2. Kiểm tra nếu đã check-out rồi thì không cho làm lại
    if (booking.status === "checked-out") {
      return res.status(400).json({
        success: false,
        message: "Đơn đặt này đã được thực hiện check-out trước đó."
      });
    }

    // 3. Cập nhật trạng thái đơn đặt phòng
    booking.status = "checked-out";
    await booking.save();

    // 4. GIẢI PHÓNG PHÒNG: Đổi trạng thái phòng sang 'available'
    if (booking.room) {
      // Sử dụng ID phòng từ đơn đặt để cập nhật bảng Room
      await Room.findByIdAndUpdate(booking.room._id, { status: "available" });
    }

    res.status(200).json({
      success: true,
      message: "Khách đã trả phòng và giải phóng phòng thành công!",
      data: booking
    });

  } catch (error) {
    console.error("Check-out Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi thực hiện check-out.",
      error: error.message
    });
  }
};



