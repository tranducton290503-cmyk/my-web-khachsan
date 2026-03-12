import { useState, useEffect } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

function CreateBooking({ selectedRoomData, onBookingCreated }) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [loading, setLoading] = useState(false);

  // --- MỚI: Quản lý danh sách phòng trống ---
  const [availableRooms, setAvailableRooms] = useState([]);
  const [targetRoomId, setTargetRoomId] = useState("");

  useEffect(() => {
    fetchAvailableRooms();
    const today = new Date().toISOString().split("T")[0];
    setCheckIn(today);

    // Nếu có dữ liệu truyền từ RoomMap qua thì chọn sẵn phòng đó
    if (selectedRoomData?._id) {
      setTargetRoomId(selectedRoomData._id);
    }
  }, [selectedRoomData]);

  const fetchAvailableRooms = async () => {
    try {
      const res = await API.get("/rooms");
      const allRooms = res.data.data || res.data;
      // Chỉ lấy các phòng có trạng thái 'available'
      const available = allRooms.filter(room => room.status === "available");
      setAvailableRooms(available);
    } catch (err) {
      console.error("Không thể tải danh sách phòng trống", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetRoomId) return alert("Vui lòng chọn phòng!");
    
    setLoading(true);
    try {
      await API.post("/bookings", {
        customerName,
        phone,
        room: targetRoomId, // Gửi ID phòng đã chọn (thủ công hoặc tự động)
        checkIn,
        checkOut
      });

      alert("🎉 Đặt phòng thành công!");
      setCustomerName("");
      setPhone("");
      if (onBookingCreated) onBookingCreated();
    } catch (err) {
      alert(err.response?.data?.message || "Đặt phòng thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: "center", color: "#2c3e50" }}>Tạo Đơn Đặt Phòng</h2>

      <form onSubmit={handleSubmit} style={formStyle}>
        
        {/* --- PHẦN CHỌN PHÒNG: Thay thế cho badge cố định --- */}
        <div style={selectorBox}>
          <label style={labelStyle}>Chọn phòng còn trống:</label>
          <select
            required
            value={targetRoomId}
            onChange={(e) => setTargetRoomId(e.target.value)}
            style={inputStyle}
            disabled={!!selectedRoomData} // Nếu đi từ sơ đồ qua thì khóa chọn phòng lại
          >
            <option value="">-- Chọn số phòng --</option>
            {availableRooms.map((room) => (
              <option key={room._id} value={room._id}>
                Phòng {room.number} - {room.type} ({room.price.toLocaleString()}đ)
              </option>
            ))}
          </select>
          {selectedRoomData && (
            <small style={{ color: "#27ae60", marginTop: "5px", display: "block" }}>
              * Đang đặt cho phòng đã chọn từ sơ đồ
            </small>
          )}
        </div>

        <input
          placeholder="Tên khách hàng"
          required
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Số điện thoại"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={inputStyle}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Check-in:</label>
            <input type="date" required value={checkIn} onChange={(e) => setCheckIn(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Check-out:</label>
            <input type="date" required value={checkOut} onChange={(e) => setCheckOut(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{...buttonStyle, backgroundColor: loading ? "#ccc" : "#2980b9"}}
        >
          {loading ? "Đang xử lý..." : "Xác nhận đặt phòng"}
        </button>
      </form>
    </div>
  );
}

// --- Styles ---
const containerStyle = { padding: "20px", maxWidth: "500px", margin: "auto" };
const formStyle = { display: "flex", flexDirection: "column", gap: "15px" };
const inputStyle = { padding: "12px", borderRadius: "6px", border: "1px solid #ddd", width: "100%", fontSize: "15px" };
const labelStyle = { fontSize: "13px", fontWeight: "bold", marginBottom: "5px", display: "block", color: "#666" };
const buttonStyle = { padding: "14px", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" };
const selectorBox = { padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px", border: "1px solid #e9ecef" };

export default CreateBooking;
