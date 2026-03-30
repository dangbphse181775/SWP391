import { Loader2 } from "lucide-react";
import ProductCard from "@/components/home/ProductCard";

export default function SimilarProducts({ products, loading }) {
    return (
        <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">SẢN PHẨM TƯƠNG TỰ</h2>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-black" />
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    Không có sản phẩm tương tự
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.vehicleId} product={product} />
                    ))}
                </div>
            )}
        </section>
    );
}
