const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên dịch vụ không được để trống"],
      trim: true, // Tự động xóa khoảng trắng thừa ở đầu và cuối
      unique: true, // Đảm bảo không trùng tên dịch vụ
    },
    price: {
      type: Number,
      required: [true, "Giá dịch vụ là bắt buộc"],
      min: [0, "Giá dịch vụ không thể âm"],
    },
    category: {
      type: String,
      enum: ["Food", "Drink", "Laundry", "Spa", "Other"], // Giới hạn loại dịch vụ
      default: "Other",
    },
    description: {
      type: String,
      maxLength: [200, "Mô tả không quá 200 ký tự"],
    },
    isActive: {
      type: Boolean,
      default: true, // Dùng để ẩn/hiện dịch vụ thay vì xóa cứng khỏi DB
    },
    unit: {
      type: String, 
      default: "lượt", // Ví dụ: lượt, chai, kg, giờ...
    }
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt
  }
);

// Tạo Index để tìm kiếm theo tên nhanh hơn
ServiceSchema.index({ name: "text" });

module.exports = mongoose.model("Service", ServiceSchema);
