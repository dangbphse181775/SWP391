import axiosClient from "./axiosClient";

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
