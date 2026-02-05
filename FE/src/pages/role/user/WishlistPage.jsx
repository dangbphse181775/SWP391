import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Heart, Trash2, ImageOff, Filter, X } from "lucide-react";
import WishlistAPI from "@/service/WishlistAPI";
import { useNavigate } from 'react-router-dom';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoadErrors, setImageLoadErrors] = useState({});

  // Filter states
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');

  useEffect(() => {
    fetchWishlist();
  }, []);

  const navigate = useNavigate();

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await WishlistAPI.getWishlist();
      setWishlist((data || []).filter(item => item && item.vehicleId));
    } catch (err) {
      console.error('Fetch wishlist failed:', err);
      setError('Lỗi khi tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (vehicleId) => {
    try {
      await WishlistAPI.removeWishlist(vehicleId);
      setWishlist(wishlist.filter((item) => item.vehicleId !== vehicleId));
    } catch (err) {
      console.error('Remove from wishlist failed:', err);
      alert('Lỗi khi xóa khỏi danh sách yêu thích!');
    }
  };

  const handleImageError = (vehicleId) => {
    setImageLoadErrors(prev => ({
      ...prev,
      [vehicleId]: true
    }));
  };

  // Get unique values for filter options
  const brands = useMemo(() => {
    return [...new Set(
      wishlist
        .map(i => i?.brandName)
        .filter(b => typeof b === 'string' && b.trim().length > 0)
    )].sort();
  }, [wishlist]);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(wishlist.map(item => item.categoryName).filter(Boolean))];
    return uniqueCategories.sort();
  }, [wishlist]);

  const conditions = useMemo(() => {
    const uniqueConditions = [...new Set(wishlist.map(item => item.condition).filter(Boolean))];
    return uniqueConditions.sort();
  }, [wishlist]);

  // Filter wishlist based on selected filters
  const filteredWishlist = useMemo(() => {
    return wishlist.filter(item => {
      // Price filter
      if (priceRange.min && item.price < parseFloat(priceRange.min)) return false;
      if (priceRange.max && item.price > parseFloat(priceRange.max)) return false;

      // Brand filter
      if (selectedBrand && item.brandName !== selectedBrand) return false;

      // Category filter
      if (selectedCategory && item.categoryName !== selectedCategory) return false;

      // Status filter
      if (selectedStatus && item.status !== selectedStatus) return false;

      // Condition filter
      if (selectedCondition && item.condition !== selectedCondition) return false;

      return true;
    });
  }, [wishlist, priceRange, selectedBrand, selectedCategory, selectedStatus, selectedCondition]);

  // Clear all filters
  const clearFilters = () => {
    setPriceRange({ min: '', max: '' });
    setSelectedBrand('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedCondition('');
  };

  // Check if any filters are active
  const hasActiveFilters = priceRange.min || priceRange.max || selectedBrand || selectedCategory || selectedStatus || selectedCondition;

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-center">Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-center text-red-600">{error}</p>
      </div>
    );
  }

  return (

    // Container chính, căn giữa và padding
    <div className="container  mx-auto py-10">

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <h1 className="text-2xl font-bold">
          My Wishlist
        </h1>

        {/* Filter Section */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Price Range Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Giá:</span>
            <Input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="w-20 h-8"
            />
            <span className="text-sm">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="w-20 h-8"
            />
          </div>

          {/* Brand Filter */}
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue placeholder="Thương hiệu" />
            </SelectTrigger>
            <SelectContent>
              {brands.map(brand => (
                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          {/* Condition Filter */}
          <Select value={selectedCondition} onValueChange={setSelectedCondition}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue placeholder="Tình trạng" />
            </SelectTrigger>
            <SelectContent>
              {conditions.map(condition => (
                <SelectItem key={condition} value={condition}>{condition}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="h-8"
            >
              <X className="w-4 h-4 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {priceRange.min && (
            <Badge variant="secondary">
              Giá từ: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceRange.min)}
            </Badge>
          )}
          {priceRange.max && (
            <Badge variant="secondary">
              Giá đến: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceRange.max)}
            </Badge>
          )}
          {selectedBrand && <Badge variant="secondary">Thương hiệu: {selectedBrand}</Badge>}
          {selectedCategory && <Badge variant="secondary">Danh mục: {selectedCategory}</Badge>}
          {selectedStatus && <Badge variant="secondary">Trạng thái: {selectedStatus}</Badge>}
          {selectedCondition && <Badge variant="secondary">Tình trạng: {selectedCondition}</Badge>}
        </div>
      )}

      {/* Results count */}
      {wishlist.length > 0 && (
        <div className="mb-4 text-sm text-muted-foreground">
          Hiển thị {filteredWishlist.length} / {wishlist.length} sản phẩm
        </div>
      )}

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

      {/* Nếu có sản phẩm nhưng không có kết quả lọc */}
      {wishlist.length > 0 && filteredWishlist.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Filter className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            Không tìm thấy sản phẩm nào phù hợp với bộ lọc
          </p>
          <Button onClick={clearFilters} variant="outline">
            Xóa bộ lọc
          </Button>
        </div>
      )}

      {/* Nếu có sản phẩm */}
      {filteredWishlist.length > 0 && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredWishlist.map((item) => (
              <Card key={item.vehicleId} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/Vehicle_Detail/${item.vehicleId}`)}>
            <div className="relative aspect-square bg-gray-100 overflow-hidden flex items-center justify-center">
              {imageLoadErrors[item.vehicleId] ? (
                <div className="flex flex-col items-center justify-center w-full h-full bg-gray-200">
                  <ImageOff className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Không thể tải ảnh</p>
                </div>
              ) : (
                <img
                  src={item.thumbnailUrl || '/placeholder-bike.jpg'}
                  alt={item.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                  onError={() => handleImageError(item.vehicleId)}
                  loading="lazy"
                />
              )}
            </div>
            <CardContent className="p-4 flex flex-col gap-3">
              <div>
                <h2 className="font-semibold line-clamp-2">{item.name || 'Sản phẩm'}</h2>
                <p className="text-lg font-bold text-red-600 mt-2">
                  {item.price ? new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(item.price) : 'N/A'}
                </p>
              </div>

              <div className="flex gap-2">
  <Button
    className="flex-1 bg-slate-800 text-white hover:bg-slate-700"
    onClick={(e) => { 
      e.stopPropagation(); 
      navigate(`/Vehicle_Detail/${item.vehicleId}`);
    }}
  >
    Xem chi tiết
  </Button>

  <Button
    variant="outline"
    className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
    onClick={(e) => { 
      e.stopPropagation(); 
      handleRemoveFromWishlist(item.vehicleId); 
    }}
  >
    <Trash2 className="w-4 h-4 mr-2" />
    Xóa khỏi danh sách yêu thích
  </Button>
</div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </div>
  );
}

