const express = require("express");
const router = express.Router();
const posController = require("../controllers/posController");

// 1. Tạo đơn hàng dịch vụ mới (Khi khách gọi đồ)
router.post("/", posController.createOrder);

// 2. Lấy danh sách dịch vụ đã dùng của một phòng (Để hiển thị lên sơ đồ khi click vào phòng occupied)
router.get("/room/:roomId", posController.getOrdersByRoom);

// 3. (Gợi ý thêm) Lấy tất cả đơn hàng POS nếu bạn muốn làm trang quản lý doanh thu dịch vụ riêng
// router.get("/", posController.getAllOrders);

module.exports = router;
