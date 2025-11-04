import { Info, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const stats = [
    { label: "Total invested", value: "$300K" },
    { label: "Total capital balance", value: "$300K" },
    { label: "Total distributed", value: "$27.05K" },
    { label: "# of deals", value: "1" },
    { label: "Total in-progress", value: "$0" },
  ];

  const sections = [
    "Invested capital",
    "Investment opportunities",
    "Joined deals",
    "Recent activity",
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 font-medium">Welcome!</p>
          <h1 className="text-2xl font-bold text-gray-800">
            Investor dashboard
          </h1>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-sm">
          <a
            href="#"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            LinkedIn <ArrowRight size={16} />
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            Updates <ArrowRight size={16} />
          </a>
          <div className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full font-semibold">
            JP
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-xl border p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-sm">{item.label}</p>
              <Info size={14} className="text-gray-400" />
            </div>
            <p className="text-lg font-semibold mt-2">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Section cards */}
      <div className="space-y-4">
        {sections.map((title) => (
          <div
            key={title}
            className="bg-white rounded-xl border shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center justify-between px-4 py-4">
              <h2 className="font-semibold text-gray-800">{title}</h2>
              <ArrowRight size={20} className="text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
