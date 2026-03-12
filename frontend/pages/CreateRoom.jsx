import { useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

function CreateRoom({ onRoomCreated }) { // Thêm prop để cập nhật danh sách sau khi tạo
  const [number, setNumber] = useState("");
  const [type, setType] = useState("Single"); // Mặc định chọn 1 loại
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Gửi dữ liệu theo đúng định dạng Backend cần
      await API.post("/rooms", {
        number,
        type,
        price: Number(price) // Đảm bảo giá là kiểu số
      });

      alert("🎉 Thêm phòng mới thành công!");
      
      // Reset form
      setNumber("");
      setPrice("");
      
      // Nếu có hàm callback từ trang cha (ví dụ trang Rooms), gọi nó để load lại danh sách
      if (onRoomCreated) onRoomCreated();

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Lỗi khi tạo phòng. Vui lòng kiểm tra lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ color: "#2c3e50" }}>Thêm Phòng Mới</h2>

      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={inputGroup}>
          <label>Số phòng:</label>
          <input
            type="text"
            placeholder="Ví dụ: 101, 202..."
            required
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={inputGroup}>
          <label>Loại phòng:</label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)}
            style={inputStyle}
          >
            <option value="Single">Single (Phòng đơn)</option>
            <option value="Double">Double (Phòng đôi)</option>
            <option value="Suite">Suite (Cao cấp)</option>
            <option value="Deluxe">Deluxe (Hạng sang)</option>
          </select>
        </div>

        <div style={inputGroup}>
          <label>Giá phòng (VNĐ):</label>
          <input
            type="number"
            placeholder="Giá mỗi đêm"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            ...buttonStyle,
            backgroundColor: loading ? "#ccc" : "#27ae60"
          }}
        >
          {loading ? "Đang lưu..." : "Lưu phòng"}
        </button>
      </form>
    </div>
  );
}

// CSS-in-JS cơ bản cho gọn đẹp
const containerStyle = { padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", maxWidth: "400px" };
const formStyle = { display: "flex", flexDirection: "column", gap: "15px" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "5px" };
const inputStyle = { padding: "10px", borderRadius: "4px", border: "1px solid #ddd" };
const buttonStyle = { padding: "12px", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };

export default CreateRoom;
