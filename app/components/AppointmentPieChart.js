"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Loader2, CalendarRange, Info } from "lucide-react";

export default function AppointmentPieChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status-aware color mapping
  const STATUS_COLORS = {
    "Completed": "#22c55e", // Emerald
    "Upcoming": "#3b82f6",  // Blue
    "Cancelled": "#ef4444", // Red
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/patient/getAppointments");
        const appointments = res.data.appointments || [];

        // Aggregate data by status categories
        const counts = {
            "Completed": 0,
            "Upcoming": 0,
            "Cancelled": 0
        };

        appointments.forEach(apt => {
            const status = apt.appointmentStatus?.toLowerCase();
            if (status === "completed") {
                counts["Completed"]++;
            } else if (status === "pending" || status === "checked-in") {
                counts["Upcoming"]++;
            } else if (status === "cancelled" || status === "rejected") {
                counts["Cancelled"]++;
            }
        });

        // Format for Recharts and filter empty categories
        const chartData = Object.entries(counts)
          .map(([name, value]) => ({ name, value }))
          .filter(item => item.value > 0);

        setData(chartData);
      } catch (err) {
        console.error("Layout Fetch Error:", err);
        setError("Failed to load metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return (
    <div className="w-full h-[400px] bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center p-6 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Analysing Schedules...</p>
    </div>
  );

  return (
    <div className="w-full h-[400px] bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 relative group hover:border-indigo-500/30 transition-all duration-500 animate-fade-up">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Appointment Analytics</h2>
      </div>

      {data.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center pb-8 gap-4">
             <div className="p-4 bg-slate-800/50 rounded-full">
                <CalendarRange className="w-8 h-8 text-slate-600" />
             </div>
             <div>
                <p className="text-slate-400 font-bold text-sm">No Appointments Found</p>
                <p className="text-slate-500 text-[10px] uppercase tracking-tighter mt-1">Visit history will appear here once booked.</p>
             </div>
        </div>
      ) : (
        <>
            <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    stroke="none"
                >
                    {data.map((entry, index) => (
                    <Cell 
                        key={index} 
                        fill={STATUS_COLORS[entry.name]} 
                        className="focus:outline-none drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                    />
                    ))}
                </Pie>

                <Tooltip 
                    contentStyle={{ 
                        background: '#0f172a', 
                        border: '1px solid #1e293b', 
                        borderRadius: '16px', 
                        fontSize: '11px', 
                        fontWeight: 'bold', 
                        color: '#fff',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.4)'
                    }}
                    itemStyle={{ color: '#fff' }}
                />
                
                <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{value}</span>}
                />
                </PieChart>
            </ResponsiveContainer>

            {/* Center Total Overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-9 pointer-events-none text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-0.5">Visits</p>
                <p className="text-3xl font-black text-white group-hover:scale-110 transition-transform duration-500">
                    {data.reduce((acc, curr) => acc + curr.value, 0)}
                </p>
            </div>
        </>
      )}
    </div>
  );
}
