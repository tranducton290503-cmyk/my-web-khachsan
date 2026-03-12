const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room", // Liên kết với Model Room đã tạo trước đó
      required: [true, "Phòng là thông tin bắt buộc"],
    },
    customerName: {
      type: String,
      required: [true, "Tên khách hàng là bắt buộc"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Số điện thoại là bắt buộc"],
      // Regex đơn giản để kiểm tra định dạng số điện thoại Việt Nam
      match: [/(84|0[3|5|7|8|9])+([0-9]{8})\b/g, "Số điện thoại không hợp lệ"],
    },
    checkIn: {
      type: Date,
      required: [true, "Ngày nhận phòng là bắt buộc"],
    },
    checkOut: {
      type: Date,
      required: [true, "Ngày trả phòng là bắt buộc"],
      // Tự động kiểm tra logic ngày tháng
      validate: {
        validator: function (value) {
          return value > this.checkIn;
        },
        message: "Ngày trả phòng phải sau ngày nhận phòng",
      },
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, "Tổng tiền không thể âm"],
    },
    status: {
      type: String,
      enum: ["booked", "checkin", "checkout", "cancel"],
      default: "booked",
    },
    note: {
      type: String,
      maxlength: [200, "Ghi chú không quá 200 ký tự"],
    },
  },
  {
    timestamps: true, // Thay thế cho createdAt thủ công để có cả updatedAt
  }
);

// Tạo Index để tìm kiếm đơn đặt phòng theo số điện thoại nhanh hơn
BookingSchema.index({ phone: 1 });

module.exports = mongoose.model("Booking", BookingSchema);
