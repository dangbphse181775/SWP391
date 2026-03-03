import { useEffect, useState, useRef } from "react"
import * as InspectorAPI from "@/service/InspectorAPI"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function DetailModal({
  open,
  onClose,
  bike,
  type = "chitiet",  
  onApprove,
  onReject,
}) {
  const [vehicleDetail, setVehicleDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const fetchedRef = useRef(false)
  const prevBikeId = useRef(null)

  useEffect(() => {
    const fetchDetail = async () => {
      if (!bike?.id || !open) return
      
      // Reset khi bike thay đổi
      if (prevBikeId.current !== bike.id) {
        fetchedRef.current = false
        prevBikeId.current = bike.id
      }
      
      if (fetchedRef.current) return
      fetchedRef.current = true
      setError(null)

      try {
        setLoading(true)
        
        // GỌI API KHÁC NHAU dựa trên type
        let data;
        if (type === "kiemdinh") {
          data = await InspectorAPI.getVehicleInspectionDetails(bike.id)
        } else {
          data = await InspectorAPI.getVehicleById(bike.id)
        }
        
        setVehicleDetail(data)
      } catch (error) {
        console.error("Load vehicle detail error:", error)
        setError("Không thể tải chi tiết xe. Vui lòng thử lại.")
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
    // Thêm type vào dependency array
  }, [bike?.id, open, type])

  useEffect(() => {
    if (!open) {
      fetchedRef.current = false
      setVehicleDetail(null)
      setError(null)
    }
  }, [open])

  const d = vehicleDetail || bike

  // Xác định title dựa trên type
  const title = type === "kiemdinh" ? "Kiểm Định Xe" : "Chi Tiết Xe"

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>{title}</DialogTitle>
            <Badge variant={type === "kiemdinh" ? "destructive" : "outline"}>
              {d?.status || "Chờ kiểm định"}
            </Badge>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Đang tải chi tiết xe...
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Hiển thị lịch sử kiểm định nếu type = kiemdinh */}
            {type === "kiemdinh" && d?.inspectionHistory && d.inspectionHistory.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  📋 Lịch Sử Kiểm Định
                </h3>
                <div className="space-y-2">
                  {d.inspectionHistory.map((item, index) => (
                    <div key={index} className="text-sm flex justify-between">
                      <span>{item.date}</span>
                      <span className={item.passed ? "text-green-600" : "text-red-600"}>
                        {item.passed ? "✅ Đạt" : "❌ Không đạt"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/*  Hiển thị vấn đề nếu type = kiemdinh */}
            {type === "kiemdinh" && d?.issues && d.issues.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  ⚠️ Vấn Đề Phát Hiện
                </h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {d.issues.map((issue, index) => (
                    <li key={index} className="text-red-700 dark:text-red-300">
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hình ảnh & Thông tin xe */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Image */}
              <div>
                <img
                  src={d?.thumbnailUrl || "/placeholder.jpg"}
                  alt={d?.name}
                  className="w-full h-[260px] object-cover rounded-lg border"
                />
              </div>

              {/* Info */}
              <div className="space-y-4 text-sm">
                <div>
                  <h2 className="text-xl font-bold">
                    {d?.name}
                  </h2>
                  <p className="text-blue-600 text-lg font-bold mt-1">
                    {(d?.price || 0).toLocaleString("vi-VN")} đ
                  </p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Thương hiệu</p>
                    <p className="font-medium">{d?.brandName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Loại xe</p>
                    <p className="font-medium">{d?.categoryName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Model</p>
                    <p className="font-medium">{d?.model}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Kích thước khung</p>
                    <p className="font-medium">{d?.frameSize}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tình trạng</p>
                    <p className="font-medium">{d?.condition}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ngày gửi</p>
                    <p className="font-medium">
                      {d?.createdAt
                        ? new Date(d.createdAt).toLocaleDateString("vi-VN")
                        : ""}
                    </p>
                  </div>
                </div>
                {d?.description && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Mô tả</p>
                      <p className="text-sm">{d.description}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chỉ hiển thị nút Duyệt/Từ chối khi là mode kiểm định */}
        <DialogFooter className="mt-6 gap-2">
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
          
          {type === "kiemdinh" && (
            <>
              <Button variant="destructive" onClick={() => onReject(d?.id)}>
                Từ chối
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => onApprove(d?.id)}
              >
                Duyệt
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}