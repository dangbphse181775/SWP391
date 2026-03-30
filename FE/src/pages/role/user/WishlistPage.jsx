import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Filter } from "lucide-react";
import WishlistAPI from "@/service/WishlistAPI";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import WishlistCard from "./components/WishlistCard";
import WishlistFilters from "./components/WishlistFilters";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('')

  // Filter states
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const navigate = useNavigate();

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await WishlistAPI.getWishlist();
      setWishlist((data || []).filter(item => item && item.vehicleId));
    } catch (err) {
      console.error('Fetch wishlist failed:', err);
      setError('Lỗi khi tải danh sách yêu thích');
      toast.error('Lỗi khi tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  useRefreshOnFocus(fetchWishlist);

  const handleRemoveFromWishlist = async (vehicleId) => {
    try {
      await WishlistAPI.removeWishlist(vehicleId);
      setWishlist(wishlist.filter((item) => item.vehicleId !== vehicleId));
      toast.success('Xóa khỏi danh sách yêu thích thành công!');
    } catch (err) {
      console.error('Remove from wishlist failed:', err);
      toast.error('Lỗi khi xóa khỏi danh sách yêu thích!');
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

        // Search filter 
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !item.name?.toLowerCase().includes(query) &&
          !item.brandName?.toLowerCase().includes(query) &&
          !item.model?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      
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
  }, [wishlist, priceRange, selectedBrand, selectedCategory, selectedStatus, selectedCondition, searchQuery]);

  // Clear all filters
  const clearFilters = () => {
    setPriceRange({ min: '', max: '' });
    setSelectedBrand('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedCondition('');
     setSearchQuery('');
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

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">
          My Wishlist
        </h1>
        <WishlistFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          selectedBrand={selectedBrand}
          onBrandChange={setSelectedBrand}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedCondition={selectedCondition}
          onConditionChange={setSelectedCondition}
          brands={brands}
          categories={categories}
          conditions={conditions}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
      </div>

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
              <WishlistCard
                key={item.vehicleId}
                item={item}
                onRemove={handleRemoveFromWishlist}
                onNavigate={(id) => navigate(`/Vehicle_Detail/${id}`)}
                imageError={imageLoadErrors[item.vehicleId]}
                onImageError={handleImageError}
              />
            ))}
        </div>
      )}
    </div>
  );
}

