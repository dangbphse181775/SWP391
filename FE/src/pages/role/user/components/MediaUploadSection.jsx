import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MediaUploadSection({ media, fileInputRef, onFilePick, onDrop, onFileChange, onRemove }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 min-h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold">Thư viện hình ảnh/video</h2>
                    <p className="text-sm text-slate-500">
                        Tải lên ảnh hoặc video về xe của bạn (tối đa 10 mục).
                    </p>
                </div>
                <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium">
                    {media.length} / 10
                </span>
            </div>

            {/* Upload zone */}
            <div
                className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center
                    ${media.length === 10
                        ? "border-slate-200 bg-slate-100 cursor-not-allowed"
                        : "border-slate-300 bg-slate-50 cursor-pointer hover:border-slate-400"
                    }`}
                onClick={onFilePick}
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                <Input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={onFileChange}
                />

                <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">
                    add_a_photo
                </span>
                <p className="font-medium">Kéo và thả ảnh/video vào đây</p>
                <p className="text-sm text-slate-500 mb-2">hoặc bấm để chọn tệp</p>

                <Button
                    variant="outline"
                    type="button"
                    disabled={media.length === 10}
                    onClick={(e) => {
                        e.stopPropagation();
                        onFilePick();
                    }}
                >
                    Chọn ảnh / video
                </Button>
            </div>

            {/* Preview grid */}
            <div className="grid grid-cols-4 gap-4 mt-6">
                {media.map((file, idx) => (
                    <div
                        key={file.preview}
                        className="relative aspect-square border rounded-lg overflow-hidden group"
                    >
                        <button
                            type="button"
                            onClick={() => onRemove(idx)}
                            className="absolute top-1 right-1 z-10 bg-white/80 hover:bg-red-500 hover:text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                            <span className="material-symbols-outlined text-base">close</span>
                        </button>

                        {file.type.startsWith("image/") ? (
                            <img src={file.preview} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <video src={file.preview} className="w-full h-full object-cover" muted />
                        )}
                    </div>
                ))}

                {media.length < 10 && (
                    <div
                        onClick={onFilePick}
                        className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-slate-400"
                    >
                        <span className="material-symbols-outlined text-slate-400">add</span>
                    </div>
                )}
            </div>
        </div>
    );
}
