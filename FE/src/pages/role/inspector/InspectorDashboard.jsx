import DetailModal from '@/pages/role/inspector/components/DetailModal';
import BikeCard from '@/pages/role/inspector/components/BikeCard';
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast, Toaster } from "sonner";
import { Search, X, Loader2 } from "lucide-react";
import { useDebounce } from "use-debounce";
import * as InspectorAPI from "@/service/InspectorAPI";
import InspectorSidebar from '@/components/admin/InspectorSidebar';

export default function InspectorDashboard() {
  const [bikes, setBikes] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebounce(searchInput, 400);
  const [selectedBike, setSelectedBike] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setPageLoading(true);
        const data = await InspectorAPI.getPendingVehicles();
        setBikes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("API Error:", err);
        toast.error("Lỗi tải dữ liệu", {
          description: "Không thể kết nối API. Vui lòng kiểm tra backend.",
        });
        setBikes([]);
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = bikes.filter(b => {
    const q = debouncedSearch.toLowerCase();
    return !q || (b.name || "").toLowerCase().includes(q);
  });

  const isSearching = searchInput !== debouncedSearch;

  const handleAction = (bike) => {
    setSelectedBike(bike);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedBike(null);
  };

  const handleSuccess = (vehicleId, passed) => {
    setBikes(p =>
      p.map(b =>
        b.id === vehicleId
          ? { ...b, status: passed ? "Đã duyệt" : "Từ chối" }
          : b
      )
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <InspectorSidebar />
      <Toaster richColors position="bottom-right" />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Page header */}
        <div className="px-6 py-4 border-b bg-white">
          <h1 className="text-xl font-bold text-gray-900">
            Hệ thống kiểm định xe
          </h1>
        </div>

      <main className="flex-1 overflow-y-auto p-6">
        {/* Search */}
        <Card className="mb-5">
          <CardContent className="p-5">
            <h2 className="text-xl font-black tracking-tight text-gray-900 mb-1">
              DANH SÁCH KIỂM ĐỊNH
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Quản lý và kiểm định các xe đạp được gửi lên hệ thống
            </p>

            {pageLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="text-3xl mb-2">⏳</div>
                  <p className="text-sm font-semibold text-gray-700">
                    Đang tải dữ liệu...
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Tìm kiếm tên xe..."
                  className="pl-9 pr-9"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  ) : searchInput ? (
                    <button
                      onClick={() => setSearchInput("")}
                      className="text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {!pageLoading && (
          <>
            <div className="flex items-center mb-4">
              <span className="text-sm text-gray-500">
                Hiển thị{" "}
                <strong className="text-gray-900">
                  {filtered.length}
                </strong>{" "}
                / {bikes.length} xe
              </span>
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(bike => (
                  <BikeCard
                    key={bike.id}
                    bike={bike}
                    onAction={handleAction}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="font-semibold text-gray-900 mb-1">
                    Không tìm thấy xe nào
                  </p>
                  <p className="text-sm text-gray-500">
                    Thử thay đổi từ khóa tìm kiếm
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
      </div>

      <DetailModal
        open={showModal}
        onClose={handleClose}
        bike={selectedBike}
        onSuccess={handleSuccess}
      />
    </div>
  );
}