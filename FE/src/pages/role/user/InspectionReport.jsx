import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';
import { getInspectionReport } from "@/service/SellAPI";
import vehicleDetailApi from "@/service/VehicleDetailAPI"; 

// =====================
// HELPER
// =====================
function formatPrice(p) {
  if (!p) return "—";
  return Number(p).toLocaleString("vi-VN") + " đ";
}

function ChecklistStatusBadge({ status }) {
  if (status === "good") {
    return (
      <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Good
      </span>
    );
  }
  if (status === "Replace Soon") {
    return (
      <span className="flex items-center gap-1.5 text-amber-500 font-semibold text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        Replace Soon
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-red-500 font-semibold text-sm">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
      </svg>
      {status}
    </span>
  );
}

// =====================
// MAIN COMPONENT
// =====================
export default function InspectionReport() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getInspectionReport(id),
      vehicleDetailApi.getVehicleDetail(id)
    ])
    .then(([reportRes, vehicleRes]) => {
      console.log("reportRes:", reportRes);
      console.log("vehicleRes:", vehicleRes);
      setReport(reportRes);
      setVehicle(vehicleRes);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="text-sm">Đang tải báo cáo...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-500">Không tìm thấy báo cáo kiểm định.</p>
      </div>
    );
  }

  const isPassed = report.result === "passed";
  const formattedDate = report.createdAt
    ? new Date(report.createdAt).toLocaleDateString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
      })
    : "—";

  const vehicleImage = vehicle?.media?.[0]?.url;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-8 py-8 space-y-6">

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-800">Seller View Inspection Report</h1>

        {/* Vehicle Information */}
        <Card className="shadow-none border-slate-200">
          <CardContent className="p-6">
            <h2 className="text-base font-bold text-slate-800 mb-4">Vehicle Information</h2>
            <div className="flex gap-6">
              {/* Ảnh xe */}
              {vehicleImage ? (
                <img
                  src={vehicleImage}
                  alt={vehicle?.name}
                  className="w-48 h-36 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                />
              ) : (
                <div className="w-48 h-36 bg-slate-100 rounded-lg border border-slate-200 flex-shrink-0 flex items-center justify-center text-slate-400 text-xs">
                  Không có ảnh
                </div>
              )}

              {/* Thông tin xe */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-800 mb-4">{vehicle?.name || report.vehicleName}</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <div className="text-slate-500">
                    ID: <span className="text-slate-800 font-medium">{report.vehicleId}</span>
                  </div>
                  <div className="text-slate-500">
                    Model: <span className="text-slate-800 font-medium">{vehicle?.model || "—"}</span>
                  </div>
                  <div className="text-slate-500">
                    Tình trạng: <span className="text-slate-800 font-medium">{vehicle?.condition || "—"}</span>
                  </div>
                  <div className="text-slate-500">
                    Giá: <span className="text-slate-800 font-medium">{formatPrice(vehicle?.price)}</span>
                  </div>
                  <div className="text-slate-500">
                    Frame Size: <span className="text-slate-800 font-medium">{vehicle?.frameSize || "—"}</span>
                  </div>
                  <div className="text-slate-500">
                    Trạng thái: <span className="text-slate-800 font-medium">{vehicle?.status || report.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inspection Status */}
        <div className={`rounded-lg border-l-4 p-5 flex items-start gap-4
          ${isPassed ? "bg-emerald-50 border-emerald-500" : "bg-red-50 border-red-500"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            className={isPassed ? "text-emerald-600 mt-0.5" : "text-red-500 mt-0.5"}
          >
            {isPassed
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              : <><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>
            }
          </svg>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">Inspection Result:</span>
              <Badge className={isPassed
                ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                : "bg-red-500 hover:bg-red-500 text-white"
              }>
                {report.result.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-slate-600">
              Ngày kiểm định: <span className="font-medium">{formattedDate}</span>
            </p>
          </div>
        </div>

        {/* Inspection Checklist */}
        <Card className="shadow-none border-slate-200">
          <CardContent className="p-6">
            <h2 className="text-base font-bold text-slate-800 mb-4">Inspection Checklist</h2>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="grid grid-cols-2 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <span>Item</span>
                <span>Status</span>
              </div>
              <Separator />
              {[
                { item: "Khung xe", status: report.frameStatus },
                { item: "Phanh", status: report.brakeStatus },
                { item: "Hệ thống truyền động", status: report.drivetrainStatus },
              ].map((row, i) => (
                <div key={i}>
                  <div className="grid grid-cols-2 px-4 py-4 items-center text-sm">
                    <span className="text-slate-700">{row.item}</span>
                    <ChecklistStatusBadge status={row.status} />
                  </div>
                  {i < 2 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Inspector's Notes */}
        <Card className="shadow-none border-slate-200">
          <CardContent className="p-6">
            <h2 className="text-base font-bold text-slate-800 mb-3">Inspector's Notes</h2>
            <p className="text-sm text-slate-600">{report.description || "Không có ghi chú."}</p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 pb-8">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 h-11 text-sm font-semibold shadow-none"
            onClick={() => toast.success("Đã Đăng bán xe!")}
          >
            Đăng bán xe
          </Button>
          <Button
            variant="outline"
            className="px-10 h-11 text-sm font-semibold shadow-none"
            onClick={() => toast.warning("Đã gửi yêu cầu tái kiểm định!")}
          >
            Yêu cầu tái kiểm định
          </Button>
        </div>

      </div>
    </div>
  );
}