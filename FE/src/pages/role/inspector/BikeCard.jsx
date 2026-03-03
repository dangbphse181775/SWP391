import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { User } from "lucide-react";
const BADGE_STYLE = {
  "Chờ kiểm định":  { background:"#fef3c7", color:"#92400e", border:"1px solid #fcd34d" },
  "Đang kiểm định": { background:"#dbeafe", color:"#1e40af", border:"1px solid #93c5fd" },
  "Đã duyệt":       { background:"#d1fae5", color:"#065f46", border:"1px solid #6ee7b7" },
  "Từ chối":        { background:"#fee2e2", color:"#991b1b", border:"1px solid #fca5a5" },
};

export default function BikeCard({ bike, onViewDetail, onInspect }) {
    const badgeStyle = BADGE_STYLE[bike.status] || {};
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="relative h-48 overflow-hidden">
        <img src={bike.image} alt={bike.name} className="w-full h-full object-cover" />
        <span className="absolute top-2 right-2 text-xs font-semibold px-2.5 py-1 rounded-md" style={badgeStyle}>
          {bike.status}
        </span>
      </div>
      <CardContent className="p-4 pb-2">
        <h3 className="font-bold text-base text-foreground leading-tight">{bike.name}</h3>
        <p className="text-sm font-bold text-blue-600 mt-2">{bike.price.toLocaleString("vi-VN")} đ</p>
        <div className="flex items-center gap-1.5 mt-2">
          <User className="h-3 w-3 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{bike.owner}</p>
        </div>
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-2 gap-2">
  <Button
    size="sm"
    className="flex-1 text-xs"
    onClick={() => onViewDetail(bike)}
  >
    Chi tiết
  </Button>

  <Button
    size="sm"
    variant="secondary"
    className="flex-1 text-xs"
    onClick={() => onInspect(bike)}
  >
    Kiểm định
  </Button>
</CardFooter>
    </Card>
  );
}
