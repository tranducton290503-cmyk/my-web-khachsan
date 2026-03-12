import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import API from "../services/api";

import CreateBooking from "./CreateBooking"; 



const statusTranslations = {
  available: "Còn trống",
  booked: "Đã đặt",
  occupied: "Đang ở",
  cleaning: "Đang dọn",
  maintenance: "Bảo trì",
};

const roomTypeTranslations = {
  Single: "Phòng Đơn",
  Double: "Phòng Đôi",
  Suite: "Phòng Suite",
  Deluxe: "Cao cấp",
};

function RoomMap() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null); 
  const [showModal, setShowModal] = useState(false);      
  const router = useRouter();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await API.get("/rooms");
      setRooms(res.data.data || res.data);
    } catch (err) {
      console.error("Lỗi tải sơ đồ phòng:", err);
    }
  };

  const handleRoomClick = (room) => {
    if (room.status === "available") {
      setSelectedRoom(room); 
      setShowModal(true);    
    } else {
      alert(`Phòng ${room.number} đang ${statusTranslations[room.status]}`);
    }
  };

  const getColor = (status) => {
    switch (status) {
      case "available": return "#27ae60"; // Xanh lá
      case "booked": return "#f1c40f";    // Vàng
      case "occupied": return "#e74c3c";  // Đỏ
      case "cleaning": return "#3498db";  // Xanh dương
      case "maintenance": return "#7f8c8d"; // Xám
      default: return "#95a5a6";
    }
  };

  const floors = [...new Set(rooms.map((r) => Math.floor(r.number / 100)))];

  return (
    <div style={{ padding: "30px", fontFamily: "Arial, sans-serif", backgroundColor: "#f4f7f6", minHeight: "100vh", position: "relative" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, color: "#2c3e50" }}>Sơ đồ phòng khách sạn</h2>
        <button onClick={() => router.push("/dashboard")} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#34495e", color: "white", cursor: "pointer", fontWeight: "bold" }}>
          Về Dashboard
        </button>
      </div>

      {/* Thanh chú thích (Legend) */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "25px", flexWrap: "wrap", padding: "10px", backgroundColor: "white", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
        {Object.keys(statusTranslations).map(status => (
          <div key={status} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
            <div style={{ width: "15px", height: "15px", borderRadius: "3px", backgroundColor: getColor(status) }}></div>
            <span>{statusTranslations[status]}</span>
          </div>
        ))}
      </div>

      {/* Danh sách tầng và phòng */}
      {floors.sort((a, b) => b - a).map((floor) => (
        <div key={floor} style={{ marginBottom: "40px" }}>
          <h3 style={{ color: "#2c3e50", borderLeft: "5px solid #3498db", paddingLeft: "10px", marginBottom: "15px" }}>Tầng {floor}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 150px))", gap: "20px" }}>
            {rooms
              .filter((r) => Math.floor(r.number / 100) === floor)
              .map((room) => (
                <div
                  key={room._id}
                  onClick={() => handleRoomClick(room)}
                  style={{
                    background: getColor(room.status),
                    padding: "15px",
                    borderRadius: "15px",
                    color: "white",
                    textAlign: "center",
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                    transition: "all 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    minHeight: "110px"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <strong style={{ fontSize: "20px" }}>P.{room.number}</strong>
                  
                  {/* Loại phòng */}
                  <span style={{ fontSize: "11px", opacity: 0.9, marginTop: "2px" }}>
                    {roomTypeTranslations[room.type] || room.type}
                  </span>

                  {/* Giá phòng */}
                  <div style={{ 
                    fontSize: "13px", 
                    margin: "8px 0", 
                    fontWeight: "bold", 
                    backgroundColor: "rgba(255,255,255,0.25)", 
                    borderRadius: "6px",
                    padding: "3px 0"
                  }}>
                    {new Intl.NumberFormat('vi-VN').format(room.price)}đ
                  </div>

                  <span style={{ fontSize: "12px", fontWeight: "500" }}>
                    {statusTranslations[room.status] || room.status}
                  </span>

                  {room.guestName && (
                    <div style={{ marginTop: "5px", fontSize: "11px", borderTop: "1px solid rgba(255,255,255,0.3)", paddingTop: "5px" }}>
                      👤 {room.guestName}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}

      {/* --- MODAL ĐẶT PHÒNG --- */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <button onClick={() => setShowModal(false)} style={closeButtonStyle}>✕</button>
            <CreateBooking 
              selectedRoomData={selectedRoom} 
              onBookingCreated={() => {
                setShowModal(false);
                fetchRooms(); 
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

// CSS Styles cho Modal
const modalOverlayStyle = {
  position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
  backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center",
  alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)"
};

const modalContentStyle = {
  backgroundColor: "white", padding: "20px", borderRadius: "15px",
  position: "relative", width: "95%", maxWidth: "450px", boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
};

const closeButtonStyle = {
  position: "absolute", top: "15px", right: "15px", border: "none",
  background: "none", fontSize: "20px", cursor: "pointer", color: "#999"
};

export default RoomMap;
