"use client";

import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

const STATUS_COLORS = {
  available: { bg: "#dcfce7", text: "#166534", label: "Trống" },
  booked: { bg: "#dbeafe", text: "#1e40af", label: "Đã đặt" },
  occupied: { bg: "#fee2e2", text: "#991b1b", label: "Đang ở" },
  cleaning: { bg: "#fef9c3", text: "#854d0e", label: "Dọn dẹp" },
  maintenance: { bg: "#f3f4f6", text: "#374151", label: "Bảo trì" }
};

function RoomStatus() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingData, setBookingData] = useState({ 
    customerName: "", 
    phone: "", 
    checkOut: "" 
  });

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await API.get("/rooms");
      const roomsArray = Array.isArray(data) ? data : (data?.rooms || data?.data || []);
      setRooms(roomsArray);
    } catch (err) {
      setError("Không thể tải danh sách phòng.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const handleRoomAction = async (room) => {
    // 1. PHÒNG TRỐNG -> Mở Modal nhập liệu
    if (room.status === 'available') {
      setSelectedRoom(room);
      setIsModalOpen(true);
      return;
    }


    // 2. PHÒNG ĐÃ ĐẶT -> Chuyển sang Đang ở
    if (room.status === 'booked') {
      if (window.confirm(`Xác nhận khách tại phòng ${room.number} nhận phòng?`)) {
        try {
          await API.put(`/rooms/${room._id}`, { status: 'occupied' });
          fetchRooms();
        } catch (err) {
          alert("Lỗi khi nhận phòng.");
        }
      }
      return;
    }

    // 3. PHÒNG ĐANG Ở -> Xử lý Check-out (Xoá Booking)
    if (room.status === 'occupied') {
      if (window.confirm(`Xác nhận trả phòng ${room.number} và XOÁ dữ liệu đặt phòng vĩnh viễn?`)) {
        try {
          // BƯỚC TRUNG GIAN: Tìm Booking ID của phòng này để khớp với Backend findById
          const { data: bookingInfo } = await API.get(`/bookings/room/${room._id}`);
          
          if (bookingInfo && bookingInfo._id) {
            // Gọi API Delete với Booking ID (Khớp với req.params.id ở Backend của bạn)
            await API.delete(`/bookings/${bookingInfo._id}`); 
            
            alert("Check-out và dọn sạch dữ liệu thành công.");
            fetchRooms(); // Load lại danh sách phòng
          } else {
            alert("Không tìm thấy thông tin đơn đặt phòng của phòng này.");
          }
        } catch (err) {
          console.error(err);
          alert("Lỗi check-out: Hãy kiểm tra route GET /bookings/room/:id ở backend.");
        }
      }
    }
  };

  const handleConfirmCheckin = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        room: selectedRoom._id,
        customerName: bookingData.customerName,
        phone: bookingData.phone,
        checkIn: new Date().toISOString(),
        checkOut: bookingData.checkOut
      };

      await API.post("/bookings", payload);
      setIsModalOpen(false);
      setBookingData({ customerName: "", phone: "", checkOut: "" });
      fetchRooms();
      alert("Check-in thành công!");
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi lưu thông tin");
    }
  };

  const quickStatusChange = async (id, status) => {
    try {
      await API.put(`/rooms/${id}`, { status });
      fetchRooms();
    } catch (err) {
      alert("Lỗi cập nhật trạng thái.");
    }
  };

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải dữ liệu phòng...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>Quản lý Lưu trú & Phòng</h2>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <thead style={{ backgroundColor: '#f1f5f9' }}>
          <tr>
            <th style={cellStyle}>Số Phòng</th>
            <th style={cellStyle}>Trạng Thái</th>
            <th style={cellStyle}>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((r) => (
            <tr key={r._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={cellStyle}><strong>Phòng {r.number}</strong></td>
              <td style={cellStyle}>
                <span style={{
                  padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold',
                  backgroundColor: STATUS_COLORS[r.status]?.bg, color: STATUS_COLORS[r.status]?.text
                }}>
                  {STATUS_COLORS[r.status]?.label}
                </span>
              </td>
              <td style={cellStyle}>
                {r.status === 'available' && (
                  <button onClick={() => handleRoomAction(r)} style={btnCheckinStyle}>Mới & Check-in</button>
                )}
                {r.status === 'booked' && (
                  <button onClick={() => handleRoomAction(r)} style={{...btnCheckinStyle, backgroundColor: '#2563eb'}}>Nhận phòng</button>
                )}
                {r.status === 'occupied' && (
                  <button onClick={() => handleRoomAction(r)} style={btnCheckoutStyle}>Trả phòng (Xoá)</button>
                )}
                {(r.status === 'cleaning' || r.status === 'maintenance') && (
                  <button onClick={() => quickStatusChange(r._id, 'available')} style={btnActionStyle}>Xong (Sẵn sàng)</button>
                )}
                {r.status === 'available' && (
                   <button onClick={() => quickStatusChange(r._id, 'maintenance')} style={{...btnActionStyle, marginLeft: '8px', backgroundColor: '#64748b'}}>Bảo trì</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0 }}>Nhập thông tin Check-in: Phòng {selectedRoom?.number}</h3>
            <form onSubmit={handleConfirmCheckin}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Tên khách hàng:</label>
                <input type="text" required style={inputStyle} value={bookingData.customerName} onChange={(e) => setBookingData({...bookingData, customerName: e.target.value})} />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Số điện thoại:</label>
                <input type="text" required style={inputStyle} value={bookingData.phone} onChange={(e) => setBookingData({...bookingData, phone: e.target.value})} />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Ngày trả dự kiến:</label>
                <input type="date" required style={inputStyle} value={bookingData.checkOut} onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={btnCancelStyle}>Hủy</button>
                <button type="submit" style={btnConfirmStyle}>Xác nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const cellStyle = { padding: '16px', textAlign: 'left' };
const btnCheckinStyle = { padding: '8px 14px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' };
const btnCheckoutStyle = { padding: '8px 14px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' };
const btnActionStyle = { padding: '8px 14px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const formGroupStyle = { marginBottom: '12px' };
const labelStyle = { display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 };
const modalContentStyle = { backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '380px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };
const btnConfirmStyle = { padding: '10px 18px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const btnCancelStyle = { padding: '10px 18px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer' };

export default RoomStatus;
