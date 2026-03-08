export default function VehicleMediaGallery({ vehicle, activeMedia, onMediaSelect }) {
    return (
        <div className="space-y-4">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 relative group">
                {activeMedia?.type === "video" ? (
                    <video
                        src={activeMedia.url}
                        controls
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <img
                        alt={vehicle?.name}
                        src={activeMedia?.url || "/placeholder-bike.jpg"}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                            e.currentTarget.src = "/placeholder-bike.jpg";
                        }}
                    />
                )}

                <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-slate-100">
                        Nổi bật
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-3">
                {(vehicle?.media || []).slice(0, 4).map((media, index) => (
                    <button
                        key={index}
                        onClick={() => onMediaSelect(media)}
                        className={`aspect-square rounded-lg overflow-hidden border transition-colors
                            ${activeMedia?.url === media.url
                                ? "border-primary ring-2 ring-primary ring-offset-2"
                                : "border-slate-200 hover:border-primary"
                            }`}
                    >
                        {media.type === "video" ? (
                            <video
                                src={media.url}
                                className="w-full h-full object-cover"
                                muted
                            />
                        ) : (
                            <img
                                src={media.url}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover opacity-80 hover:opacity-100"
                                onError={(e) => {
                                    e.currentTarget.src = "/placeholder-bike.jpg";
                                }}
                            />
                        )}
                    </button>
                ))}

                {vehicle?.media?.length > 4 && (
                    <button className="aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-500">
                            +{vehicle.media.length - 4} more
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
}
