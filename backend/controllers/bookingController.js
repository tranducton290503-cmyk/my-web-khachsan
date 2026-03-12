const Booking = require("../models/Booking");
const Room = require("../models/Room");
const asyncHandler = require("express-async-handler");

/**
 * @desc    Tạo đơn đặt phòng mới (Có kiểm tra trùng lịch & tính giá)
 * @route   POST /api/bookings
 */
exports.createBooking = asyncHandler(async (req, res) => {
  const { room: roomId, customerName, phone, checkIn, checkOut } = req.body;

  // 1. Kiểm tra phòng có tồn tại không
  const room = await Room.findById(roomId);
  if (!room) {
    res.status(404);
    throw new Error("Không tìm thấy phòng này");
  }

  // 2. LOGIC QUAN TRỌNG: Kiểm tra xem phòng có đang bị trùng lịch không
  // Tìm các booking của phòng này mà có thời gian chồng lấn với ngày khách chọn
  const overlappingBooking = await Booking.findOne({
    room: roomId,
    status: { $ne: "cancel" }, // Không tính các đơn đã hủy
    $or: [
      { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }
    ]
  });

  if (overlappingBooking) {
    res.status(400);
    throw new Error("Phòng đã có khách đặt trong khoảng thời gian này");
  }

  // 3. Tính toán số ngày và tổng tiền chính xác
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  
  // Tính số đêm (chênh lệch mili-giây chia cho số mili-giây trong 1 ngày)
  const diffTime = end - start;
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (days <= 0) {
    res.status(400);
    throw new Error("Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 ngày");
  }

  const totalPrice = days * room.price;

  // 4. Tạo Booking và cập nhật trạng thái phòng (Transaction-like)
  const booking = await Booking.create({
    room: roomId,
    customerName,
    phone,
    checkIn,
    checkOut,
    totalPrice
  });

  // Lưu ý: Chỉ nên set "booked" nếu ngày nhận phòng là hôm nay
  // Nếu đặt trước cho tương lai, trạng thái phòng vẫn nên là "available"
  // Nhưng để đơn giản theo logic của bạn:
  room.status = "booked";
  await room.save();

  res.status(201).json({ success: true, data: booking });
});

/**
 * @desc    Lấy danh sách booking (Kèm thông tin phòng)
 */
exports.getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .populate("room", "number type price") // Chỉ lấy các trường cần thiết của Room
    .sort("-createdAt");

  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

/**
 * @desc    Xử lý khách nhận phòng (Check-in)
 * @route   PUT /api/bookings/checkin/:id
 */
exports.checkIn = asyncHandler(async (req, res) => {
  // 1. Tìm đơn đặt phòng và lấy thông tin phòng đi kèm
  const booking = await Booking.findById(req.params.id).populate("room");

  if (!booking) {
    res.status(404);
    throw new Error("Không tìm thấy đơn đặt phòng"); //
  }

  // 2. Cập nhật trạng thái đơn đặt sang 'checked-in'
  booking.status = "checkin";
  await booking.save();

  // 3. Cập nhật trạng thái phòng tương ứng sang 'occupied' (Đang có khách)
  if (booking.room) {
    const room = await Room.findById(booking.room._id);
    if (room) {
      room.status = "occupied";
      await room.save();
    }
  }

  res.status(200).json({
    success: true,
    message: "Khách đã nhận phòng thành công",
    data: booking
  });
});

/**
 * @desc    Xử lý Check-out và XÓA đơn đặt phòng ngay lập tức
 * @route   PUT /api/bookings/checkout/:id
 */
exports.checkOut = asyncHandler(async (req, res) => {
  // 1. Tìm đơn đặt để lấy thông tin phòng trước khi xóa
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error("Không tìm thấy đơn đặt phòng");
  }

  // 2. GIẢI PHÓNG PHÒNG: Đưa phòng về trạng thái 'cleaning'
  if (booking.room) {
    await Room.findByIdAndUpdate(booking.room, { status: "cleaning" });
  }

  // 3. XÓA ĐƠN ĐẶT PHÒNG khỏi Database
  await Booking.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Khách đã trả phòng, phòng đã trống và đơn đặt đã được xóa khỏi hệ thống"
  });
});
/**
 * @desc    Xử lý Check-out và XÓA vĩnh viễn đơn đặt phòng
 * @route   DELETE /api/bookings/:id
 */
exports.deleteBooking = asyncHandler(async (req, res) => {
  // 1. Tìm đơn đặt phòng
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error("Không tìm thấy đơn đặt phòng để xóa!");
  }

  // 2. GIẢI PHÓNG PHÒNG (Quan trọng: Phải làm trước khi xóa đơn)
  if (booking.room) {
    await Room.findByIdAndUpdate(booking.room, { status: "cleaning" });
    console.log(`✅ Đã giải phóng phòng ID: ${booking.room}`);
  }

  // 3. THỰC HIỆN XÓA đơn đặt phòng khỏi Database
  await booking.deleteOne();

  res.status(200).json({
    success: true,
    message: "Đã trả phòng thành công và xóa dữ liệu đơn đặt vĩnh viễn."
  });
});

// Lấy thông tin booking theo Room ID (Dùng để khớp với Frontend khi check-out)
exports.getBookingByRoomId = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ room: req.params.roomId });
  if (!booking) {
    res.status(404);
    throw new Error("Không tìm thấy đơn đặt cho phòng này");
  }
  res.json(booking);
});






