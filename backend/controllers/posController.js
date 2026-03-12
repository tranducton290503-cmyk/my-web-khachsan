const PosOrder = require("../models/PosOrder");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const Service = require("../models/Service");

exports.createOrder = async (req, res) => {
  try {
    const { roomId, items, note } = req.body;

    // 1. Tìm Booking đang ở (status: 'checked-in') của phòng này
    // Chúng ta tìm booking TRƯỚC để xác nhận phòng này thực sự có khách
    const currentBooking = await Booking.findOne({ 
      room: roomId, 
      status: "checkin" // Đảm bảo trạng thái này khớp với lúc bạn 
    });

    if (!currentBooking) {
      return res.status(400).json({ 
        success: false, 
        message: "Phòng này hiện không có khách (không tìm thấy lượt Check-in)!" 
      });
    }

    // 2. Chuẩn hóa Items (Lấy giá từ DB để thỏa mãn Schema required: true)
    const validatedItems = await Promise.all(items.map(async (item) => {
      const serviceDetail = await Service.findById(item.serviceId);
      if (!serviceDetail) throw new Error(`Dịch vụ không tồn tại!`);
      
      return {
        serviceId: item.serviceId,
        name: serviceDetail.name,
        price: serviceDetail.price,
        quantity: Number(item.quantity || item.qty || 1)
      };
    }));

    // 3. Tạo đơn hàng
    const order = new PosOrder({
      roomId,
      bookingId: currentBooking._id, // Backend tự gắn ID vào đây
      items: validatedItems,
      note,
      status: "pending"
    });

    await order.save(); // Kích hoạt pre-save tính tổng tiền

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getOrdersByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const orders = await PosOrder.find({ roomId }).sort({ createdAt: -1 }).populate("items.serviceId");     
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};