"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function PremiumDropdown({ value, options, onChange, placeholder = "Select option..." }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value) || options[0] || { label: placeholder, value: "" };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-slate-950 border-2 rounded-2xl py-4 pl-14 pr-6 outline-none transition-all font-black tracking-tight cursor-pointer ${
                    isOpen 
                    ? "border-indigo-500 bg-slate-900 ring-4 ring-indigo-500/10 text-white" 
                    : "border-transparent text-slate-200 hover:border-slate-700 hover:bg-slate-800"
                }`}
            >
                <span>{selectedOption.label}</span>
                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-180 text-indigo-500" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div 
                    className="absolute z-[200] w-full mt-3 bg-slate-900/90 backdrop-blur-3xl border border-slate-800 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-2 animate-zoom-in origin-top overflow-hidden" 
                    style={{ animationDuration: '200ms' }}
                >
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-5 py-3.5 rounded-xl transition-all text-sm mb-1 last:mb-0 flex items-center justify-between ${
                                value === opt.value
                                ? "bg-indigo-500/10 text-indigo-700 font-black"
                                : "text-slate-300 hover:bg-slate-800 hover:text-slate-900 font-bold"
                            }`}
                        >
                            <span>{opt.label}</span>
                            {value === opt.value && (
                                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
