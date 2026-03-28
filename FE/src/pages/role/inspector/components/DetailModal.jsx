import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2, XCircle, ClipboardCheck, ChevronLeft, ChevronRight, User, Mail, CalendarDays, Tag, Bike, Ruler, ShieldCheck, History, FileText } from "lucide-react";
import { toast } from "sonner";
import * as InspectorAPI from "@/service/InspectorAPI";

/* ─── Constants ─────────────────────────────────────────── */
const CONDITION_OPTIONS = [
  { value: "good", label: "Tốt" },
  { value: "fair", label: "Trung bình" },
  { value: "poor", label: "Kém" },
];

const fmt = {
  price: (v) => Number(v || 0).toLocaleString("vi-VN") + " ₫",
  date: (iso) => iso ? new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—",
};

/* ─── Small sub-components ───────────────────────────────── */
function SectionTitle({ children }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">{children}</p>
  );
}

function InfoItem({ icon: Icon, label, value, mono, highlight }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-2.5">
      {Icon && <Icon className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />}
      <div className="min-w-0">
        <p className="text-[11px] text-gray-400 leading-none mb-0.5">{label}</p>
        <p className={`text-sm font-semibold break-words ${highlight ? "text-black font-black" : "text-black"} ${mono ? "font-mono" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function SelectRow({ label, value, onChange, disabled, error }) {
  return (
    <div className="space-y-1.5">
      <Label className={`text-xs font-semibold ${error ? "text-red-500" : "text-black"}`}>
        {label} <span className="text-red-400">*</span>
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={`w-full ${error ? "border-red-400 focus:ring-red-500" : "border-black focus:ring-black"}`}>
          <SelectValue placeholder="Chọn tình trạng..." />
        </SelectTrigger>
        <SelectContent className="bg-white border-black z-[200]">
          {CONDITION_OPTIONS.map(o => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-red-500">Vui lòng chọn tình trạng.</p>}
    </div>
  );
}

/* ─── Main Modal ─────────────────────────────────────────── */
export default function DetailModal({ open, onClose, bike, onSuccess }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [form, setForm] = useState({ frameStatus: "", brakeStatus: "", drivetrainStatus: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  /* fetch detail on open */
  useEffect(() => {
    if (!open || !bike?.id) return;
    setDetail(null);
    setActiveImg(0);
    setForm({ frameStatus: "", brakeStatus: "", drivetrainStatus: "", description: "" });
    setShowErrors(false);
    setLoading(true);
    InspectorAPI.getVehicleDetail(bike.id)
      .then(setDetail)
      .catch(() => toast.error("Không thể tải thông tin chi tiết xe."))
      .finally(() => setLoading(false));
  }, [open, bike?.id]);

  const isFormValid =
    !!form.frameStatus &&
    !!form.brakeStatus &&
    !!form.drivetrainStatus &&
    form.description.trim().length > 0;

  const handleSubmit = async (passed) => {
    if (!bike) return;
    if (!isFormValid) {
      setShowErrors(true);
      toast.error("Vui lòng điền đầy đủ thông tin kiểm định", {
        description: "Cần chọn tình trạng khung xe, phanh, truyền động và nhập nhận xét.",
      });
      return;
    }
    setSubmitting(true);
    try {
      await InspectorAPI.submitInspectionReport(bike.id, { ...form, passed, reportFileUrl: "" });
      toast.success(passed ? "Đã duyệt xe thành công!" : "Đã từ chối xe!", {
        description: `Xe "${bike.name}" đã được ${passed ? "duyệt" : "từ chối"}.`,
      });
      onSuccess(bike.id, passed);
      onClose();
    } catch (err) {
      toast.error("Có lỗi xảy ra", { description: err?.response?.data?.message || err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const d = detail;
  const images = d?.media?.filter(m => m.type === "image").map(m => m.url) ?? [];
  const mainImg = images.length > 0 ? images[activeImg] : (bike?.thumbnailUrl || "/placeholder.jpg");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* ĐIỂM QUAN TRỌNG NHẤT: Thêm !max-w-[1400px] để ghi đè giới hạn mặc định của Shadcn UI */}
      <DialogContent className="!max-w-[1400px] w-[95vw] h-[95vh] p-0 bg-white rounded-2xl overflow-hidden flex flex-col">

        {/* ── Header ── */}
        <DialogHeader className="px-6 py-4 border-b bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-black p-2 rounded-xl">
              <ClipboardCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-black">
                Phiếu kiểm định xe
              </DialogTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                {d?.name || bike?.name || "—"}
              </p>
            </div>
            <div className="ml-auto shrink-0">
              <Badge variant="outline" className="text-black border-black font-semibold">
                Chờ kiểm định
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* ── Body (cuộn độc lập 2 bên) ── */}
        <div className="flex-1 overflow-hidden flex flex-col bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-black" />
              <p className="text-sm text-gray-500">Đang tải thông tin xe...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-[1fr_420px] gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100 min-w-0 h-full">

              {/* ════ LEFT: Vehicle Info ════ */}
              <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                <SectionTitle>Thông tin xe</SectionTitle>

                {/* Image gallery */}
                <div className="relative rounded-xl overflow-hidden bg-gray-100 h-64 md:h-[400px] border border-black/10">
                  <img
                    src={mainImg}
                    alt={d?.name || bike?.name}
                    className="w-full h-full object-contain bg-gray-900/5"
                    onError={e => { e.currentTarget.src = "/placeholder.jpg"; }}
                  />
                  {/* Prev / Next */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white rounded-full p-1.5 transition"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setActiveImg(i => (i + 1) % images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white rounded-full p-1.5 transition"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                        {activeImg + 1} / {images.length}
                      </span>
                    </>
                  )}
                </div>

                {/* Thumbnail strip */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {images.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        onClick={() => setActiveImg(i)}
                        className={`h-16 w-16 shrink-0 object-cover rounded-lg cursor-pointer border-2 transition-all ${i === activeImg ? "border-black opacity-100" : "border-gray-200 opacity-60 hover:opacity-90"
                          }`}
                      />
                    ))}
                  </div>
                )}

                {/* Core info grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  <div className="col-span-2">
                    <InfoItem icon={Bike} label="Tên xe" value={d?.name || bike?.name} />
                  </div>
                  <InfoItem icon={Tag} label="Giá bán" value={fmt.price(d?.price ?? bike?.price)} highlight />
                  <InfoItem icon={CalendarDays} label="Ngày đăng" value={fmt.date(d?.createdAt)} />
                  <InfoItem icon={ShieldCheck} label="Thương hiệu" value={d?.brandName} />
                  <InfoItem icon={FileText} label="Danh mục" value={d?.categoryName} />
                  <InfoItem icon={History} label="Năm / Model" value={d?.model} />
                  <InfoItem icon={Ruler} label="Kích cỡ khung" value={d?.frameSize} />
                  <InfoItem icon={ShieldCheck} label="Tình trạng" value={d?.condition} />
                  <InfoItem icon={History} label="Lịch sử SD" value={d?.usageHistory} />
                </div>

                {/* Seller block */}
                <div className="rounded-xl border border-black/10 bg-gray-50 p-4 space-y-3 mt-4">
                  <SectionTitle>Thông tin người bán</SectionTitle>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem icon={User} label="Họ và tên" value={d?.sellerName} />
                    <InfoItem icon={Mail} label="Email" value={d?.sellerEmail} />
                  </div>
                </div>

                {/* Admin note (if any) */}
                {d?.adminNote && (
                  <div className="rounded-xl border border-black bg-white p-4 mt-4">
                    <p className="text-[11px] font-bold text-black uppercase tracking-widest mb-1">Ghi chú Admin</p>
                    <p className="text-sm text-black">{d.adminNote}</p>
                  </div>
                )}

                {/* Description */}
                {d?.description && (
                  <div className="mt-4">
                    <SectionTitle>Mô tả chi tiết</SectionTitle>
                    <div className="text-sm text-black whitespace-pre-line border border-black/10 rounded-xl p-4 bg-gray-50 leading-relaxed">
                      {d.description}
                    </div>
                  </div>
                )}
              </div>

              {/* ════ RIGHT: Inspection Form ════ */}
              <div className="p-6 space-y-5 bg-gray-50/50 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between">
                  <SectionTitle>Đánh giá &amp; Kiểm định</SectionTitle>
                  {showErrors && !isFormValid && (
                    <span className="text-xs font-semibold text-red-500">⚠ Chưa điền đủ thông tin</span>
                  )}
                </div>

                <div className="space-y-5">
                  <SelectRow
                    label="Tình trạng khung xe"
                    value={form.frameStatus}
                    onChange={v => setForm(p => ({ ...p, frameStatus: v }))}
                    disabled={submitting}
                    error={showErrors && !form.frameStatus}
                  />
                  <SelectRow
                    label="Tình trạng hệ thống phanh"
                    value={form.brakeStatus}
                    onChange={v => setForm(p => ({ ...p, brakeStatus: v }))}
                    disabled={submitting}
                    error={showErrors && !form.brakeStatus}
                  />
                  <SelectRow
                    label="Tình trạng truyền động"
                    value={form.drivetrainStatus}
                    onChange={v => setForm(p => ({ ...p, drivetrainStatus: v }))}
                    disabled={submitting}
                    error={showErrors && !form.drivetrainStatus}
                  />

                  <div className="space-y-1.5 pt-2">
                    <Label className={`text-xs font-semibold ${showErrors && !form.description.trim() ? "text-red-500" : "text-black"}`}>
                      Nhận xét / Ghi chú chi tiết <span className="text-red-400">*</span>
                    </Label>
                    <Textarea
                      value={form.description}
                      onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="Nhập nhận xét chi tiết về tình trạng xe sau khi kiểm tra..."
                      disabled={submitting}
                      rows={8}
                      className={`resize-none bg-white ${showErrors && !form.description.trim()
                          ? "border-red-400 focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-black focus:border-black"
                        }`}
                    />
                    {showErrors && !form.description.trim() && (
                      <p className="text-xs text-red-500 mt-1">Vui lòng nhập nhận xét kiểm định.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer actions ── */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-t bg-white">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Đóng
          </Button>

          <div className="flex gap-3">
            {/* Reject — red */}
            <Button
              onClick={() => handleSubmit(false)}
              disabled={submitting || loading}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Từ chối
            </Button>

            {/* Approve — green */}
            <Button
              onClick={() => handleSubmit(true)}
              disabled={submitting || loading}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Duyệt xe
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}