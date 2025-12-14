"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
    LeftOutlined,
    RightOutlined,
    ThunderboltFilled,
    LineChartOutlined,
    BookOutlined,
    TeamOutlined,
    FileTextOutlined,
    RadarChartOutlined,
    BellOutlined,
    FireOutlined,
} from "@ant-design/icons";

// Slide Data Interface
interface Slide {
    id: number;
    title: string;
    description: string;
    badge: "LIVE" | "ADVANCED" | "AI READY" | null;
    highlight: string;
    image: string;
    icon: React.ReactNode;
    accent: string;
}

// Slides Data
const SLIDES: Slide[] = [
    {
        id: 1,
        title: "Sectoral Demand Zone Analysis",
        description: "Instantly track stocks approaching or entering demand zones — sector by sector.",
        badge: "LIVE",
        highlight: "Highlights: IT, Banking, Pharma, Auto breakdown",
        image: "https://res.cloudinary.com/dp8l2hrt1/image/upload/v1765735355/Screenshot_from_2025-12-14_23-32-15_byswyw.png",
        icon: <RadarChartOutlined />,
        accent: "text-blue-400",
    },
    {
        id: 2,
        title: "Professional Trading Journal & Analytics",
        description: "Track performance, risk-reward, win rate, and improve consistency with deep analytics.",
        badge: "ADVANCED",
        highlight: "Highlights: Performance metrics & charts",
        image: "https://res.cloudinary.com/dp8l2hrt1/image/upload/v1765734719/Screenshot_from_2025-12-14_23-21-33_amy8im.png",
        icon: <LineChartOutlined />,
        accent: "text-green-400",
    },
    {
        id: 3,
        title: "Detailed Trade Logging",
        description: "Every trade documented with entry, exit, zone logic, and notes.",
        badge: "ADVANCED",
        highlight: "Highlights: Discipline & review",
        image: "https://res.cloudinary.com/dp8l2hrt1/image/upload/v1765734719/Screenshot_from_2025-12-14_23-21-33_amy8im.png",
        icon: <BookOutlined />,
        accent: "text-purple-400",
    },
    {
        id: 4,
        title: "Team Picks Inside Demand Zones",
        description: "Curated picks with precise zones and execution logic from experienced traders.",
        badge: "LIVE",
        highlight: "Highlights: Location + execution",
        image: "https://res.cloudinary.com/dp8l2hrt1/image/upload/v1765734340/Screenshot_from_2025-12-14_23-15-13_irkrxs.png",
        icon: <TeamOutlined />,
        accent: "text-orange-400",
    },
    {
        id: 5,
        title: "Daily Zone Status Reports",
        description: "Date-wise stocks approaching, entered, or breached demand zones.",
        badge: "AI READY",
        highlight: "Highlights: Daily market readiness",
        image: "https://res.cloudinary.com/dp8l2hrt1/image/upload/v1765734295/Screenshot_from_2025-12-14_23-14-38_amxrta.png",
        icon: <FileTextOutlined />,
        accent: "text-teal-400",
    },
    {
        id: 6,
        title: "Smart Scanner with Filters",
        description: "Scan 2600+ NSE stocks using sector and watchlist-based filters in real time.",
        badge: "ADVANCED",
        highlight: "Highlights: Speed & clarity",
        image: "https://res.cloudinary.com/dp8l2hrt1/image/upload/v1765734223/Screenshot_from_2025-12-14_23-13-28_nwl9ew.png",
        icon: <ThunderboltFilled />,
        accent: "text-yellow-400",
    },
    {
        id: 7,
        title: "Unlimited Telegram Alerts",
        description: "Never miss a zone with instant alerts directly on Telegram.",
        badge: "LIVE",
        highlight: "Highlights: Real-time notifications",
        image: "https://res.cloudinary.com/dp8l2hrt1/image/upload/v1765734129/Screenshot_from_2025-12-14_23-11-49_g1pz44.png",
        icon: <BellOutlined />,
        accent: "text-cyan-400",
    },
    {
        id: 8,
        title: "Latest Demand Zones Across NSE",
        description: "Always stay updated with newly formed and active demand zones.",
        badge: "LIVE",
        highlight: "Highlights: Fresh opportunities",
        image: "https://res.cloudinary.com/dp8l2hrt1/image/upload/v1765734028/Screenshot_from_2025-12-14_23-10-08_uviahu.png",
        icon: <FireOutlined />,
        accent: "text-red-400",
    },
];

export default function FeatureSlider() {
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const data = SLIDES[current];

    // Auto-slide logic
    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(interval);
    }, [current, isPaused]);

    const nextSlide = () => {
        setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
    };

    return (
        <section
            className="w-full bg-slate-900 py-20 px-4 md:px-8 border-t border-b border-white/5"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 md:p-0 min-h-[500px]">

                    {/* Left Panel: Text */}
                    <div className="w-full md:w-5/12 p-4 md:p-12 flex flex-col justify-center relative">
                        {/* Transition Wrapper */}
                        <div className="animate-fade-in transition-all duration-300">
                            <div className="mb-6 flex items-center space-x-3">
                                <span className={`text-4xl ${data.accent}`}>{data.icon}</span>
                                {data.badge && (
                                    <span className="px-3 py-1 text-xs font-bold tracking-wider rounded-full bg-white/10 text-white uppercase border border-white/10">
                                        {data.badge}
                                    </span>
                                )}
                            </div>

                            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
                                {data.title}
                            </h2>

                            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                                {data.description}
                            </p>

                            <div className="mb-8 pl-4 border-l-4 border-white/20">
                                <p className="text-gray-400 italic text-sm">{data.highlight}</p>
                            </div>
                        </div>

                        {/* Navigation & Progress */}
                        <div className="mt-auto">
                            {/* Progress Bar */}
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
                                <span>Feature {current + 1} of {SLIDES.length}</span>
                                <span>{isPaused ? "Paused" : "Auto-playing"}</span>
                            </div>
                            <div className="w-full h-1 bg-white/10 rounded-full mb-8 overflow-hidden">
                                <div
                                    className={`h-full ${data.accent.replace('text-', 'bg-')} transition-all duration-300 ease-out`}
                                    style={{ width: `${((current + 1) / SLIDES.length) * 100}%` }}
                                ></div>
                            </div>

                            {/* Prev/Next Buttons */}
                            <div className="flex space-x-4">
                                <button
                                    onClick={prevSlide}
                                    className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 border border-white/10 text-white transition-all active:scale-95"
                                >
                                    <LeftOutlined />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 border border-white/10 text-white transition-all active:scale-95"
                                >
                                    <RightOutlined />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Image */}
                    <div className="w-full md:w-7/12 h-[300px] md:h-[500px] relative bg-slate-950/50 flex items-center justify-center p-4 md:p-8">
                        {/* Glow Effect */}
                        <div className={`absolute inset-0 bg-gradient-to-tr ${data.accent.replace('text-', 'from-')}/20 to-transparent opacity-20 blur-3xl`} />

                        {/* Main Image Frame */}
                        <div className="relative w-full h-full shadow-2xl rounded-xl overflow-hidden border border-white/10 group">
                            <div className="absolute top-0 left-0 w-full h-8 bg-slate-800/80 backdrop-blur border-b border-white/5 flex items-center px-4 space-x-2 z-10">
                                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                            </div>
                            <Image
                                src={data.image}
                                alt={data.title}
                                fill
                                className="object-cover object-left-top pt-8 transition-transform duration-700 ease-in-out group-hover:scale-105"
                                unoptimized
                            />

                            <div className="absolute bottom-3 right-4 z-20">
                                <span className="text-[10px] text-white/30 tracking-widest uppercase bg-black/40 px-2 py-1 rounded backdrop-blur-md">
                                    Real Platform Screenshot
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* CTAs */}
                <div className="mt-12 text-center flex flex-col md:flex-row justify-center items-center gap-6">
                    <a href="#features" className="text-gray-400 hover:text-white transition font-medium border-b border-transparent hover:border-white">
                        Explore All Features
                    </a>
                    <a href="/v1/login" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all transform hover:-translate-y-1">
                        Start Tracking Demand Zones
                    </a>
                </div>
            </div>
        </section>
    );
}
