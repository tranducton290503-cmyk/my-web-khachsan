const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

// Giả sử bạn đã có middleware xác thực
const { protect, authorize } = require("../middleware/auth");
const { validateRoom } = require("../middleware/validator");

/**
 * Lộ trình cho tất cả các phòng
 */
router
  .route("/")
  .get(roomController.getRooms) // Ai cũng có thể xem danh sách phòng
  .post(
    protect, 
    authorize("admin", "manager"), // Chỉ admin/manager mới được tạo
    validateRoom,                  // Kiểm tra dữ liệu input (number, price...)
    roomController.createRoom
  );

/**
 * Lộ trình cho từng phòng cụ thể qua ID
 */
router
  .route("/:id")
  .put(
    protect, 
    authorize("admin"),  
    roomController.updateRoom
  )
  .delete(
    protect, 
    authorize("admin"), 
    roomController.deleteRoom
  );



module.exports = router;
