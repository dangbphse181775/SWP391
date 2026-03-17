import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminApi from '@/service/adminApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminSidebar from '@/components/admin/AdminSidebar';
import RejectDialog from '@/components/admin/RejectDialog';
import { ArrowLeft, Check, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import MediaGallery from './components/MediaGallery';
import VehicleDetailInfo from './components/VehicleDetailInfo';
import SellerInfoCard from './components/SellerInfoCard';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchVehicleDetail();
  }, [id]);

  const fetchVehicleDetail = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getVehicleDetail(id);
      const data = response.data || response;
      setVehicle(data);
    } catch (error) {
      console.error('Error fetching vehicle detail:', error);
      toast.error('Không thể tải chi tiết bài đăng');
      navigate('/admin/posts');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setProcessing(true);
      await adminApi.approveVehicle(id);
      toast.success('Đã duyệt bài đăng thành công');
      navigate('/admin/posts');
    } catch (error) {
      console.error('Error approving vehicle:', error);
      toast.error('Có lỗi xảy ra khi duyệt bài đăng');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (rejectNote) => {
    try {
      setProcessing(true);
      await adminApi.rejectVehicle(id, rejectNote);
      toast.success('Đã từ chối bài đăng');
      setShowRejectDialog(false);
      navigate('/admin/posts');
    } catch (error) {
      console.error('Error rejecting vehicle:', error);
      toast.error('Có lỗi xảy ra khi từ chối bài đăng');
    } finally {
      setProcessing(false);
    }
  };

  const handlePrevImage = () => {
    const arr = vehicle?.media || vehicle?.vehicleMedia || [];
    if (arr.length > 0) setSelectedImageIndex((prev) => prev === 0 ? arr.length - 1 : prev - 1);
  };

  const handleNextImage = () => {
    const arr = vehicle?.media || vehicle?.vehicleMedia || [];
    if (arr.length > 0) setSelectedImageIndex((prev) => prev === arr.length - 1 ? 0 : prev + 1);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-black mb-4"></div>
          <p className="text-gray-500 font-medium text-sm">Đang tải chi tiết xe...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) return null;

  const mediaArray = vehicle.media || vehicle.vehicleMedia || [];

  return (
    <div className="flex h-screen bg-gray-50/50 font-sans">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header - Sticky & Action Oriented */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 sticky top-0 z-10 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/admin/posts')}
              className="rounded-full border-gray-200 w-9 h-9"
            >
              <ArrowLeft className="h-4 w-4 text-gray-600" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">Chi tiết bài đăng</h2>
                <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200 px-2.5 py-0.5">
                   {vehicle.status || 'Chờ duyệt'}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-mono">ID: {String(vehicle.vehicleId || id).slice(-8).toUpperCase()}</p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-3">
             <Button
                variant="outline"
                onClick={() => setShowRejectDialog(true)}
                disabled={processing}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium"
              >
                <X className="w-4 h-4 mr-2" />
                Từ chối
              </Button>
              <Button
                onClick={handleApprove}
                disabled={processing}
                className="bg-black hover:bg-gray-800 text-white shadow-md font-medium px-6"
              >
                <Check className="w-4 h-4 mr-2" />
                Duyệt bài đăng
              </Button>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Media & Description (7/12) */}
            <div className="lg:col-span-7 space-y-8">
              {/* Image Gallery */}
              <MediaGallery
                mediaArray={mediaArray}
                selectedIndex={selectedImageIndex}
                onPrev={handlePrevImage}
                onNext={handleNextImage}
                onSelect={setSelectedImageIndex}
                vehicleName={vehicle.name}
                thumbnailUrl={vehicle.thumbnailUrl}
              />

              {/* Description Card */}
              <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                 <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                       <FileText className="w-4 h-4 text-gray-500"/>
                       Mô tả chi tiết
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                       {vehicle.description || 'Không có mô tả chi tiết cho xe này.'}
                    </p>
                 </CardContent>
              </Card>
            </div>

            {/* Right Column: Info (5/12) */}
            <div className="lg:col-span-5 space-y-6">
              <VehicleDetailInfo vehicle={vehicle} />
              <SellerInfoCard vehicle={vehicle} />
            </div>

          </div>
        </main>
      </div>

      {/* Reject Dialog */}
      <RejectDialog 
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        onConfirm={handleReject}
        processing={processing}
      />
    </div>
  );
};

export default PostDetail;