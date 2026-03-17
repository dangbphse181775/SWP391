export default function PostTabBar({ activeTab, onChange, allVehicles }) {
  const tabs = [
    { id: 'pending',  label: 'Chờ duyệt', count: allVehicles.filter(v => v.status === 'pending_admin').length },
    { id: 'approved', label: 'Đã duyệt',  count: allVehicles.filter(v => v.status === 'active').length },
    { id: 'rejected', label: 'Từ chối',   count: allVehicles.filter(v => v.status === 'rejected').length },
  ];

  return (
    <div className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm inline-flex mb-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
            activeTab === tab.id
              ? 'bg-black text-white shadow-md'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          {tab.label}
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}
