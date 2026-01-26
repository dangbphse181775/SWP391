import HeroSection from '@/components/home/HeroSection';
import ProductSection from '@/components/home/ProductSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import { mockProducts } from '@/data/mockProducts';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 space-y-2">
          <h2 className="text-3xl font-bold">SẢN PHẨM NỔI BẬT</h2>
          <p className="text-base text-gray-600">
            Khám phá bộ sưu tập xe đạp đa dạng cho mọi nhu cầu
          </p>
        </div>

        {/* Street Bikes */}
        <ProductSection
          title="Xe đạp thể thao đường phố"
          products={mockProducts.streetBikes}
        />

        {/* Mountain Bikes */}
        <ProductSection
          title="Xe đạp địa hình"
          products={mockProducts.mountainBikes}
        />

        {/* Racing Bikes */}
        <ProductSection
          title="Xe đạp đua"
          products={mockProducts.racingBikes}
        />
      </div>

      {/* Features Section */}
      <FeaturesSection />
    </div>
  );
};

export default HomePage;