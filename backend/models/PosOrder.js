const mongoose = require("mongoose");

const PosOrderSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Đơn hàng dịch vụ phải gắn liền với một phòng"],
    },
    // Lưu ID booking để dễ dàng cộng vào tổng hóa đơn khi khách Check-out
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    items: [
      {
        serviceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
          required: true,
        },
        name: String, // Lưu tên tại thời điểm mua để tránh thay đổi giá/tên sau này
        quantity: {
          type: Number,
          default: 1,
          min: [1, "Số lượng tối thiểu là 1"],
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    total: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "added-to-bill"],
      default: "pending", // pending: chưa thu tiền, added-to-bill: cộng vào tiền phòng khi check-out
    },
    note: String, // Ví dụ: "Giao thêm đá", "Khách lấy tại quầy"
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt
  }
);




module.exports = mongoose.model("PosOrder", PosOrderSchema);
