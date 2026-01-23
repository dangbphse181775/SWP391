import { Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ProductCard = ({ product }) => {
  const {
    image,
    category,
    name,
    brand,
    condition,
    price,
    originalPrice,
    discount,
  } = product;

  return (
    <Card className="group overflow-hidden border transition-shadow hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        {discount && (
          <Badge className="absolute left-3 top-3 bg-red-500 hover:bg-red-600">
            -{discount}%
          </Badge>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-3 top-3 h-9 w-9 rounded-full bg-white/80 hover:bg-white"
        >
          <Heart className="h-5 w-5" />
        </Button>
      </div>

      <CardContent className="space-y-3 p-4">
        <div className="space-y-1">
          <p className="text-xs text-gray-600">{category}</p>
          <h3 className="font-semibold leading-tight">{name}</h3>
          <p className="text-sm text-gray-600">{brand}</p>
          <div className="pt-1">
            <Badge variant="secondary" className="text-xs">
              {condition}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="space-y-1">
            <p className="text-lg font-bold">{price}</p>
            {originalPrice && (
              <p className="text-sm text-gray-400 line-through">{originalPrice}</p>
            )}
          </div>
          <Button size="sm" variant="outline" className="text-sm">
            Xem Chi Tiết
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;