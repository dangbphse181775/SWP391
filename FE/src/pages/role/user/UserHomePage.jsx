import { useState, useEffect } from 'react';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import ProductSection from '@/components/home/ProductSection';
import productsApi from '@/service/productsApi';
import { getMyVehicles } from '@/service/SellAPI';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const UserHomePage = () => {
  const [productsByCategory, setProductsByCategory] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

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

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const data = await productsApi.getAllVehicles();

        let sellerVehicleIds = [];
        if (user) {
          try {
            // Fetch user's own vehicles to exclude them
            const myVehicles = await getMyVehicles();
            const vehiclesList = myVehicles?.data || myVehicles; // handle axios wrapper
            if (Array.isArray(vehiclesList)) {
              // The property is `vehicleId`, not `id`
              sellerVehicleIds = vehiclesList.map(v => v.vehicleId);
            }
          } catch (err) {
            // User might not be a seller or API failed, safe to ignore
            console.warn('Could not fetch user vehicles for filtering:', err);
          }
        }

        let normalizedData = data?.data || data; // handle axios wrapper
        // Safe check if data is array
        if (!Array.isArray(normalizedData)) {
          console.error('Invalid data format:', normalizedData);
          setProductsByCategory({});
          return;
        }

        // Group products by category
        const grouped = {};
        categories.forEach(cat => {
          grouped[cat] = [];
        });

        // Filter out vehicles that belong to the current user (the property is vehicleId)
        const filteredData = normalizedData.filter(product => !sellerVehicleIds.includes(product.vehicleId));

        filteredData.forEach(product => {
          const category = product.categoryName || 'Khác';
          if (grouped[category]) {
            grouped[category].push(product);
          } else {
            grouped['Khác'].push(product);
          }
        });

        setProductsByCategory(grouped);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProductsByCategory({});
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [user]);

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 space-y-2">
          <h2 className="text-3xl font-bold">SẢN PHẨM NỔI BẬT</h2>
          <p className="text-base text-gray-600">
            Khám phá bộ sưu tập xe đạp đa dạng cho mọi nhu cầu
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-black" />
          </div>
        ) : (
          <>
            {categories.map((category) => {
              const products = productsByCategory[category] || [];

              return (
                <ProductSection
                  key={category}
                  title={category}
                  products={products.slice(0, 4)}
                />
              );
            })}
          </>
        )}
      </div>

      <FeaturesSection />
    </div>
  );
};

export default UserHomePage;
