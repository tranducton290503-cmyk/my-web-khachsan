import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    // Lấy role từ localStorage để biết là admin hay staff
    const role = localStorage.getItem("role");
    setUserRole(role);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    router.push("/login");
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "#2c3e50",
      padding: "10px 20px",
      color: "white"
    }}>
      <div style={{ display: "flex", gap: "15px" }}>
        <button style={btnStyle} onClick={() => router.push("/dashboard")}>Dashboard</button>
        <button style={btnStyle} onClick={() => router.push("/rooms")}>Phòng</button>
        <button style={btnStyle} onClick={() => router.push("/bookings")}>Đặt phòng</button>
        <button style={btnStyle} onClick={() => router.push("/RoomMap")}>Sơ Đồ Khách Sạn</button>
        <button style={btnStyle} onClick={() => router.push("/POS")}>POS</button>
        <button style={btnStyle} onClick={() => router.push("/RoomStatus")}>Trạng Thái Phòng</button>
        <button style={btnStyle} onClick={() => router.push("/reports")}>Báo Cáo</button>
        {/* Chỉ Admin mới thấy nút quản lý nhân viên hoặc báo cáo */}
        {userRole === "admin" && (
          <button style={{ ...btnStyle, background: "#f39c12" }} onClick={() => router.push("/admin/users")}>
            Nhân viên
          </button>
        )}
      </div>

      <button style={{ ...btnStyle, background: "#e74c3c" }} onClick={logout}>Đăng xuất</button>
    </div>
  );
}

const btnStyle = {
  padding: "8px 15px",
  cursor: "pointer",
  border: "none",
  borderRadius: "4px",
  background: "#34495e",
  color: "white",
  fontWeight: "bold"
};
