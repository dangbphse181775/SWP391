import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminApi from '@/service/adminApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminSidebar from '@/components/admin/AdminSidebar';
import RejectDialog from '@/components/admin/RejectDialog';
import { 
  ArrowLeft,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Tag,
  Info,
  ShieldCheck,
  Calendar,
  User,
  Package,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };


  const handlePrevImage = () => {
    const mediaArray = vehicle?.media || vehicle?.vehicleMedia || [];
    if (mediaArray.length > 0) {
      setSelectedImageIndex((prev) => prev === 0 ? mediaArray.length - 1 : prev - 1);
    }
  };

  const handleNextImage = () => {
    const mediaArray = vehicle?.media || vehicle?.vehicleMedia || [];
    if (mediaArray.length > 0) {
      setSelectedImageIndex((prev) => prev === mediaArray.length - 1 ? 0 : prev + 1);
    }
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
  const currentMedia = mediaArray[selectedImageIndex] || { type: 'image', url: vehicle.thumbnailUrl };
  const totalImages = mediaArray.length || (vehicle.thumbnailUrl ? 1 : 0);

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
              <div className="space-y-4">
                <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
                  {currentMedia?.url ? (
                    currentMedia.type === 'video' ? (
                      <video src={currentMedia.url} controls className="w-full h-full object-contain bg-black" />
                    ) : (
                      <img 
                        src={currentMedia.url} 
                        alt={vehicle.name} 
                        className="w-full h-full object-contain bg-gray-50 mix-blend-multiply" 
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package className="w-16 h-16" />
                    </div>
                  )}
                  
                  {/* Navigation Arrows */}
                  {totalImages > 1 && (
                    <>
                      <button onClick={handlePrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={handleNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-md">
                        {selectedImageIndex + 1} / {totalImages}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {totalImages > 1 && mediaArray.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {mediaArray.map((media, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index 
                            ? 'border-black ring-2 ring-black/10' 
                            : 'border-transparent hover:border-gray-200'
                        }`}
                      >
                        {media.type === 'video' ? (
                           <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                              <div className="w-6 h-6 rounded-full border border-white flex items-center justify-center">
                                 <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5"></div>
                              </div>
                           </div>
                        ) : (
                          <img 
                            src={media.url} 
                            alt={`Thumbnail ${index}`} 
                            className="w-full h-full object-cover" 
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

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
               {/* Key Details Card */}
               <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                  <div className="p-6">
                     <h1 className="text-2xl font-bold text-gray-900 mb-2">{vehicle.name}</h1>
                     <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-3xl font-bold text-red-600 tracking-tight">{formatPrice(vehicle.price)}</span>
                     </div>
                     
                     <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-50">
                           <span className="text-gray-500 flex items-center gap-2 text-sm"><Tag className="w-4 h-4"/> Hãng xe</span>
                           <span className="font-medium text-gray-900">{vehicle.brandName || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-50">
                           <span className="text-gray-500 flex items-center gap-2 text-sm"><Package className="w-4 h-4"/> Loại xe</span>
                           <span className="font-medium text-gray-900">{vehicle.categoryName || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-50">
                           <span className="text-gray-500 flex items-center gap-2 text-sm"><Calendar className="w-4 h-4"/> Năm sản xuất</span>
                           <span className="font-medium text-gray-900">{vehicle.model || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-50">
                           <span className="text-gray-500 flex items-center gap-2 text-sm"><ShieldCheck className="w-4 h-4"/> Tình trạng</span>
                           <span className="font-medium text-gray-900">{vehicle.condition}</span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                           <span className="text-gray-500 flex items-center gap-2 text-sm"><Info className="w-4 h-4"/> Kích thước</span>
                           <span className="font-medium text-gray-900">{vehicle.frameSize || 'N/A'}</span>
                        </div>
                     </div>
                  </div>
               </Card>

               {/* Seller Info */}
               <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
                     <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500"/>
                        Thông tin người bán
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                           <User className="w-6 h-6"/>
                        </div>
                        <div>
                           <p className="font-semibold text-gray-900">{vehicle.sellerName || 'Người bán ẩn danh'}</p>
                           <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                           </p>
                        </div>
                     </div>
                     <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-4">
                        
                        
                     </div>
                  </CardContent>
               </Card>
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