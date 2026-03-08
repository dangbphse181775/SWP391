import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createVehicle } from "@/service/SellAPI";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";


export default function Sell() {
  const [media, setMedia] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // cleanup preview URL
  useEffect(() => {
    return () => {
      media.forEach((file) => file.preview && URL.revokeObjectURL(file.preview));
    };
  }, [media]);

  const processFiles = (files) => {
    const validFiles = files
      .filter(
        (file) =>
          file.type.startsWith("image/") || file.type.startsWith("video/")
      )
      .map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

    setMedia((prev) => [...prev, ...validFiles].slice(0, 10));
  };

  const handleFileChange = (e) => {
    processFiles(Array.from(e.target.files));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    processFiles(Array.from(e.dataTransfer.files));
  };

  const openFilePicker = () => {
    if (media.length < 10) fileInputRef.current?.click();
  };

  const removeMedia = (index) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    if (media.length === 0) {
      toast.warning("Vui lòng tải ít nhất 1 ảnh hoặc video");
      return;
    }
    setLoading(true);
    try {
      await createVehicle(data, media);
      toast.success("Đăng xe thành công");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Đăng xe thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex justify-center py-8 text-slate-900">
      <div className="max-w-[1488px] w-full px-6 grid grid-cols-12 gap-8">
        {/* LEFT – MEDIA */}
        <div className="col-span-12 lg:col-span-7">
          <div className="bg-white border border-slate-200 rounded-xl p-6 min-h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  Thư viện hình ảnh/video
                </h2>
                <p className="text-sm text-slate-500">
                  Tải lên ảnh hoặc video về xe của bạn (tối đa 10 mục).
                </p>
              </div>
              <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium">
                {media.length} / 10
              </span>
            </div>

            {/* Upload zone */}
            <div
              className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center
                ${media.length === 10
                  ? "border-slate-200 bg-slate-100 cursor-not-allowed"
                  : "border-slate-300 bg-slate-50 cursor-pointer hover:border-slate-400"
                }`}
              onClick={openFilePicker}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <Input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">
                add_a_photo
              </span>
              <p className="font-medium">Kéo và thả ảnh/video vào đây</p>
              <p className="text-sm text-slate-500 mb-2">
                hoặc bấm để chọn tệp
              </p>

              <Button
                variant="outline"
                type="button"
                disabled={media.length === 10}
                onClick={(e) => {
                  e.stopPropagation();
                  openFilePicker();
                }}
              >
                Chọn ảnh / video
              </Button>
            </div>

            {/* Preview */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              {media.map((file, idx) => (
                <div
                  key={file.preview}
                  className="relative aspect-square border rounded-lg overflow-hidden group"
                >
                  <button
                    type="button"
                    onClick={() => removeMedia(idx)}
                    className="absolute top-1 right-1 z-10 bg-white/80 hover:bg-red-500 hover:text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <span className="material-symbols-outlined text-base">
                      close
                    </span>
                  </button>

                  {file.type.startsWith("image/") ? (
                    <img
                      src={file.preview}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={file.preview}
                      className="w-full h-full object-cover"
                      muted
                    />
                  )}
                </div>
              ))}

              {media.length < 10 && (
                <div
                  onClick={openFilePicker}
                  className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-slate-400"
                >
                  <span className="material-symbols-outlined text-slate-400">
                    add
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT – FORM */}
        <div className="col-span-12 lg:col-span-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            {/* Thông tin xe */}
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Thông tin xe</h2>

              <Input
                className="mb-2"
                placeholder="Tên xe"
                {...register("Name", { required: "Tên xe là bắt buộc" })}
              />
              {errors.Name && (
                <p className="text-red-500 text-sm">{errors.Name.message}</p>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <select
                  className="h-10 border rounded-md px-3"
                  {...register("BrandId", { required: "Hãng xe là bắt buộc" })}
                >
                  <option value="">Hãng xe</option>
                  <option value="1">Trek</option>
                  <option value="2">Specialized</option>
                  <option value="3">Giant</option>
                  <option value="4">Cannondale</option>
                  <option value="5">Bianchi</option>
                  <option value="6">Pinarello</option>
                  <option value="7">Cervélo</option>
                  <option value="8">Scott</option>
                  <option value="9">Santa Cruz</option>
                  <option value="10">Colnago</option>
                  <option value="11">Khác</option>
                </select>

                <select
                  className="h-10 border rounded-md px-3"
                  {...register("CategoryId", {
                    required: "Loại xe là bắt buộc",
                  })}
                >
                  <option value="">Loại</option>
                  <option value="1">Xe đạp đường trường (Road Bike)</option>
                  <option value="2">Xe đạp địa hình (Mountain Bike - MTB)</option>
                  <option value="3">Xe đạp đường phố (City/Hybrid Bike)</option>
                  <option value="4">Xe đạp touring (Touring Bike)</option>
                  <option value="5">Xe đạp đua tính giờ (Time Trial/Triathlon)</option>
                  <option value="6">Xe đạp Gravel (Gravel Bike)</option>
                  <option value="7">Xe đạp biểu diễn (BMX)</option>
                  <option value="8">Xe đạp gấp (Folding Bike)</option>
                  <option value="9">Xe đạp điện thể thao (E-Bike)</option>
                  <option value="10">Khác</option>
                </select>
              </div>

              <Input
                className="mb-2"
                placeholder="Model (Năm sản xuất)"
                {...register("Model", { required: "Model là bắt buộc" })}
              />
            </section>

            {/* Giá & tình trạng */}
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">
                Giá & Tình trạng
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Giá bán (VNĐ)"
                  {...register("Price", {
                    required: "Giá bán là bắt buộc",
                    valueAsNumber: true,
                  })}
                />

                <select
                  className="h-10 border rounded-md px-3"
                  {...register("Condition", {
                    required: "Tình trạng là bắt buộc",
                  })}
                >
                  <option value="">Tình trạng</option>
                  <option value="100%: Mới">100%: Mới</option>
                  <option value="90%: Gần như mới">90%: Gần như mới</option>
                  <option value="80%: Đã qua sử dụng – Tốt">80%: Đã qua sử dụng – Tốt</option>
                  <option value="70%: Đã qua sử dụng – Khá">70%: Đã qua sử dụng – Khá</option>
                  <option value="60%: Đã qua sử dụng – Cũ">60%: Đã qua sử dụng – Cũ</option>
                  <option value="50%: Đã qua sử dụng – Cũ nhiều">50%: Đã qua sử dụng – Cũ nhiều</option>
                </select>
              </div>

              <Input
                placeholder="Kích thước khung"
                {...register("FrameSize", {
                  required: "Kích thước khung là bắt buộc",
                })}
              />
            </section>

            {/* Mô tả */}
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Mô tả</h2>

              <textarea
                className="w-full min-h-[120px] border rounded-md p-3 mb-2"
                placeholder="Mô tả chi tiết..."
                {...register("Description", {
                  required: "Mô tả là bắt buộc",
                })}
              />

              <Input
                placeholder="Lịch sử sử dụng"
                {...register("UsageHistory", {
                  required: "Lịch sử sử dụng là bắt buộc",
                })}
              />
            </section>

            <Button
              type="submit"
              className="w-full h-12 bg-slate-950 text-white rounded-xl font-bold hover:bg-slate-900"
              disabled={loading}
            >
              {loading ? <LoadingSpinner message="Đang đăng tin..." /> : "Đăng tin"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
