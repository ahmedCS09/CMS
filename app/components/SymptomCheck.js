"use client";
import { useState } from "react";
import axios from "axios";
import { Loader2, Activity } from "lucide-react";

const symptomCategories = {
  "General": ["Fever", "Chills", "Fatigue", "Weakness", "Weight loss", "Weight gain", "Loss of appetite"],
  "Head & Neurological": ["Headache", "Dizziness", "Migraine", "Confusion", "Memory problems", "Seizures"],
  "Respiratory": ["Cough", "Shortness of breath", "Wheezing", "Chest tightness", "Sore throat", "Runny nose", "Nasal congestion", "Sneezing"],
  "Cardiovascular": ["Chest pain", "Palpitations", "High blood pressure", "Swelling in legs"],
  "Gastrointestinal": ["Nausea", "Vomiting", "Diarrhea", "Constipation", "Abdominal pain", "Bloating", "Heartburn", "Indigestion"],
  "Musculoskeletal": ["Body pain", "Joint pain", "Back pain", "Muscle cramps", "Stiffness"],
  "Skin": ["Rash", "Itching", "Dry skin", "Redness", "Swelling"],
  "Urinary": ["Frequent urination", "Painful urination", "Blood in urine"],
  "Mental Health": ["Anxiety", "Depression", "Insomnia", "Mood swings"]
};

export default function SymptomChecker() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [activeCategory, setActiveCategory] = useState("General");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckbox = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = async () => {
    if (selectedSymptoms.length === 0) {
      alert("Please select at least one symptom");
      return;
    }

    try {
      setLoading(true);
      setResult("");
      const res = await axios.post("/api/AI/symptom-check", {
        symptoms: selectedSymptoms,
      });
      setResult(res.data.result);
    } catch (err) {
      console.log(err);
      setResult(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800/50 rounded-[3rem] p-1 md:p-2 shadow-2xl overflow-hidden">
      <div className="bg-slate-900/60 rounded-[2.5rem] p-8 md:p-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-indigo-500/20 p-2 rounded-xl">
                <Activity className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">AI <span className="text-indigo-500">Symptom Checker</span></h2>
            </div>
            <p className="text-slate-400 text-sm font-medium">Select your symptoms for an intelligent clinical analysis</p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-950/50 p-2 rounded-2xl border border-slate-800">
            <div className="px-4 py-2">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Selected</p>
              <p className="text-xl font-black text-indigo-400 leading-none">{selectedSymptoms.length}</p>
            </div>
            <button
              onClick={() => {
                setSelectedSymptoms([]);
                setResult("");
              }}
              className="px-4 py-3 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Category Sidebar */}
          <div className="lg:col-span-3 space-y-1.5 bg-slate-950/30 p-2 rounded-3xl border border-slate-800/30">
            {Object.keys(symptomCategories).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`w-full text-left px-5 py-4 rounded-2xl text-xs font-bold transition-all duration-300 ${
                  activeCategory === category
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 translate-x-1"
                    : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Symptoms Selection Grid */}
          <div className="lg:col-span-9">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
              {symptomCategories[activeCategory].map((symptom) => (
                <label
                  key={symptom}
                  className={`flex items-center gap-3 text-xs p-4 rounded-2xl cursor-pointer transition-all duration-300 border group ${
                    selectedSymptoms.includes(symptom)
                      ? "bg-indigo-600/10 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/5"
                      : "bg-slate-950/50 border-slate-800/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={selectedSymptoms.includes(symptom)}
                    onChange={() => handleCheckbox(symptom)}
                  />
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                    selectedSymptoms.includes(symptom) 
                      ? "bg-indigo-500 border-indigo-400 scale-110" 
                      : "border-slate-700 group-hover:border-slate-500"
                  }`}>
                    {selectedSymptoms.includes(symptom) && (
                      <div className="w-2.5 h-2.5 bg-white rounded-[2px] animate-in zoom-in-50 duration-200" />
                    )}
                  </div>
                  <span className="font-semibold">{symptom}</span>
                </label>
              ))}
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSubmit}
                disabled={loading || selectedSymptoms.length === 0}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-500 px-8 py-5 rounded-[1.5rem] text-white font-black uppercase tracking-widest text-sm hover:from-indigo-500 hover:to-indigo-400 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:from-slate-700 disabled:to-slate-700"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <Loader2 className="animate-spin w-5 h-5" />
                    Analyzing clinical patterns...
                  </span>
                ) : (
                  "Run AI Assessment"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div className="mt-10 bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 shadow-inner group animate-zoom-in">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Analysis Result</h3>
          </div>
          
          <div className="prose prose-invert max-w-none space-y-6">
            {result.split('\n\n').map((block, i) => {
              // Check if it's a table
              if (block.includes('|') && block.includes('---')) {
                const rows = block.split('\n').filter(r => r.trim() && !r.includes('---'));
                return (
                  <div key={i} className="overflow-x-auto my-6 rounded-2xl border border-slate-800 bg-slate-900/50">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-800/80">
                          {rows[0].split('|').filter(c => c.trim()).map((cell, ci) => (
                            <th key={ci} className="p-4 font-black uppercase tracking-widest text-indigo-400 border-b border-slate-700">
                              {cell.trim()}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {rows.slice(1).map((row, ri) => (
                          <tr key={ri} className="hover:bg-slate-800/30 transition-colors">
                            {row.split('|').filter(c => c.trim()).map((cell, ci) => (
                              <td key={ci} className="p-4 text-slate-300 leading-relaxed font-medium">
                                {cell.trim().replace(/<br\s*\/?>/gi, '\n').split('\n').map((line, li) => (
                                  <div key={li}>{line.trim().startsWith('•') ? line.trim() : line}</div>
                                ))}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }

              // Handle Headers (e.g., ### Disclaimer)
              if (block.startsWith('#')) {
                const level = block.match(/^#+/)[0].length;
                const text = block.replace(/^#+\s*/, '');
                const Tag = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
                return <Tag key={i} className="text-xl font-black text-white mt-8 mb-4">{text}</Tag>;
              }

              // Handle generic text/lists
              return (
                <p key={i} className="text-slate-300 leading-relaxed font-medium mb-4 whitespace-pre-line">
                  {block}
                </p>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8 flex items-start gap-3 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
        <span className="text-lg">⚠️</span>
        <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider leading-relaxed">
          MEDICAL DISCLAIMER: This assessment is generated by AI for informational purposes only. It is NOT a professional diagnosis or medical advice. Please consult a qualified doctor immediately if you have serious symptoms.
        </p>
      </div>
    </div>
  );
}