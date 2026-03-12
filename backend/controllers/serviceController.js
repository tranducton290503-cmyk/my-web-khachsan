const Service = require("../models/Service");

// Lấy tất cả dịch vụ (Chỉ lấy những cái đang hoạt động isActive: true)
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: services
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Tạo dịch vụ mới
exports.createService = async (req, res) => {
  try {
    const { name, price, category, unit } = req.body;
    
    // Kiểm tra xem tên dịch vụ đã tồn tại chưa
    const existingService = await Service.findOne({ name });
    if (existingService) {
      return res.status(400).json({ success: false, message: "Tên dịch vụ này đã tồn tại!" });
    }

    const newService = await Service.create({
      name,
      price,
      category,
      unit
    });

    res.status(201).json({
      success: true,
      data: newService
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
