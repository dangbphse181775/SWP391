import  React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";

export default function WishlistPage() {
    // Danh sách wishlist (ban đầu rỗng)
     const [wishlist, setWishlist] = useState([]);
  

  return (

    // Container chính, căn giữa và padding
    <div className="container  mx-auto py-10">

      <h1 className="text-2xl font-bold mb-6">
        My Wishlist
      </h1>
      
    {/* Nếu wishlist rỗng */}
      {wishlist.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Heart className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            Wishlist của bạn đang trống
          </p>
          <Button onClick={() => (window.location.href = "/products")}>
            Đi xem sản phẩm
          </Button>
        </div>
      )}
       
      {/* Nếu có sản phẩm */}
      <div className="grid gap-4">
        {wishlist.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <h2 className="font-semibold">{item.name}</h2>
                <p>${item.price}</p>
              </div>

              <Button
                variant="destructive"
                onClick={() =>
                  setWishlist(wishlist.filter((x) => x.id !== item.id))
                }
              >
                Xóa
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}