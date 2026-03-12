const router = require("express").Router();
const bookingController = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/auth"); // Middleware bảo mật đã tạo trước đó

// 1. Route đặt phòng (Khách hàng hoặc nhân viên đều dùng được)
router.post("/", bookingController.createBooking);

// 2. Route lấy danh sách booking (Yêu cầu đăng nhập và chỉ Admin/Staff mới thấy)
router.get(
  "/", 
  protect, 
  authorize("admin", "staff"), 
  bookingController.getBookings
);

// 3. Route Check-in (Cần đăng nhập và quyền Admin/Staff)
router.put(
  "/checkin/:id", 
  protect, 
  authorize("admin", "staff"), 
  bookingController.checkIn
);

// 4. Route Check-out (Cần đăng nhập và quyền Admin/Staff)
router.put(
  "/checkout/:id", 
  protect, 
  authorize("admin", "staff"), 
  bookingController.checkOut
);

// Sử dụng phương thức .delete khớp với API.delete ở Frontend
router.delete(
  "/:id", 
  protect, 
  authorize("admin", "staff"), 
  bookingController.deleteBooking
);

// lấy danh sách booking theo ID phòng (Dùng để tìm Booking ID khi check-out)
router.get("/room/:roomId", bookingController.getBookingByRoomId);


module.exports = router;
