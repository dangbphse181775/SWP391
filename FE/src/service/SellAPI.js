import axiosClient from "./axiosClient";

export const getFeePreview = (price) => {
    return axiosClient.get("/Seller/fee-preview", { params: { price } });
};

export const createVehicle = async (data, media) => {
    const formData = new FormData();

    // ===== TEXT FIELDS =====
    formData.append("Name", data.Name);
    formData.append("Description", data.Description);
    formData.append("Condition", data.Condition);
    formData.append("FrameSize", data.FrameSize);
    formData.append("UsageHistory", data.UsageHistory);
    formData.append("Model", data.Model);

    formData.append("Price", String(data.Price));
    formData.append("BrandId", String(data.BrandId));
    formData.append("CategoryId", String(data.CategoryId));

    // ===== FILES =====
    media.forEach((file) => {
        if (file.type.startsWith("image/")) {
            formData.append("Images", file);
        } else if (file.type.startsWith("video/")) {
            formData.append("Videos", file);
        }
    });

    return axiosClient.post("/Seller/vehicles", formData, {
        headers: {
            //  GHI ĐÈ header mặc định
            "Content-Type": undefined,
        },
    });
};

export const getMyVehicles = () => {
    return axiosClient.get("/Seller/vehicles");
};

export const getVehicleDetail = (id) => {
    return axiosClient.get(`/Seller/vehicles/${id}`);
};

export const updateVehicle = (id, data, media) => {
    // For now update uses JSON body, backend expects UpdateVehicleRequest [FromBody]
    // If backend changed to FromForm for update too, we'd use FormData.
    // Based on SellerController: [HttpPut("vehicles/{id:int}")] public async Task<IActionResult> Update(int id, [FromBody] UpdateVehicleRequest req)
    // So it's JSON body, no media upload in update for now? 
    // Wait, UpdateVehicleRequest might not include images.
    // Let's assume JSON body.
    return axiosClient.put(`/Seller/vehicles/${id}`, data);
};

export const hideVehicle = (id) => {
    return axiosClient.delete(`/Seller/vehicles/${id}`);
};

export const getRejectionReason = (id) => {
    return axiosClient.get(`/Seller/vehicles/${id}/rejection-reason`);
};

export const getInspectionReport = (id) => {
    return axiosClient.get(`/Seller/vehicles/${id}/inspection-report`);
};
