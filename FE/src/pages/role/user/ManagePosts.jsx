import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getMyVehicles, hideVehicle, getRejectionReason, getInspectionReport } from "@/service/SellAPI";
import { Eye, Trash2, FileText, AlertCircle, Edit } from "lucide-react";
import { useRolePath } from "@/hooks/useRolePath";

const ManagePosts = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState(null);
  const [inspectionReport, setInspectionReport] = useState(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const navigate = useNavigate();
  const { getPath } = useRolePath();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await getMyVehicles();
      const data = res?.data || res; // Handle if axios interceptor already unwraps
      if (Array.isArray(data)) {
        setVehicles(data);
      } else {
        setVehicles([]);
      }
    } catch (error) {
        // console.error(error);
      toast.error("Không thể tải danh sách tin đăng");
    } finally {
      setLoading(false);
    }
  };

  const handleHide = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn ẩn tin này?")) return;
    
    try {
      await hideVehicle(id);
      toast.success("Đã ẩn tin đăng thành công");
      fetchVehicles(); // Refresh list
    } catch (error) {
      toast.error("Lỗi khi ẩn tin đăng");
    }
  };

  const handleViewRejectReason = async (id) => {
    try {
      const res = await getRejectionReason(id);
      const data = res?.data || res;
      setRejectReason(data);
      setShowRejectDialog(true);
    } catch (error) {
      toast.error("Không thể tải lý do từ chối");
    }
  };

  const handleViewReport = async (id) => {
    try {
        const res = await getInspectionReport(id);
        const data = res?.data || res;  
        setInspectionReport(data);
        setShowReportDialog(true);
    } catch (error) {
        toast.error("Không thể tải báo cáo kiểm định");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    
    let colorClass = "bg-gray-100 text-gray-800";
    let label = status;

    if (s === "pending_admin") {
        colorClass = "bg-yellow-100 text-yellow-800";
        label = "Đang chờ duyệt";
    } else if (s === "pending_inspection") {
        colorClass = "bg-orange-100 text-orange-800";
        label = "Chờ kiểm định";
    } else if (s === "appproved") { // Some old data might be 'approved'
         colorClass = "bg-blue-100 text-blue-800";
         label = "Đã duyệt";
    } else if (s === "active") {
        colorClass = "bg-green-100 text-green-800";
        label = "Đang hiển thị";
    } else if (s === "rejected") {
        colorClass = "bg-red-100 text-red-800";
        label = "Bị từ chối";
    } else if (s === "hidden") {
        colorClass = "bg-gray-200 text-gray-600";
        label = "Đã ẩn";
    } else if (s === "sold") {
        colorClass = "bg-slate-100 text-slate-800";
        label = "Đã bán";
    } else if (s === "booked") { // In process
        colorClass = "bg-blue-50 text-blue-600";
        label = "Đã có khách đặt";
    } else if (s === "failed_inspection") {
        colorClass = "bg-red-50 text-red-600";
        label = "Kiểm định lỗi";
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
        {label}
      </span>
    );
  };

  // Đã gộp và giữ lại phiên bản xử lý tốt nhất
  const getChecklistStatusLabel = (status) => {
    if (!status) return "Chưa kiểm tra";
    const s = String(status).toLowerCase();
    const map = {
      "good": "Tốt",
      "fair": "Trung bình",
      "poor": "Kém",
      "bad": "Hỏng",
      "repair": "Cần sửa chữa",
      "replace": "Cần thay thế"
    };
    return map[s] || status;
  };

  if (loading) {
    return <div className="p-8 text-center">Đang tải danh sách tin...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý tin đăng</h1>
        <Button onClick={() => navigate(getPath('sell'))}>Đăng tin mới</Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên xe</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày đăng</TableHead>
              <TableHead>Kiểm định</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Bạn chưa đăng tin nào.
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((vehicle) => (
                <TableRow key={vehicle.vehicleId}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                        <span>{vehicle.name || "Không tên"}</span>
                        <span className="text-xs text-gray-400">ID: {vehicle.vehicleId}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(vehicle.price)}</TableCell>
                  <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                  <TableCell>{formatDate(vehicle.createdAt)}</TableCell>
                  <TableCell>
                    {vehicle.isInspected ? (
                      <span className="text-green-600 font-medium flex items-center gap-1">
                        <FileText className="w-4 h-4" /> Đã kiểm định
                      </span>
                    ) : (
                      <span className="text-gray-400">Chưa kiểm định</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {vehicle.status?.toLowerCase() !== "sold" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Xem chi tiết"
                            onClick={() => navigate(getPath(`Vehicle_Detail/${vehicle.vehicleId}`))}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            title="Ẩn tin"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleHide(vehicle.vehicleId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>

                          {vehicle.status?.toLowerCase() === "rejected" && (
                            <Button
                                variant="ghost"
                                size="icon"
                                title="Xem lý do từ chối"
                                className="text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                                onClick={() => handleViewRejectReason(vehicle.vehicleId)}
                            >
                                <AlertCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </>
                      )}

                      {vehicle.isInspected && (
                         <Button
                            variant="ghost"
                            size="icon"
                            title="Xem báo cáo kiểm định"
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleViewReport(vehicle.vehicleId)}
                        >
                            <FileText className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Reject Reason Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Lý do từ chối</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {rejectReason ? (
                <div className="space-y-2">
                    <p><strong>Lý do:</strong> {rejectReason.reason}</p>
                    <p className="text-sm text-gray-500">Ngày từ chối: {formatDate(rejectReason.rejectedDate)}</p>
                </div>
            ) : (
                <p>Đang tải...</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowRejectDialog(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inspection Report Dialog - Minimal view or JSON dump if no UI design yet */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Báo cáo kiểm định</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {inspectionReport ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="font-semibold text-sm text-gray-500">Kết quả:</p>
                            <span className={`font-bold ${inspectionReport.result === 'passed' ? 'text-green-600' : 'text-red-600'}`}>
                                {inspectionReport.result === 'passed' ? 'Đạt' : 'Không đạt'}
                            </span>
                        </div>
                        <div>
                            <p className="font-semibold text-sm text-gray-500">Mô tả:</p>
                            <p>{inspectionReport.description || "Không có mô tả"}</p>
                        </div>
                    </div>
                    
                    <div className="border rounded p-4 bg-gray-50 mt-4 space-y-2">
                        <h4 className="font-semibold mb-2 text-sm uppercase text-gray-700">Chi tiết kiểm tra:</h4>
                        
                        <div className="flex justify-between items-center border-b pb-2">
                             <span>Khung xe:</span>
                             <span className="font-medium">{getChecklistStatusLabel(inspectionReport.frameStatus)}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                             <span>Phanh:</span>
                             <span className="font-medium">{getChecklistStatusLabel(inspectionReport.brakeStatus)}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                             <span>Hệ thống truyền động:</span>
                             <span className="font-medium">{getChecklistStatusLabel(inspectionReport.drivetrainStatus)}</span>
                        </div>
                    </div>

                    {inspectionReport.reportFileUrl && (
                        <div className="mt-4">
                            <a 
                                href={inspectionReport.reportFileUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                            >
                                <FileText className="w-4 h-4" /> Xem báo cáo chi tiết (PDF)
                            </a>
                        </div>
                    )}
                </div>
            ) : (
                <p>Đang tải...</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowReportDialog(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ManagePosts;