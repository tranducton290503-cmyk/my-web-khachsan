import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api"; 

export default function Dashboard() {
  const [stats, setStats] = useState({
    roomsCount: 0,
    bookingsCount: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Gửi các request đồng thời để tăng tốc độ tải trang
        const [resRooms, resBookings] = await Promise.all([
          API.get("/rooms"),
          API.get("/bookings")
        ]);

        const roomsData = resRooms.data.data || [];
        const bookingsData = resBookings.data.data || [];

        // Tính toán doanh thu từ mảng bookings
        const totalRevenue = bookingsData.reduce(
          (sum, b) => sum + (Number(b.totalPrice) || 0), 
          0
        );

        setStats({
          roomsCount: roomsData.length,
          bookingsCount: bookingsData.length,
          revenue: totalRevenue
        });
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu Dashboard:", err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div style={{ padding: "20px" }}>Đang đồng bộ dữ liệu...</div>;

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <Navbar />
      
      <div style={{ padding: "30px" }}>
        <h1 style={{ marginBottom: "25px", color: "#333" }}>Hệ Thống Quản Lý Khách Sạn</h1>

        <div style={{ display: "flex", gap: "25px" }}>
          <div style={statCard("#4A90E2")}>
            <h4>TỔNG SỐ PHÒNG</h4>
            <h2>{stats.roomsCount}</h2>
          </div>

          <div style={statCard("#50E3C2")}>
            <h4>ĐƠN ĐẶT PHÒNG</h4>
            <h2>{stats.bookingsCount}</h2>
          </div>

          <div style={statCard("#F5A623")}>
            <h4>TỔNG DOANH THU</h4>
            <h2>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.revenue)}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

// Style hỗ trợ hiển thị
const statCard = (color) => ({
  flex: 1,
  padding: "25px",
  backgroundColor: color,
  color: "white",
  borderRadius: "12px",
  boxShadow: "0 8px 15px rgba(0,0,0,0.1)",
  textAlign: "center"
});
