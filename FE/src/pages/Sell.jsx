import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

export default function Sell() {
  const [media, setMedia] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // react-hook-form setup
  const { register, handleSubmit, formState: { errors } } = useForm();

  // cleanup object URLs
  useEffect(() => {
    return () => {
      media.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [media]);

  const processFiles = (files) => {
    const validFiles = files
      .filter(
        (file) =>
          file.type.startsWith("image") || file.type.startsWith("video")
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
    fileInputRef.current?.click();
  };

  const removeMedia = (index) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  // Xử lý submit form
  const onSubmit = (data) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    // Xử lý đăng tin ở đây
    // xử lí xong nhớ xóa alert 
    alert("Đã đăng nhập, xử lý publish...");
  };

  return (
    <main className="flex-1 flex justify-center py-8 text-slate-900">
      <div className="max-w-[1488px] w-full px-6 grid grid-cols-12 gap-8">
        {/* LEFT – MEDIA */}
        <div className="col-span-12 lg:col-span-7">
          <div className="bg-white border border-slate-200 rounded-xl p-6 min-h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Media Gallery</h2>
                <p className="text-sm text-slate-500">
                  Upload photos or videos of your bike (max 10).
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
              onClick={media.length < 10 ? openFilePicker : undefined}
              onDrop={media.length < 10 ? handleDrop : undefined}
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
              <p className="font-medium">
                Drag & drop media here
              </p>
              <p className="text-sm text-slate-500 mb-2">
                or click to browse
              </p>
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  openFilePicker();
                }}
                disabled={media.length === 10}
              >
                Chọn ảnh / video
              </Button>
            </div>
            {/* Preview grid */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              {media.map((file, idx) => (
                <div
                  key={file.name + file.size}
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
                  {file.type.startsWith("image") ? (
                    <img
                      src={file.preview}
                      className="w-full h-full object-cover"
                      alt=""
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
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Vehicle Identity</h2>
              <Input
                className="w-full h-10 border rounded-md px-3 mb-2"
                placeholder="Title"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && <p className="text-red-500 text-sm mb-2">{errors.title.message}</p>}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <select className="h-10 border rounded-md px-3" {...register("brand", { required: "Brand is required" })}>
                  <option value="">Brand</option>
                  <option value="Giant">Giant</option>
                  <option value="Trek">Trek</option>
                  <option value="Specialized">Specialized</option>
                </select>
                <select className="h-10 border rounded-md px-3" {...register("category", { required: "Category is required" })}>
                  <option value="">Category</option>
                  <option value="Road">Road</option>
                  <option value="Mountain">Mountain</option>
                </select>
              </div>
              {errors.brand && <p className="text-red-500 text-sm mb-2">{errors.brand.message}</p>}
              {errors.category && <p className="text-red-500 text-sm mb-2">{errors.category.message}</p>}
              <Input
                className="w-full h-10 border rounded-md px-3 mb-2"
                type="number"
                placeholder="Model year"
                {...register("modelYear", { required: "Model year is required" })}
              />
              {errors.modelYear && <p className="text-red-500 text-sm mb-2">{errors.modelYear.message}</p>}
            </section>
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Pricing & Condition</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Input
                  className="h-10 border rounded-md px-3"
                  type="number"
                  placeholder="Price ($)"
                  {...register("price", { required: "Price is required" })}
                />
                <select className="h-10 border rounded-md px-3" {...register("condition", { required: "Condition is required" })}>
                  <option value="">Condition</option>
                  <option value="New">New</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                </select>
              </div>
              {errors.price && <p className="text-red-500 text-sm mb-2">{errors.price.message}</p>}
              {errors.condition && <p className="text-red-500 text-sm mb-2">{errors.condition.message}</p>}
              <Input
                className="w-full h-10 border rounded-md px-3 mb-2"
                placeholder="Frame size"
                {...register("frameSize", { required: "Frame size is required" })}
              />
              {errors.frameSize && <p className="text-red-500 text-sm mb-2">{errors.frameSize.message}</p>}
            </section>
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Description</h2>
              <textarea
                className="w-full min-h-[120px] border rounded-md p-3 mb-2"
                placeholder="Full description..."
                {...register("description", { required: "Description is required" })}
              />
              {errors.description && <p className="text-red-500 text-sm mb-2">{errors.description.message}</p>}
              <Input
                className="w-full h-10 border rounded-md px-3 mb-2"
                placeholder="Usage history"
                {...register("usageHistory", { required: "Usage history is required" })}
              />
              {errors.usageHistory && <p className="text-red-500 text-sm mb-2">{errors.usageHistory.message}</p>}
            </section>
            <Button
              className="w-full h-12 bg-slate-950 text-white rounded-xl font-bold hover:bg-slate-900"
              type="submit"
            >
              Publish
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
