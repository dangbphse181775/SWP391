import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Search } from "lucide-react";

export default function WishlistFilters({
    searchQuery,
    onSearchChange,
    priceRange,
    onPriceRangeChange,
    selectedBrand,
    onBrandChange,
    selectedCategory,
    onCategoryChange,
    selectedStatus,
    onStatusChange,
    selectedCondition,
    onConditionChange,
    brands,
    categories,
    conditions,
    hasActiveFilters,
    onClearFilters,
}) {
    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-center">
                {/* Search Bar */}
                <div className="relative w-full md:w-[350px]">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 bg-gray-100/80 hover:bg-white focus:bg-white border border-transparent focus:border-black rounded-full transition-all duration-300 outline-none shadow-sm placeholder:text-gray-400 text-sm font-medium"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                            <Search className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="flex flex-wrap gap-4 items-center">
                    {/* Price Range */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Giá:</span>
                        <Input
                            type="number"
                            placeholder="Min"
                            value={priceRange.min}
                            onChange={(e) => onPriceRangeChange({ ...priceRange, min: e.target.value })}
                            className="w-20 h-8"
                        />
                        <span className="text-sm">-</span>
                        <Input
                            type="number"
                            placeholder="Max"
                            value={priceRange.max}
                            onChange={(e) => onPriceRangeChange({ ...priceRange, max: e.target.value })}
                            className="w-20 h-8"
                        />
                    </div>

                    {/* Brand */}
                    <Select value={selectedBrand} onValueChange={onBrandChange}>
                        <SelectTrigger className="w-32 h-8">
                            <SelectValue placeholder="Thương hiệu" />
                        </SelectTrigger>
                        <SelectContent>
                            {brands.map((brand) => (
                                <SelectItem key={brand} value={brand}>
                                    {brand}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Category */}
                    <Select value={selectedCategory} onValueChange={onCategoryChange}>
                        <SelectTrigger className="w-32 h-8">
                            <SelectValue placeholder="Danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                    {category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Status */}
                    <Select value={selectedStatus} onValueChange={onStatusChange}>
                        <SelectTrigger className="w-32 h-8">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Condition */}
                    <Select value={selectedCondition} onValueChange={onConditionChange}>
                        <SelectTrigger className="w-32 h-8">
                            <SelectValue placeholder="Tình trạng" />
                        </SelectTrigger>
                        <SelectContent>
                            {conditions.map((condition) => (
                                <SelectItem key={condition} value={condition}>
                                    {condition}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <Button variant="outline" size="sm" onClick={onClearFilters} className="h-8">
                            <X className="w-4 h-4 mr-1" />
                            Xóa bộ lọc
                        </Button>
                    )}
                </div>
            </div>

            {/* Active Filter Badges */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {priceRange.min && (
                        <Badge variant="secondary">
                            Giá từ:{" "}
                            {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                            }).format(priceRange.min)}
                        </Badge>
                    )}
                    {priceRange.max && (
                        <Badge variant="secondary">
                            Giá đến:{" "}
                            {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                            }).format(priceRange.max)}
                        </Badge>
                    )}
                    {selectedBrand && (
                        <Badge variant="secondary">Thương hiệu: {selectedBrand}</Badge>
                    )}
                    {selectedCategory && (
                        <Badge variant="secondary">Danh mục: {selectedCategory}</Badge>
                    )}
                    {selectedStatus && (
                        <Badge variant="secondary">Trạng thái: {selectedStatus}</Badge>
                    )}
                    {selectedCondition && (
                        <Badge variant="secondary">Tình trạng: {selectedCondition}</Badge>
                    )}
                </div>
            )}
        </div>
    );
}
