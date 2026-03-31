import { useState } from "react";

const THUMBS_PER_PAGE = 5;

export default function VehicleMediaGallery({ vehicle, activeMedia, onMediaSelect }) {
    const media = vehicle?.media || [];
    const [thumbPage, setThumbPage] = useState(0);

    const totalPages = Math.ceil(media.length / THUMBS_PER_PAGE);
    const visibleThumbs = media.slice(
        thumbPage * THUMBS_PER_PAGE,
        thumbPage * THUMBS_PER_PAGE + THUMBS_PER_PAGE
    );

    // Navigate main image prev/next
    const currentIndex = media.findIndex(m => m.url === activeMedia?.url);
    const goPrev = () => {
        if (currentIndex <= 0) return;
        const prev = media[currentIndex - 1];
        onMediaSelect(prev);
        // Auto-scroll thumb page if needed
        const prevPage = Math.floor((currentIndex - 1) / THUMBS_PER_PAGE);
        setThumbPage(prevPage);
    };
    const goNext = () => {
        if (currentIndex >= media.length - 1) return;
        const next = media[currentIndex + 1];
        onMediaSelect(next);
        const nextPage = Math.floor((currentIndex + 1) / THUMBS_PER_PAGE);
        setThumbPage(nextPage);
    };

    const handleThumbClick = (med, idx) => {
        onMediaSelect(med);
    };

    return (
        <div className="space-y-4">
            {/* Main image / video */}
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 relative group">
                {activeMedia?.type === "video" ? (
                    <video
                        key={activeMedia.url}
                        src={activeMedia.url}
                        controls
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <img
                        alt={vehicle?.name}
                        src={activeMedia?.url || "/placeholder-bike.jpg"}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { e.currentTarget.src = "/placeholder-bike.jpg"; }}
                    />
                )}

                <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-slate-100">
                        Nổi bật
                    </span>
                </div>

                {/* Prev / Next arrows on main image */}
                {media.length > 1 && (
                    <>
                        <button
                            onClick={goPrev}
                            disabled={currentIndex <= 0}
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md border border-slate-200 hover:bg-white transition-all disabled:opacity-30 disabled:cursor-default"
                            aria-label="Ảnh trước"
                        >
                            <span className="material-symbols-outlined text-slate-700 text-xl">chevron_left</span>
                        </button>
                        <button
                            onClick={goNext}
                            disabled={currentIndex >= media.length - 1}
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md border border-slate-200 hover:bg-white transition-all disabled:opacity-30 disabled:cursor-default"
                            aria-label="Ảnh tiếp"
                        >
                            <span className="material-symbols-outlined text-slate-700 text-xl">chevron_right</span>
                        </button>
                    </>
                )}

                {/* Image counter */}
                {media.length > 1 && (
                    <div className="absolute bottom-3 right-4 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        {currentIndex + 1} / {media.length}
                    </div>
                )}
            </div>

            {/* Thumbnail strip with prev/next page buttons */}
            {media.length > 1 && (
                <div className="flex items-center gap-2">
                    {/* Prev page button */}
                    <button
                        onClick={() => setThumbPage(p => Math.max(0, p - 1))}
                        disabled={thumbPage === 0}
                        className="shrink-0 h-10 w-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-default shadow-sm"
                        aria-label="Trang trước"
                    >
                        <span className="material-symbols-outlined text-slate-600 text-lg">chevron_left</span>
                    </button>

                    {/* Thumbnail grid */}
                    <div className="flex-1 grid gap-2" style={{ gridTemplateColumns: `repeat(${THUMBS_PER_PAGE}, minmax(0, 1fr))` }}>
                        {visibleThumbs.map((med, i) => {
                            const globalIdx = thumbPage * THUMBS_PER_PAGE + i;
                            const isActive = activeMedia?.url === med.url;
                            return (
                                <button
                                    key={globalIdx}
                                    onClick={() => handleThumbClick(med, globalIdx)}
                                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                        isActive
                                            ? "border-slate-900 ring-2 ring-slate-900 ring-offset-1 scale-105"
                                            : "border-slate-200 hover:border-slate-400 opacity-75 hover:opacity-100"
                                    }`}
                                >
                                    {med.type === "video" ? (
                                        <video
                                            src={med.url}
                                            className="w-full h-full object-cover"
                                            muted
                                        />
                                    ) : (
                                        <img
                                            src={med.url}
                                            alt={`Ảnh ${globalIdx + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.currentTarget.src = "/placeholder-bike.jpg"; }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Next page button */}
                    <button
                        onClick={() => setThumbPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={thumbPage >= totalPages - 1}
                        className="shrink-0 h-10 w-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-default shadow-sm"
                        aria-label="Trang sau"
                    >
                        <span className="material-symbols-outlined text-slate-600 text-lg">chevron_right</span>
                    </button>
                </div>
            )}
        </div>
    );
}
