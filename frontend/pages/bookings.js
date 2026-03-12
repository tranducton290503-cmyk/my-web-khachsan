import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";
import CreateBooking from "./CreateBooking"; 


// 1. Định nghĩa Style cho nút bấm (Sửa lỗi ReferenceError)
const actionButtonStyle = {
  color: "white",
  border: "none",
  padding: "8px 16px",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "0.3s"
};

const thTdStyle = { padding: "12px", border: "1px solid #dee2e6" };

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    try {
      const res = await API.get("/bookings");
      setBookings(res.data.data || []);
    } catch (err) {
      console.error("Lỗi tải đơn đặt phòng:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Thêm hàm xử lý Check-in (Sửa lỗi undefined)
  const handleCheckIn = async (id) => {
    if (!window.confirm("Xác nhận khách nhận phòng?")) return;
    try {
      await API.put(`/bookings/checkin/${id}`);
      alert("✅ Check-in thành công!");
      loadBookings(); // Tải lại bảng để nút tự đổi trạng thái
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi check-in");
    }
  };

  // 3. Thêm hàm xử lý Check-out
  const handleCheckOut = async (id) => {
  if (!window.confirm("Xác nhận khách trả phòng và xóa đơn này?")) return;
  try {
    await API.delete(`/bookings/${id}`); // Xóa đơn sau khi check-out thành công
    alert("✅ Trả phòng thành công và đã xóa đơn đặt!");
    loadBookings(); // Đơn sẽ biến mất khỏi danh sách sau dòng này
  } catch (err) {
    alert(err.response?.data?.message || "Lỗi khi check-out");
  }
};


  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <div>
      <Navbar />
      <div style={{ padding: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2>Quản lý Đặt phòng</h2>
          
          <button 
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "10px 20px",
              backgroundColor: showForm ? "#95a5a6" : "#3498db",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            {showForm ? "Hủy bỏ" : "+ Tạo đơn đặt phòng mới"}
          </button>
        </div>

        {showForm && (
          <div style={{ 
            marginBottom: "30px", 
            padding: "20px", 
            background: "#fdfdfd", 
            border: "1px solid #eee", 
            borderRadius: "10px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)" 
          }}>
            <CreateBooking onBookingCreated={() => {
              loadBookings(); 
              setShowForm(false); 
            }} />
          </div>
        )}

        <hr style={{ margin: "30px 0", border: "0.5px solid #eee" }} />

        <table border="1" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ background: "#f8f9fa" }}>
            <tr>
              <th style={thTdStyle}>Khách hàng</th>
              <th style={thTdStyle}>Phòng</th>
              <th style={thTdStyle}>Ngày In</th>
              <th style={thTdStyle}>Ngày Out</th>
              <th style={thTdStyle}>Thao tác</th>
              <th style={thTdStyle}>Tổng tiền</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? (
              bookings.map((b) => (
                <tr key={b._id}>
                  <td style={thTdStyle}>{b.customerName}</td>
                  <td style={thTdStyle}>{b.room?.roomNumber || b.room?.number || "N/A"}</td>
                  <td style={thTdStyle}>{new Date(b.checkIn).toLocaleDateString("vi-VN")}</td>
                  <td style={thTdStyle}>{new Date(b.checkOut).toLocaleDateString("vi-VN")}</td>
                  <td style={thTdStyle}>
  <div style={{ display: "flex", gap: "5px", flexDirection: "column" }}>
    
    {/* Nút Check-in: Vẫn nên giữ điều kiện chỉ hiện khi chưa nhận phòng */}
    {b.status === "booked" && (
      <button 
        onClick={() => handleCheckIn(b._id)}
        style={{ ...actionButtonStyle, backgroundColor: "#27ae60" }}
      >
        Check-in
      </button>
    )}

    {/* Nút Check-out: HIỂN THỊ MỌI LÚC (Trừ khi đã hoàn tất) */}
    {b.status !== "checked-out" && (
      <button 
        onClick={() => handleCheckOut(b._id)}
        style={{ ...actionButtonStyle, backgroundColor: "#e67e22" }}
      >
        Check-out ngay
      </button>
    )}

    {/* Trạng thái hoàn tất */}
    {b.status === "checked-out" && (
      <span style={{ color: "#7f8c8d", fontWeight: "bold" }}>✓ Đã hoàn tất</span>
    )}
  </div>
</td>

                  <td style={thTdStyle}>{b.totalPrice?.toLocaleString()}đ</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>Chưa có đơn đặt nào</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
