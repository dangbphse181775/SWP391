import axiosClient from "./axiosClient";


// Lấy danh sách xe chờ kiểm định
export const getPendingVehicles = async () => {
  const response = await axiosClient.get("/Inspector/vehicles/pending");
  const data = response?.data ?? response;
  console.log("=== Inspector API Raw Response ===", data);
  
  return (Array.isArray(data) ? data : []).map(v => {
    console.log("Mapping vehicle:", v);
    return {
      // ID & Status
      id: v.vehicleId || v.id,
      vehicleId: v.vehicleId || v.id,
      status: v.status || "Chờ kiểm định",
      
      // Basic Info
      name: v.name || "Chưa xác định",
      price: v.price || 0,
      condition: v.condition || v.conditionStatus || "",
      description: v.description || v.descriptionText || "",
      
      // Images & Media
      thumbnailUrl: v.thumbnailUrl || v.image || "",
      image: v.thumbnailUrl || v.image || "",
      media: v.media || [],
      
      // Vehicle Details
      model: v.model || v.modelName || "",
      frameSize: v.frameSize || v.frameSizeValue || "",
      usageHistory: v.usageHistory || v.usageHistoryDescription || "",
      
      // Category & Brand Info
      categoryId: v.categoryId,
      categoryName: v.categoryName || v.categoryType || "",
      brandId: v.brandId,
      brandName: v.brandName || v.brand || v.brandTitle || "",
      
      // Owner & Contact
      owner: v.ownerName || v.owner || v.sellerName || "",
      ownerEmail: v.ownerEmail || v.sellerEmail || "",
      
      // Timestamps
      createdAt: v.createdAt || new Date().toISOString(),
    };
  });
};

// API mới cho kiểm định - lấy đầy đủ thông tin hơn
export const getVehicleInspectionDetails = async (id) => {
  const response = await axiosClient.get(`/Public/vehicles/${id}`)
  const data = response?.data ?? response

  return {
    id: data.vehicleId || data.id,
    name: data.name || "",
    price: data.price || 0,
    brandName: data.brandName || "",
    categoryName: data.categoryName || "",
    model: data.model || "",
    frameSize: data.frameSize || "",
    condition: data.condition || "",
    
    // Thêm thông tin kiểm định
    inspectionHistory: data.inspectionHistory || [],
    lastInspectionDate: data.lastInspectionDate,
    inspectionStatus: data.inspectionStatus,
    issues: data.issues || [],
    
    // các trường khác
    thumbnailUrl: data.thumbnailUrl || data.image || "",
    status: data.status || "Chờ kiểm định",
    createdAt: data.createdAt,
  }
}


/// Lấy chi tiết xe theo id
export const getVehicleById = async (id) => {
  const response = await axiosClient.get(`/Public/Vehicles/${id}`)
  const data = response?.data ?? response

  return {
    id: data.vehicleId || data.id,
    name: data.name || "",
    price: data.price || 0,
    brandName: data.brandName || "",
    categoryName: data.categoryName || "",
    model: data.model || "",
    frameSize: data.frameSize || "",
    condition: data.condition || "",
    usageHistory: data.usageHistory || "",
    description: data.description || "",
    thumbnailUrl: data.thumbnailUrl || data.image || "",
    status: data.status || "Chờ kiểm định",
    createdAt: data.createdAt,
  }
}

// Duyệt xe
export const approveVehicle = async (id) => {
  const response = await axiosClient.post(`/Inspector/vehicles/${id}/report`, {
    passed: true,
    description: "",
    frameStatus: "",
    brakeStatus: "",
    drivetrainStatus: "",
    reportFileUrl: ""
  });
  return response?.data ?? response;
};

// Từ chối xe
export const rejectVehicle = async (id, note) => {
  const response = await axiosClient.post(`/Inspector/vehicles/${id}/report`, {
    passed: false,
    description: note,
    frameStatus: "",
    brakeStatus: "",
    drivetrainStatus: "",
    reportFileUrl: ""
  });
  return response?.data ?? response;
};