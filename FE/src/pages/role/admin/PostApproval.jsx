import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '@/service/adminApi';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import PostTabBar from './components/PostTabBar';
import VehicleCard from './components/VehicleCard';

const PostApproval = () => {
  const navigate = useNavigate();
  const [allVehicles, setAllVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchPendingVehicles();
  }, []);

  const fetchPendingVehicles = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getPendingVehicles();
      
      // Xá»­ lÃ½ dá»¯ liá»‡u tráº£ vá» an toÃ n
      let data = Array.isArray(response) ? response : (response.data || []);
      
      data = data.map(vehicle => ({
        ...vehicle,
        status: vehicle.status || 'pending_admin'
      }));
      
      setAllVehicles(data);
    } catch (error) {
      console.error('Error fetching pending vehicles:', error);
      toast.error('KhÃ´ng thá»ƒ táº£i danh sÃ¡ch bÃ i Ä‘Äƒng');
    } finally {
      setLoading(false);
    }
  };

  const vehicles = allVehicles.filter(vehicle => {
    if (activeTab === 'pending')  return vehicle.status === 'pending_admin';
    if (activeTab === 'approved') return vehicle.status === 'active';
    if (activeTab === 'rejected') return vehicle.status === 'rejected';
    return false;
  });

  const handleViewDetail = (vehicleId) => navigate(`/admin/posts/${vehicleId}`);

  return (
    <div className="flex h-screen bg-gray-50/50 font-sans">
      <AdminSidebar pendingCount={allVehicles.filter(v => v.status === 'pending_admin').length} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-5 sticky top-0 z-10 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quáº£n lÃ½ bÃ i Ä‘Äƒng</h2>
            <p className="text-sm text-gray-500 mt-1">Kiá»ƒm duyá»‡t vÃ  quáº£n lÃ½ danh sÃ¡ch xe Ä‘ang bÃ¡n trÃªn há»‡ thá»‘ng</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-full h-10 w-10 p-0 border-gray-200">
              <Search className="w-4 h-4 text-gray-500" />
            </Button>
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
              <img src="https://github.com/shadcn.png" alt="Admin" className="h-full w-full object-cover" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            <PostTabBar activeTab={activeTab} onChange={setActiveTab} allVehicles={allVehicles} />

            <div className="space-y-5">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-black" />
                  <p className="text-gray-400 font-medium text-sm">Äang táº£i dá»¯ liá»‡u...</p>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Danh sÃ¡ch trá»‘ng</h3>
                  <p className="text-gray-500 text-sm mt-1">Hiá»‡n khÃ´ng cÃ³ xe nÃ o á»Ÿ tráº¡ng thÃ¡i nÃ y</p>
                </div>
              ) : (
                vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.vehicleId}
                    vehicle={vehicle}
                    onViewDetail={handleViewDetail}
                  />
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PostApproval;
