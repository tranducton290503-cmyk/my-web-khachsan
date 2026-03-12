import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";
import CreateRoom from "../pages/CreateRoom"; 

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false); // Trạng thái ẩn/hiện form
  const handleCheckIn = async (bookingId) => {
  try {
    // Gọi đến route mà bạn đã định nghĩa ở Backend
    await API.put(`/bookings/checkin/${bookingId}`); 
    
    alert("✅ Khách đã nhận phòng thành công!");
    loadBookings(); // Tải lại danh sách để cập nhật trạng thái mới trên bảng
  } catch (err) {
    console.error("Lỗi Check-in:", err);
    alert(err.response?.data?.message || "Không thể thực hiện Check-in.");
  }
};

  const loadRooms = async () => {
    try {
      const res = await API.get("/rooms");
      setRooms(res.data.data || []);
    } catch (err) {
      console.error("Lỗi tải phòng:", err);
    }
  };

    // 1. hàm xóa phòng
  const deleteRoom = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phòng này không?")) return;

    try {
      // Gọi API xóa thông qua Axios Interceptor đã cài đặt
      await API.delete(`/rooms/${id}`); 
      alert("Xóa phòng thành công!");
      
      // 2. Gọi lại hàm loadRooms để cập nhật danh sách ngay lập tức
      loadRooms(); 
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      alert(err.response?.data?.message || "Không thể xóa phòng này.");
    }
  };


  useEffect(() => {
    loadRooms();
  }, []);

  return (
    <div>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2>Quản lý danh sách phòng</h2>
          
          {/* Nút để mở/đóng Form thêm phòng */}
          <button 
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "10px 20px",
              backgroundColor: showForm ? "#e74c3c" : "#2ecc71",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            {showForm ? "Đóng Form" : "+ Thêm phòng mới"}
          </button>
        </div>

        {/* Chỉ hiện Form khi showForm là true */}
        {showForm && (
          <div style={{ marginBottom: "30px", border: "1px solid #ddd", borderRadius: "8px", padding: "10px", background: "#f9f9f9" }}>
            <CreateRoom onRoomCreated={() => {
              loadRooms(); // Load lại danh sách ngay khi thêm thành công
              setShowForm(false); // Tự động đóng form sau khi thêm
            }} />
          </div>
        )}

        {/* Bảng danh sách phòng của bạn */}
        <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#34495e", color: "white" }}>
            <tr>
              <th style={tdStyle}>Số phòng</th>
              <th style={tdStyle}>Loại</th>
              <th style={tdStyle}>Giá</th>
              <th style={tdStyle}>Trạng thái</th>
              <th style={tdStyle}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room._id}>
                <td style={tdStyle}>{room.number}</td>
                <td style={tdStyle}>{room.type}</td>
                <td style={tdStyle}>{room.price?.toLocaleString()}đ</td>
                <td style={tdStyle}>
  {room.status === "available" ? "Còn trống" : 
   room.status === "booked" ? "Đã đặt" : 
   room.status === "occupied" ? "Đang có khách" : "Khác"}
</td>

                <td style={tdStyle}>
  <button 
    onClick={() => deleteRoom(room._id)} // Truyền ID của phòng vào hàm xóa
    style={{ 
      color: "white", 
      backgroundColor: "red", 
      border: "none", 
      padding: "5px 10px", 
      borderRadius: "4px",
      cursor: "pointer" 
    }}
  >
    Xóa
  </button>
</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const tdStyle = { padding: "12px", border: "1px solid #ddd", textAlign: "center" };
