import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Tag, ClipboardCheck } from "lucide-react";

const formatPrice = (price) =>
  Number(price || 0).toLocaleString("vi-VN") + " ₫";

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function BikeCard({ bike, onAction }) {
  return (
    <Card className="group overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">
      {/* ── Thumbnail ── */}
      <div className="relative h-52 overflow-hidden bg-gray-100">
        <img
          src={bike.thumbnailUrl || "/placeholder.jpg"}
          alt={bike.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { e.currentTarget.src = "/placeholder.jpg"; }}
        />
        <div className="absolute top-3 left-3">
          <Badge variant="outline" className="bg-white text-black border-black text-[11px] font-semibold">
            Chờ kiểm định
          </Badge>
        </div>
      </div>

      {/* ── Body ── */}
      <CardContent className="p-4 flex flex-col flex-1 gap-3">
        {/* Name */}
        <h3 className="font-bold text-black text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
          {bike.name || "Xe không có tên"}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 text-black shrink-0" />
          <span className="text-black font-black text-base">
            {formatPrice(bike.price)}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span>
            Đăng ngày: <strong className="text-black">{formatDate(bike.createdAt)}</strong>
          </span>
        </div>

        <Separator />

        {/* Action */}
        <Button
          onClick={() => onAction(bike)}
          className="w-full gap-2 bg-black text-white hover:bg-white hover:text-black hover:border hover:border-black transition-all duration-150"
        >
          <ClipboardCheck className="h-4 w-4" />
          Xem chi tiết &amp; Kiểm định
        </Button>
      </CardContent>
    </Card>
  );
}
