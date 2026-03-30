import { ImageOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function WishlistCard({ item, onRemove, onNavigate, imageError, onImageError }) {
    const formattedPrice = item.price
        ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price)
        : "N/A";

    return (
        <Card
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onNavigate(item.vehicleId)}
        >
            <div className="relative aspect-square bg-gray-100 overflow-hidden flex items-center justify-center">
                {imageError ? (
                    <div className="flex flex-col items-center justify-center w-full h-full bg-gray-200">
                        <ImageOff className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Không thể tải ảnh</p>
                    </div>
                ) : (
                    <img
                        src={item.thumbnailUrl || "/placeholder-bike.jpg"}
                        alt={item.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                        onError={() => onImageError(item.vehicleId)}
                        loading="lazy"
                    />
                )}
            </div>

            <CardContent className="p-4 flex flex-col gap-3">
                <div>
                    <h2 className="font-semibold line-clamp-2">{item.name || "Sản phẩm"}</h2>
                    <p className="text-lg font-bold text-red-600 mt-2">{formattedPrice}</p>
                </div>

                <div className="flex gap-2">
                    <Button
                        className="flex-1 bg-slate-800 text-white hover:bg-slate-700"
                        onClick={(e) => {
                            e.stopPropagation();
                            onNavigate(item.vehicleId);
                        }}
                    >
                        Xem chi tiết
                    </Button>

                    <Button
                        variant="outline"
                        className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(item.vehicleId);
                        }}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa khỏi danh sách yêu thích
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
