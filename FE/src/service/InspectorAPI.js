import axiosClient from "./axiosClient";


// Lấy danh sách xe chờ kiểm định
export const getPendingVehicles = async () => {
  const response = await axiosClient.get("/Inspector/vehicles/pending");
  const data = response?.data ?? response;
  console.log("=== Inspector API Raw Response ===", data);
  
  return (Array.isArray(data) ? data : []).map(v => ({
    id: v.vehicleId || v.id,
    vehicleId: v.vehicleId || v.id,
    name: v.name || "Chưa xác định",
    price: v.price || 0,
    thumbnailUrl: v.thumbnailUrl || "",
    createdAt: v.createdAt || new Date().toISOString(),
    status: "Chờ kiểm định",
  }));
};

// Lấy đầy đủ thông tin xe theo id (dùng Admin API)
export const getVehicleDetail = async (id) => {
  const response = await axiosClient.get(`/Admin/vehicles/${id}`);
  return response?.data ?? response;
};

// Gửi báo cáo kiểm định (bao gồm duyệt hoặc từ chối)
export const submitInspectionReport = async (id, { frameStatus, brakeStatus, drivetrainStatus, description, passed, reportFileUrl = "" }) => {
  const response = await axiosClient.post(`/Inspector/vehicles/${id}/report`, {
    frameStatus: frameStatus || "",
    brakeStatus: brakeStatus || "",
    drivetrainStatus: drivetrainStatus || "",
    passed,
    description: description || "",
    reportFileUrl,
  });
  return response?.data ?? response;
};