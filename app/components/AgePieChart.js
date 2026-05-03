"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Loader2, ShieldAlert, Activity } from "lucide-react";

export default function AgePieChart() {

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const [data, setData] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log("PieChart: Fetching Patient Directory...");
        const res = await axios.get("/api/admin/getAllUsers");
        const allUsers = res.data.users || [];
        
        // Filter only for patients with a recorded age
        const patients = allUsers.filter(u => u.role === 'patient' && u.age !== undefined && u.age !== null);
        console.log("PieChart: Found registered patients:", patients.length);
        
        const ageGroups = {
          "0-12": 0,
          "13-18": 0,
          "19-30": 0,
          "31-50": 0,
          "51+": 0
        };

        patients.forEach(patient => {
          const age = patient.age;
          if (age <= 12) ageGroups["0-12"]++;
          else if (age <= 18) ageGroups["13-18"]++;
          else if (age <= 30) ageGroups["19-30"]++;
          else if (age <= 50) ageGroups["31-50"]++;
          else ageGroups["51+"]++;
        });

        const chartData = Object.entries(ageGroups)
          .filter(([_, value]) => value > 0)
          .map(([name, value]) => ({ name, value }));
        
        console.log("PieChart: Final Chart Data:", chartData);
        setData(chartData);
      } catch (err) {
        console.error("PieChart: Fetch Error:", err);
        setError("Unable to sync patient demographics.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="w-full h-[450px] bg-[#0f172a]/80 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/5 shadow-2xl shadow-black/40 flex flex-col items-center justify-center animate-fade-up">
      <div className="flex items-center gap-3 self-start mb-8">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Patient Demographics</h2>
      </div>

      <div className="flex-1 w-full relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Syncing Data...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
             <div className="p-4 bg-red-500/10 rounded-full">
                <ShieldAlert className="w-8 h-8 text-red-500" />
             </div>
             <div>
                <p className="text-red-500 font-bold text-sm">Permission Denied</p>
                <p className="text-slate-500 text-[10px] mt-1 font-medium">Verify your administrative credentials.</p>
             </div>
          </div>
        ) : data.length === 0 ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
             <Activity className="w-12 h-12 text-slate-800" />
             <div>
                <p className="text-slate-400 font-bold text-sm underline decoration-slate-800 underline-offset-4 mb-2">No Aggregate Data</p>
                <p className="text-slate-500 text-xs font-medium max-w-[200px] leading-relaxed mx-auto">Patient metrics will appear once clinical appointments are recorded.</p>
             </div>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={40}
                  iconType="circle"
                  formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-11 pointer-events-none text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">Total</p>
                <p className="text-2xl font-black text-white">{data.reduce((acc, curr) => acc + curr.value, 0)}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}