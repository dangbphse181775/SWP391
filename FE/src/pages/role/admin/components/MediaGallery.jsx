import { ChevronLeft, ChevronRight, Package } from 'lucide-react';

export default function MediaGallery({ mediaArray, selectedIndex, onPrev, onNext, onSelect, vehicleName, thumbnailUrl }) {
  const totalImages = mediaArray.length || (thumbnailUrl ? 1 : 0);
  const currentMedia = mediaArray[selectedIndex] || { type: 'image', url: thumbnailUrl };

  return (
    <div className="space-y-4">
      {/* Main viewer */}
      <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
        {currentMedia?.url ? (
          currentMedia.type === 'video' ? (
            <video src={currentMedia.url} controls className="w-full h-full object-contain bg-black" />
          ) : (
            <img
              src={currentMedia.url}
              alt={vehicleName}
              className="w-full h-full object-contain bg-gray-50 mix-blend-multiply"
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Package className="w-16 h-16" />
          </div>
        )}

        {totalImages > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-md">
              {selectedIndex + 1} / {totalImages}
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
              onClick={() => onSelect(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                selectedIndex === index
                  ? 'border-black ring-2 ring-black/10'
                  : 'border-transparent hover:border-gray-200'
              }`}
            >
              {media.type === 'video' ? (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full border border-white flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5" />
                  </div>
                </div>
              ) : (
                <img src={media.url} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
