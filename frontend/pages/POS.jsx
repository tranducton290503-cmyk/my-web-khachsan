import { useState, useEffect } from "react";
import API from "../services/api";

function POS({ selectedRoomData, onOrderCreated }) {
  const [services, setServices] = useState([]);
  const [rooms, setRooms] = useState([]); // Danh sách phòng đang có khách
  const [targetRoomId, setTargetRoomId] = useState(""); // ID phòng được chọn
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State cho việc thêm dịch vụ mới
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({ name: "", price: "", category: "Food" });

  useEffect(() => {
    fetchServices();
    fetchOccupiedRooms();
    
    // Nếu được truyền từ RoomMap qua thì set luôn ID phòng
    if (selectedRoomData?._id) {
      setTargetRoomId(selectedRoomData._id);
    }
  }, [selectedRoomData]);

  const fetchServices = async () => {
    try {
      const res = await API.get("/services");
      setServices(res.data.data || res.data);
    } catch (err) { console.error("Lỗi tải dịch vụ:", err); }
  };

  const fetchOccupiedRooms = async () => {
    try {
      const res = await API.get("/rooms");
      const allRooms = res.data.data || res.data;
      const occupied = allRooms.filter(r => r.status === "occupied");
      setRooms(occupied);
    } catch (err) { console.error("Lỗi tải phòng:", err); }
  };

  // HÀM TẠO DỊCH VỤ MỚI 
  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/services", newService);
      alert("✨ Đã thêm dịch vụ mới!");
      // Cập nhật danh sách hiển thị ngay lập tức
      setServices([...services, res.data.data || res.data]); 
      setNewService({ name: "", price: "", category: "Food" }); // Reset form
      setShowAddService(false); 
    } catch (err) {
      alert("Lỗi khi tạo dịch vụ: " + (err.response?.data?.message || err.message));
    }
  };

  const addItem = (service) => {
    const exist = cart.find((i) => i.serviceId === service._id);
    if (exist) {
      setCart(cart.map((i) => i.serviceId === service._id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { serviceId: service._id, name: service.name, price: service.price, qty: 1 }]);
    }
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

const handleSubmitOrder = async () => {
  if (!targetRoomId) return alert("Vui lòng chọn số phòng!");
  if (cart.length === 0) return alert("Giỏ hàng trống!");

  setLoading(true);
  try {
    // CHỈ GỬI roomId và items, để Backend tự tìm bookingId
    const payload = {
      roomId: targetRoomId,
      items: cart.map(item => ({
        serviceId: item.serviceId,
        quantity: item.qty, // Schema của bạn là 'quantity'
        price: item.price
      })),
      note: "" 
    };

    await API.post("/pos", payload);
    
    alert(`✅ Chốt đơn thành công!`);
    setCart([]);
    if (onOrderCreated) onOrderCreated();
  } catch (err) {
    // Đoạn này giúp bạn biết chính xác Backend đang báo lỗi gì
    const errorMsg = err.response?.data?.message || "Lỗi kết nối server";
    alert("Thất bại: " + errorMsg);
  } finally {
    setLoading(false);
  }
};




  return (
    <div style={{ padding: "20px", maxWidth: "950px", margin: "auto", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
      <h2 style={{ textAlign: "center", color: "#2c3e50", marginBottom: "20px" }}>Bán Hàng Dịch Vụ (POS)</h2>

      {/* CHỌN PHÒNG */}
      <div style={selectorBoxStyle}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}>Chọn phòng đang ở:</label>
        <select 
          value={targetRoomId} 
          onChange={(e) => setTargetRoomId(e.target.value)}
          style={selectStyle}
          disabled={!!selectedRoomData} 
        >
          <option value="">-- Click để chọn số phòng --</option>
          {rooms.map(r => (
            <option key={r._id} value={r._id}>Phòng {r.number} - {r.currentBooking?.customerName || "Khách lẻ"}</option>
            
          ))}
        </select>
        {selectedRoomData && <small style={{ color: "#27ae60", fontWeight: "bold" }}>* Đang thao tác trên phòng {selectedRoomData.number}</small>}
      </div>

      <div style={{ display: "flex", gap: "25px" }}>
        {/* CỘT TRÁI: MENU */}
        <div style={{ flex: 1.2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h4 style={{ margin: 0 }}>Danh mục dịch vụ</h4>
            <button onClick={() => setShowAddService(!showAddService)} style={toggleBtnStyle}>
              {showAddService ? "Hủy bỏ" : "+ Tạo dịch vụ mới"}
            </button>
          </div>

          {showAddService && (
            <form onSubmit={handleCreateService} style={addServiceFormStyle}>
              <input 
                placeholder="Tên món" 
                required
                value={newService.name}
                onChange={(e) => setNewService({...newService, name: e.target.value})}
                style={smallInputStyle} 
              />
              <input 
                placeholder="Giá" 
                type="number" 
                required
                value={newService.price}
                onChange={(e) => setNewService({...newService, price: e.target.value})}
                style={smallInputStyle} 
              />
              <button type="submit" style={saveServiceBtnStyle}>Lưu món</button>
            </form>
          )}

          <div style={menuGridStyle}>
            {services.map((s) => (
              <div key={s._id} onClick={() => addItem(s)} style={serviceCardStyle}>
                <div style={{ fontWeight: "bold", fontSize: "15px" }}>{s.name}</div>
                <div style={{ color: "#27ae60", fontSize: "14px", marginTop: "5px" }}>{s.price.toLocaleString()}đ</div>
              </div>
            ))}
          </div>
        </div>

        {/* CỘT PHẢI: GIỎ HÀNG */}
        <div style={{ flex: 0.8, backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "10px", border: "1px solid #eee" }}>
          <h4 style={{ marginTop: 0, borderBottom: "2px solid #ddd", paddingBottom: "10px" }}>Đơn hàng</h4>
          <div style={{ minHeight: "250px", maxHeight: "400px", overflowY: "auto" }}>
            {cart.length === 0 && <p style={{ textAlign: "center", color: "#999", marginTop: "50px" }}>Trống</p>}
            {cart.map((i) => (
              <div key={i.serviceId} style={cartItemStyle}>
                <span style={{ flex: 1 }}>{i.name}</span>
                <span style={{ width: "50px", textAlign: "center" }}>x{i.qty}</span>
                <span style={{ width: "80px", textAlign: "right" }}>{(i.price * i.qty).toLocaleString()}đ</span>
              </div>
            ))}
          </div>
          
          <div style={totalBoxStyle}>
            <span>Tổng cộng:</span>
            <span>{total.toLocaleString()}đ</span>
          </div>

          <button 
            onClick={handleSubmitOrder} 
            disabled={loading || !targetRoomId} 
            style={{ 
              ...submitBtnStyle, 
              backgroundColor: (!targetRoomId || loading) ? "#ccc" : "#2c3e50",
              cursor: (!targetRoomId || loading) ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Đang xử lý..." : "XÁC NHẬN CHỐT ĐƠN"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const selectorBoxStyle = { padding: "15px", backgroundColor: "#f1f3f5", borderRadius: "8px", marginBottom: "20px", border: "1px solid #dee2e6" };
const selectStyle = { width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #ced4da", fontSize: "16px", marginBottom: "5px" };
const menuGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 140px))", gap: "10px", maxHeight: "450px", overflowY: "auto", padding: "5px" };
const serviceCardStyle = { padding: "15px", border: "1px solid #eee", borderRadius: "10px", cursor: "pointer", textAlign: "center", backgroundColor: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", transition: "transform 0.1s" };
const cartItemStyle = { display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px", paddingBottom: "5px", borderBottom: "1px solid #eee" };
const totalBoxStyle = { display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "20px", marginTop: "20px", color: "#e67e22", borderTop: "2px solid #ddd", paddingTop: "10px" };
const toggleBtnStyle = { padding: "6px 12px", fontSize: "13px", backgroundColor: "#3498db", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" };
const addServiceFormStyle = { display: "flex", gap: "8px", marginBottom: "20px", padding: "15px", backgroundColor: "#f8f9fa", border: "1px solid #3498db", borderRadius: "8px" };
const smallInputStyle = { flex: 1, padding: "8px", fontSize: "14px", borderRadius: "4px", border: "1px solid #ddd" };
const saveServiceBtnStyle = { backgroundColor: "#27ae60", color: "white", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };
const submitBtnStyle = { width: "100%", marginTop: "20px", padding: "15px", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "16px" };

export default POS;
