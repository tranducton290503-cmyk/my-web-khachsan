const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: [true, "Số phòng là bắt buộc"],
      unique: true, // Tránh trùng lặp số phòng
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Loại phòng không được để trống"],
      enum: ["Single", "Double", "Suite", "Deluxe"], // Giới hạn loại phòng
    },
    price: {
      type: Number,
      required: [true, "Giá phòng phải là một con số"],
      min: [0, "Giá phòng không thể âm"],
    },
    status: {
      type: String,
      required: true,
      enum: ["available", "booked", "cleaning", "maintenance", "occupied"],
      default: "available",
    },
    // Chuyển sang mảng để lưu được nhiều ảnh hơn
    images: [
      {
        type: String,
        default: "default-room.jpg",
      },
    ],
    description: {
      type: String,
      maxlength: [500, "Mô tả không được quá 500 ký tự"],
    },

      // Thêm trường để liên kết với Booking hiện tại (nếu có)
    currentBooking: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Booking" // Phải khớp với tên Model Booking
}

  },
  {
    // Tự động thêm createdAt và updatedAt
    timestamps: true,
  }
);

// Tạo Index cho price và type để query nhanh hơn khi dữ liệu lớn
RoomSchema.index({ price: 1, type: 1 });

module.exports = mongoose.model("Room", RoomSchema);
