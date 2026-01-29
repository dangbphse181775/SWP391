import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Heart } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import productsApi from '@/service/productsApi';
import { useDebounce } from 'use-debounce';

const ProductsPage = () => {
  const [priceRange, setPriceRange] = useState([0, 100000000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [wishlist, setWishlist] = useState(JSON.parse(localStorage.getItem("wishlist")) || []
);
  // Debounce search query
  const [debouncedSearchQuery] = useDebounce(searchQuery, 1000);

  const categories = [
    'Xe đạp đường trường (Road Bike)',
    'Xe đạp địa hình (Mountain Bike - MTB)',
    'Xe đạp đường phố (City/Hybrid Bike)',
    'Xe đạp touring (Touring Bike)',
    'Xe đạp đua tính giờ (Time Trial/Triathlon)',
    'Xe đạp Gravel (Gravel Bike)',
    'Xe đạp biểu diễn (BMX)',
    'Xe đạp gấp (Folding Bike)',
    'Xe đạp điện thể thao (E-Bike)',
    'Khác',
  ];

  const brands = [
    'Trek', 'Specialized', 'Giant', 'Cannondale', 'Bianchi',
    'Pinarello', 'Cervélo', 'Scott', 'Santa Cruz', 'Colnago', 'Khác',
  ];

  const conditions = ['Mới 100%', 'Đã sử dụng', 'Còn mới 90%'];

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const data = await productsApi.getAllVehicles();
        setAllProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setAllProducts([]);
        setFilteredProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter products
  useEffect(() => {
    let filtered = [...allProducts];

    if (debouncedSearchQuery) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        product.brandName?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        product.model?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product =>
        selectedCategories.includes(product.categoryName)
      );
    }

    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product =>
        selectedBrands.includes(product.brandName)
      );
    }

    if (selectedConditions.length > 0) {
      filtered = filtered.filter(product =>
        selectedConditions.includes(product.condition)
      );
    }

    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedCategories, selectedBrands, selectedConditions, priceRange, sortBy, allProducts]);


  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleBrandToggle = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleConditionToggle = (condition) => {
    setSelectedConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedConditions([]);
    setPriceRange([0, 100000000]);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    console.log('Add to cart:', product);
  };

const toggleWishlist = (product) => {
  setWishlist(prev => {
    const exists = prev.find(p => p.vehicleId === product.vehicleId);

    let updated;

    if (exists) {
      updated = prev.filter(p => p.vehicleId !== product.vehicleId);
    } else {
      updated = [...prev, product];
    }

    localStorage.setItem("wishlist", JSON.stringify(updated));
    return updated;
  });
};

  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  // Pagination
  const itemsPerPage = 9;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm tracking-wide">
          <button className="text-gray-500 hover:text-black transition-colors uppercase font-medium text-xs">
            Trang chủ
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-black uppercase font-bold text-xs">Sản phẩm</span>
        </div>

        <div className="flex gap-10">
          {/* Sidebar Filter */}
          <aside className="w-64 shrink-0 hidden lg:block">
            <div className="sticky top-4 space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h2 className="text-sm font-bold uppercase tracking-wider">Bộ lọc</h2>
                <Button
                  variant="link"
                  className="text-xs text-gray-400 hover:text-black p-0 h-auto font-normal underline decoration-gray-300 hover:decoration-black"
                  onClick={handleClearFilters}
                >
                  Xóa tất cả
                </Button>
              </div>

              {/* Filter Sections */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold mb-4">Danh mục</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {categories.map((category) => (
                      <div key={category} className="flex items-start gap-3 group">
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                          className="mt-0.5 border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black rounded-none h-4 w-4"
                        />
                        <Label
                          htmlFor={`category-${category}`}
                          className="text-sm text-gray-600 cursor-pointer group-hover:text-black transition-colors leading-tight"
                        >
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold mb-4">Khoảng giá</h3>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={100000000}
                    step={1000000}
                    className="mb-4 [&_.absolute]:bg-black"
                  />
                  <div className="flex items-center justify-between text-xs font-medium text-gray-900">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold mb-4">Thương hiệu</h3>
                  <div className="space-y-3">
                    {brands.map((brand) => (
                      <div key={brand} className="flex items-center gap-3 group">
                        <Checkbox
                          id={`brand-${brand}`}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={() => handleBrandToggle(brand)}
                          className="border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black rounded-none h-4 w-4"
                        />
                        <Label
                          htmlFor={`brand-${brand}`}
                          className="text-sm text-gray-600 cursor-pointer group-hover:text-black transition-colors"
                        >
                          {brand}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold mb-4">Tình trạng</h3>
                  <div className="space-y-3">
                    {conditions.map((condition) => (
                      <div key={condition} className="flex items-center gap-3 group">
                        <Checkbox
                          id={`condition-${condition}`}
                          checked={selectedConditions.includes(condition)}
                          onCheckedChange={() => handleConditionToggle(condition)}
                          className="border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black rounded-none h-4 w-4"
                        />
                        <Label
                          htmlFor={`condition-${condition}`}
                          className="text-sm text-gray-600 cursor-pointer group-hover:text-black transition-colors"
                        >
                          {condition}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="relative w-full md:w-[450px]">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 bg-gray-100/80 hover:bg-white focus:bg-white border border-transparent focus:border-black rounded-full transition-all duration-300 outline-none shadow-sm placeholder:text-gray-400 text-sm font-medium"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                     {debouncedSearchQuery !== searchQuery ? (
                       <Loader2 className="h-4 w-4 animate-spin" />
                     ) : (
                       <Search className="h-4 w-4" />
                     )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4">
                 <p className="text-xs text-gray-500 font-medium uppercase tracking-wide whitespace-nowrap hidden sm:block">
                  {filteredProducts.length} Sản phẩm
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 whitespace-nowrap">Xếp theo:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[170px] h-10 border border-gray-200 bg-white rounded-md focus:ring-1 focus:ring-black focus:border-black text-sm font-medium">
                      <SelectValue placeholder="Tùy chọn" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      <SelectItem value="newest">Mới nhất</SelectItem>
                      <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                      <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
                      <SelectItem value="popular">Phổ biến nhất</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-black" />
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredProducts.length === 0 && (
              <div className="text-center py-32 border border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-900 font-medium mb-2">Không tìm thấy sản phẩm</p>
                <Button
                  variant="outline"
                  className="rounded-full border-black hover:bg-black hover:text-white transition-all px-6"
                  onClick={handleClearFilters}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            )}

            {/* Grid */}
            {!isLoading && paginatedProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {paginatedProducts.map((product) => (
                  <ProductCardDetailed
                    key={product.vehicleId}
                    product={product}
                    onAddToCart={handleAddToCart}
                    wishlist={wishlist}
                    onToggleWishlist={toggleWishlist}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && filteredProducts.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 border-t border-gray-100 pt-8">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-gray-100"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'ghost'}
                    className={`h-8 w-8 rounded-full text-xs font-medium transition-all ${
                      currentPage === page
                        ? 'bg-black text-white hover:bg-gray-800 scale-110'
                        : 'text-gray-500 hover:text-black hover:bg-gray-50'
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-gray-100"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};


const ProductCardDetailed = ({ product, wishlist, onToggleWishlist }) => {
  const {
    name,
    price,
    thumbnailUrl,
  } = product;

  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <div className="group cursor-pointer flex flex-col h-full bg-gray-50 rounded-lg border border-transparent hover:border-black hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <div className="relative aspect-square w-full bg-white overflow-hidden">
         {/* Wishlist button */}
         <button
           onClick={(e) => {
             e.stopPropagation();
             onToggleWishlist(product);
            }}
            className="absolute top-3 right-3 z-20 bg-white rounded-full p-2 shadow hover:scale-110 transition"
         >
            <Heart
              className={`h-5 w-5 ${
              wishlist.some(p => p.vehicleId === product.vehicleId)
                ? "fill-red-500 text-red-500"
                : "text-gray-400"
              }`}
            />
          </button>
          
        <img
          src={thumbnailUrl || '/placeholder-bike.jpg'}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={(e) => { e.target.src = '/placeholder-bike.jpg'; }}
        />
      </div>

      <div className="flex flex-col flex-1 gap-2 p-5 items-center justify-center text-center bg-gray-50 relative z-10">
        <h3 className="text-base font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-black transition-colors">
          {name}
        </h3>
        <span className="text-lg font-bold text-red-600">
          {formatPrice(price)}
        </span>
      </div>
    </div>
  );
};

export default ProductsPage;