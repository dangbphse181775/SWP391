import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { createVehicle, getFeePreview } from "@/service/SellAPI";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";
import { useRolePath } from "@/hooks/useRolePath";
import MediaUploadSection from "./components/MediaUploadSection";
import { AlertTriangle, Wallet, Tag } from "lucide-react";


export default function Sell() {
  const [media, setMedia] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { getHomePath } = useRolePath();
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const [feePreview, setFeePreview] = useState(null);
  const [feeLoading, setFeeLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm();

  const priceValue = watch("Price");

  // Debounced fee preview
  useEffect(() => {
    const price = parseFloat(priceValue);
    if (!price || price <= 0) { setFeePreview(null); return; }
    const timer = setTimeout(async () => {
      try {
        setFeeLoading(true);
        const res = await getFeePreview(price);
        setFeePreview(res?.data ?? res);
      } catch {
        setFeePreview(null);
      } finally {
        setFeeLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [priceValue]);

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
    setPendingData(data);
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setConfirmOpen(false);
    setLoading(true);
    try {
      await createVehicle(pendingData, media);
      toast.success("Đăng xe thành công! Bài đăng đang chờ admin duyệt.");
      navigate(getHomePath());
    } catch (err) {
      const status = err?.response?.status;
      const body = err?.response?.data;
      if (status === 402) {
        const short = body?.amountShort ? formatVnd(body.amountShort) : "";
        toast.error(
          short
            ? `Số dư ví không đủ. Cần nạp thêm ${short} để đăng bài.`
            : (body?.message ?? "Đăng bài thất bại do số dư không đủ")
        );
      } else {
        toast.error(body?.message ?? "Đăng xe thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatVnd = (n) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

  return (
    <main className="flex-1 flex justify-center py-8 text-slate-900">
      <div className="max-w-[1488px] w-full px-6 grid grid-cols-12 gap-8">

        {/* Confirm modal */}
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmOpen(false)} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Xác nhận đăng bài</h2>
                {feePreview && (
                  <div className="w-full bg-slate-50 rounded-xl p-4 text-sm space-y-2 text-left">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Giá xe</span>
                      <span className="font-semibold">{formatVnd(feePreview.vehiclePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phí đăng bài ({feePreview.postingFeeRatePct})</span>
                      <span className="font-semibold text-red-600">-{formatVnd(feePreview.estimatedFee)}</span>
                    </div>
                    <hr className="border-slate-200" />
                    <p className="text-xs text-slate-400">
                      Số tiền trên sẽ được trừ trực tiếp từ ví của bạn. Bài đăng sẽ chờ admin duyệt.
                    </p>
                  </div>
                )}
                {!feePreview && (
                  <p className="text-sm text-slate-500">
                    Một khoản phí đăng bài sẽ được trừ từ ví của bạn.
                  </p>
                )}
              </div>
              <div className="mt-5 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmOpen(false)}>
                  Hủy
                </Button>
                <Button
                  className="flex-1 bg-black hover:bg-black/80 text-white"
                  onClick={handleConfirmSubmit}
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner message="" /> : "Đăng bài"}
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* LEFT – MEDIA */}
        <div className="col-span-12 lg:col-span-7">
          <MediaUploadSection
            media={media}
            fileInputRef={fileInputRef}
            onFilePick={openFilePicker}
            onDrop={handleDrop}
            onFileChange={handleFileChange}
            onRemove={removeMedia}
          />
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
                <div>
                  <Controller
                    control={control}
                    name="Price"
                    rules={{ required: "Giá bán là bắt buộc" }}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        type="text"
                        placeholder="Giá bán (VNĐ)"
                        value={value ? new Intl.NumberFormat("vi-VN").format(value) : ""}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          onChange(raw ? Number(raw) : "");
                        }}
                      />
                    )}
                  />
                  {errors.Price && (
                    <p className="text-red-500 text-sm mt-1">{errors.Price.message}</p>
                  )}
                </div>

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

              {/* Fee preview */}
              {feePreview && (
                <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-lg px-4 py-2.5 text-sm">
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <Tag className="w-4 h-4" />
                    Phí đăng bài ({feePreview.postingFeeRatePct})
                  </span>
                  <span className="font-bold text-amber-800">{formatVnd(feePreview.estimatedFee)}</span>
                </div>
              )}
              {feeLoading && (
                <p className="text-xs text-slate-400">Calculating fee...</p>
              )}

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
