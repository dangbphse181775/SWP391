import  DetailModal from '@/pages/role/inspector/DetailModal';
import  BikeCard from '@/pages/role/inspector/BikeCard';
import { useState, useEffect } from "react";
import { Button }        from "@/components/ui/button";
import { Badge }         from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox }      from "@/components/ui/checkbox";
import { Separator }     from "@/components/ui/separator";
import { ScrollArea }    from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea }      from "@/components/ui/textarea";
import { Label }         from "@/components/ui/label";
import { Input }         from "@/components/ui/input";
import { toast, Toaster }from "sonner";
import {
  SlidersHorizontal, Search, X, LogOut, User,
  Bike, ChevronDown, ChevronUp, CheckCircle2, XCircle,
} from "lucide-react";
import * as InspectorAPI from "@/service/InspectorAPI";
import VehicleDetail from '@/service/VehicleDetailAPI';

// ─── Config ───────────────────────────────────────────────────────────────────
const BADGE_STYLE = {
  "Chờ kiểm định":  { background:"#fef3c7", color:"#92400e", border:"1px solid #fcd34d" },
  "Đang kiểm định": { background:"#dbeafe", color:"#1e40af", border:"1px solid #93c5fd" },
  "Đã duyệt":       { background:"#d1fae5", color:"#065f46", border:"1px solid #6ee7b7" },
  "Từ chối":        { background:"#fee2e2", color:"#991b1b", border:"1px solid #fca5a5" },
};

const DOT_COLOR = {
  "Chờ kiểm định":  "bg-amber-400",
  "Đang kiểm định": "bg-blue-500",
  "Đã duyệt":       "bg-emerald-500",
  "Từ chối":        "bg-red-500",
};

const ALL_STATUSES   = ["Chờ kiểm định","Đang kiểm định","Đã duyệt","Từ chối"];
const defaultFilters = { statuses:[] };

// ─── FilterSection ────────────────────────────────────────────────────────────
function FilterSection({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(p => !p)}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
          : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-1">{children}</div>}
      <Separator />
    </div>
  );
}

// ─── CheckRow ─────────────────────────────────────────────────────────────────
function CheckRow({ id, label, checked, onToggle, dot, count }) {
  return (
    <div
      onClick={onToggle}
      className={`flex items-center justify-between rounded-md px-2 py-1.5 cursor-pointer transition-colors ${checked ? "bg-primary/10" : "hover:bg-muted/60"}`}
    >
      <div className="flex items-center gap-2.5">
        <Checkbox id={id} checked={checked} onCheckedChange={onToggle} className="pointer-events-none" />
        {dot && <span className={`h-2 w-2 rounded-full flex-shrink-0 ${dot}`} />}
        <Label htmlFor={id} className={`text-sm cursor-pointer select-none ${checked ? "font-semibold text-primary" : "font-normal text-foreground"}`}>
          {label}
        </Label>
      </div>
      <Badge variant="secondary" className="text-xs h-5 px-1.5">{count}</Badge>
    </div>
  );
}

// ─── FilterSidebar ────────────────────────────────────────────────────────────
function FilterSidebar({ filters, onChange, onReset, bikes }) {
  const toggle = (key, val) => {
    const cur = filters[key];
    onChange(key, cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val]);
  };
  const countBy = (key, val) => bikes.filter(b => b[key] === val).length;
  const activeCount = filters.statuses.length;

  return (
    <div className="w-64 flex-shrink-0 border-r bg-background sticky top-16 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="font-bold text-sm">Bộ lọc</span>
          {activeCount > 0 && <Badge className="h-5 px-1.5 text-xs">{activeCount}</Badge>}
        </div>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-7 text-xs text-primary hover:text-primary">
            Xóa tất cả
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <FilterSection title="Trạng thái" icon={CheckCircle2}>
          {ALL_STATUSES.map(s => (
            <CheckRow key={s} id={`status-${s}`} label={s}
              checked={filters.statuses.includes(s)} onToggle={() => toggle("statuses", s)}
              dot={DOT_COLOR[s]} count={countBy("status", s)} />
          ))}
        </FilterSection>
      </ScrollArea>
    </div>
  );
}

// ─── ActionModal ──────────────────────────────────────────────────────────────
function ActionModal({ open, onClose, actionType, bikeName, rejectNote, onNoteChange, onConfirm, loading }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900 z-[100]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {actionType === "approve"
              ? <><CheckCircle2 className="h-5 w-5 text-emerald-600" /> Xác Nhận Duyệt</>
              : <><XCircle className="h-5 w-5 text-destructive" /> Từ Chối Xe</>}
          </DialogTitle>
        </DialogHeader>
        {actionType === "approve" ? (
          <p className="text-sm text-muted-foreground leading-relaxed">
            Bạn có chắc muốn <span className="font-semibold text-emerald-600">duyệt</span> xe{" "}
            <span className="font-semibold text-foreground">"{bikeName}"</span> không?
          </p>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="reject-note" className="text-sm font-semibold">
              Lý do từ chối <span className="text-destructive">*</span>
            </Label>
            <Textarea id="reject-note" value={rejectNote} onChange={e => onNoteChange(e.target.value)}
              placeholder="Nhập lý do từ chối..." className="min-h-[120px] resize-none" />
          </div>
        )}
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Hủy</Button>
          <Button onClick={onConfirm} disabled={loading}
            variant={actionType === "approve" ? "default" : "destructive"}
            className={actionType === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : ""}>
            {loading ? "Đang xử lý..." : actionType === "approve" ? "Xác nhận Duyệt" : "Xác nhận Từ chối"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function InspectorDashboard() {
  const [bikes, setBikes]                     = useState([]);
  const [pageLoading, setPageLoading]         = useState(true);
  const [search, setSearch]                   = useState("");
  const [filters, setFilters]                 = useState(defaultFilters);
  const [selectedBike, setSelectedBike]       = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType]           = useState(null);
  const [rejectNote, setRejectNote]           = useState("");
  const [submitLoading, setSubmitLoading]     = useState(false);
  const [viewMode, setViewMode] = useState("chitiet");

  // Load data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setPageLoading(true);
        const data = await InspectorAPI.getPendingVehicles();
        console.log(" API Data Loaded:", data);
        setBikes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("API Error:", err);
        toast.error("Lỗi tải dữ liệu", { description: "Không thể kết nối API. Vui lòng kiểm tra backend." });
        setBikes([]);
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFilterChange = (key, val) => setFilters(p => ({ ...p, [key]: val }));
  const handleFilterReset  = () => setFilters(defaultFilters);

  const stats = [
    { label:"Tổng số xe",     value:bikes.length,                                        color:"text-foreground"  },
    { label:"Chờ kiểm định",  value:bikes.filter(b=>b.status==="Chờ kiểm định").length,  color:"text-amber-500"   },
    { label:"Đang kiểm định", value:bikes.filter(b=>b.status==="Đang kiểm định").length, color:"text-blue-500"    },
    { label:"Đã duyệt",       value:bikes.filter(b=>b.status==="Đã duyệt").length,       color:"text-emerald-500" },
    { label:"Từ chối",        value:bikes.filter(b=>b.status==="Từ chối").length,        color:"text-destructive" },
  ];

 const filtered = bikes.filter(b => {
  const q = search.toLowerCase();

  const name = (b.name || "").toLowerCase();
  const owner = (b.owner || "").toLowerCase();

  if (q && !name.includes(q) && !owner.includes(q)) return false;
  if (filters.statuses.length && !filters.statuses.includes(b.status)) return false;

  return true;
});

  const handleViewDetail   = (bike) => { setSelectedBike(bike); setViewMode("chitiet"); setShowDetailModal(true); };
  const handleInspect = (bike) => { setSelectedBike(bike); setViewMode("kiemdinh");  setShowDetailModal(true);};
  const handleApproveClick = ()     => { setActionType("approve"); setShowActionModal(true); };
  const handleRejectClick  = ()     => { setActionType("reject"); setRejectNote(""); setShowActionModal(true); };

  const handleConfirmAction = async () => {
    if (!selectedBike) return;
    setSubmitLoading(true);
    try {
      if (actionType === "approve") {
        await InspectorAPI.approveVehicle(selectedBike.id);
        setBikes(p => p.map(b => b.id===selectedBike.id ? {...b, status:"Đã duyệt"} : b));
        toast.success("Đã duyệt thành công!", { description:`Xe "${selectedBike.name}" đã được duyệt.` });
      } else {
        if (!rejectNote.trim()) {
          toast.error("Vui lòng nhập lý do từ chối!");
          setSubmitLoading(false);
          return;
        }
        await InspectorAPI.rejectVehicle(selectedBike.id, rejectNote);
        setBikes(p => p.map(b => b.id===selectedBike.id ? {...b, status:"Từ chối"} : b));
        toast.error("Đã từ chối xe", { description:`Xe "${selectedBike.name}" đã bị từ chối.` });
      }
      closeModals();
    } catch (err) {
      toast.error("Có lỗi xảy ra", { description: err.message });
    } finally {
      setSubmitLoading(false);
    }
  };

  const closeModals = () => {
    setShowDetailModal(false); setShowActionModal(false);
    setSelectedBike(null); setActionType(null); setRejectNote(""); setViewMode("chitiet");
  };

  const activeTags = [
    ...filters.statuses.map(v => ({ v, key:"statuses", className:"bg-blue-100 text-blue-800" })),
  ];

  return (
    <div className="min-h-screen bg-muted/30 font-sans">
      {/* Toaster từ sonner với richColors */}
      <Toaster richColors position="bottom-right" />

      {/* Header */}
      <div className="px-6 py-4 border-b bg-background">
        <h1 className="text-xl font-bold text-foreground">Hệ Thống Kiểm Định Xe</h1>
      </div>
     

      <div className="flex items-start">
        <FilterSidebar filters={filters} onChange={handleFilterChange} onReset={handleFilterReset} bikes={bikes} />

        <main className="flex-1 p-6 min-w-0">
          {/* Dùng CardContent cho search */}
          <Card className="mb-5">
            <CardContent className="p-5">
              <h2 className="text-xl font-black tracking-tight text-foreground mb-1">DANH SÁCH KIỂM ĐỊNH</h2>
              <p className="text-sm text-muted-foreground mb-4">Quản lý và kiểm định các xe đạp được gửi lên hệ thống</p>
              {pageLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="text-3xl mb-2">⏳</div>
                    <p className="text-sm font-semibold text-foreground">Đang tải dữ liệu...</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Tìm kiếm tên xe, chủ xe..." className="pl-9 pr-9" />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {!pageLoading && (
            <>
          {/*  Dùng CardContent cho stats */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            {stats.map(s => (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <p className={`text-3xl font-extrabold leading-none ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-2">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Active filter tags */}
          <div className="flex items-center flex-wrap gap-2 mb-4">
            <span className="text-sm text-muted-foreground">
              Hiển thị <strong className="text-foreground">{filtered.length}</strong> / {bikes.length} xe
            </span>
            {activeTags.map(({ v, key, className }) => (
              <Badge key={v} variant="secondary" className={`gap-1 ${className} cursor-pointer`}
                onClick={() => handleFilterChange(key, filters[key].filter(x => x !== v))}>
                {v} <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(bike => <BikeCard key={bike.id} bike={bike} onViewDetail={handleViewDetail} onInspect={handleInspect} />)}
            </div>
          ) : (
            // Empty state dùng CardContent
            <Card>
              <CardContent className="py-16 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <p className="font-semibold text-foreground mb-1">Không tìm thấy xe nào</p>
                <p className="text-sm text-muted-foreground mb-4">Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm</p>
                <Button variant="outline" onClick={handleFilterReset}>Xóa tất cả bộ lọc</Button>
              </CardContent>
            </Card>
          )}
            </>
          )}
        </main>
      </div>

      <DetailModal
        bike={bikes.find(b => b.id === selectedBike?.id) || selectedBike}
        open={showDetailModal} type={viewMode} onClose={closeModals}
        onApprove={handleApproveClick} onReject={handleRejectClick}
      />
      <ActionModal
        open={showActionModal} onClose={closeModals}
        actionType={actionType} bikeName={selectedBike?.name}
        rejectNote={rejectNote} onNoteChange={setRejectNote}
        onConfirm={handleConfirmAction} loading={submitLoading}
      />
    </div>
  );
}