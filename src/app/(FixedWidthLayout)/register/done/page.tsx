"use client"
import React, { useState, useEffect } from "react";
import {
    Check,
    Sparkles,
    Calendar,
    MapPin,
    Clock,
    Award,
    Heart,
} from "lucide-react";
import Image from "next/image";

// Mock NavCta component - replace with your actual component
const NavCta = () => (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="btn btn-primary btn-lg animate-glow-pulse">
            View Event Details
        </button>
        <button className="btn btn-outline btn-lg">Download Invitation</button>
    </div>
);

export default function Done() {
    const [showConfetti, setShowConfetti] = useState(false);
    const [animationStep, setAnimationStep] = useState(0);

    useEffect(() => {
        // Trigger confetti animation
        setShowConfetti(true);

        // Staggered animation sequence
        const timeouts = [
            setTimeout(() => setAnimationStep(1), 300),
            setTimeout(() => setAnimationStep(2), 600),
            setTimeout(() => setAnimationStep(3), 900),
            setTimeout(() => setAnimationStep(4), 1200),
        ];

        return () => timeouts.forEach(clearTimeout);
    }, []);

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
            {/* Background Effects */}
            <div className="absolute inset-0">
                {/* Floating Orbs */}
                <div className="absolute top-20 left-10 w-32 h-32 bg-champagne-gold/20 rounded-full blur-3xl animate-float-slow" />
                <div className="absolute top-40 right-20 w-24 h-24 bg-rose-gold/30 rounded-full blur-2xl animate-drift" />
                <div className="absolute bottom-32 left-32 w-40 h-40 bg-luxury-400/20 rounded-full blur-3xl animate-pulse-romantic" />
                <div className="absolute bottom-20 right-10 w-28 h-28 bg-golden-400/25 rounded-full blur-2xl animate-float" />

                {/* Sparkle Elements */}
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute animate-twinkle ${
                            showConfetti ? "opacity-100" : "opacity-0"
                        }`}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            fontSize: `${Math.random() * 8 + 4}px`,
                        }}
                    >
                        ✨
                    </div>
                ))}

                {/* Confetti */}
                {showConfetti &&
                    [...Array(50)].map((_, i) => (
                        <div
                            key={`confetti-${i}`}
                            className="absolute animate-confetti opacity-80"
                            style={{
                                left: `${Math.random() * 100}%`,
                                backgroundColor: [
                                    "#FFD700",
                                    "#FF69B4",
                                    "#9333EA",
                                    "#F59E0B",
                                ][Math.floor(Math.random() * 4)],
                                width: "6px",
                                height: "6px",
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${3 + Math.random() * 2}s`,
                            }}
                        />
                    ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">

                {/* Success Message */}
                <div
                    className={`space-y-6 transition-all duration-800 delay-300 ease-romantic ${
                        animationStep >= 1
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-8"
                    }`}
                >
                    <div className="space-y-4">
                        <h1 className="font-luxury text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-champagne-gold via-golden-400 to-rose-gold animate-shimmer bg-[length:200%_100%]">
                            Registered!
                        </h1>

                        <div className="flex items-center justify-center gap-2 text-champagne-gold">
                            <Sparkles size={20} className="animate-twinkle" />
                            <span className="font-script text-xl">
                                Congratulations
                            </span>
                            <Sparkles size={20} className="animate-twinkle" />
                        </div>
                    </div>

                    <div className="relative">
                        <p className="font-elegant text-lg md:text-xl text-pearl-100 leading-relaxed max-w-md mx-auto">
                            Welcome to the Place Where Good Things Never Cease
                        </p>

                        {/* Decorative Hearts */}
                        <Heart
                            className="absolute -left-8 top-1/2 -translate-y-1/2 text-rose-gold/60 animate-pulse-romantic hidden md:block"
                            size={16}
                        />
                        <Heart
                            className="absolute -right-8 top-1/2 -translate-y-1/2 text-rose-gold/60 animate-pulse-romantic hidden md:block"
                            size={16}
                        />
                    </div>
                </div>

                {/* Event Details Card */}
                <div
                    className={`mt-12 mb-8 transition-all duration-800 delay-600 ease-romantic ${
                        animationStep >= 2
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-8"
                    }`}
                >
                    <div className="card card-luxury p-8 max-w-lg mx-auto">
                        <h3 className="font-elegant text-2xl font-semibold text-champagne-gold mb-6 flex items-center justify-center gap-2">
                            <Award className="animate-trophy-shine" size={24} />
                            Finalist Dinner Event
                        </h3>

                        <div className="space-y-4 text-pearl-100">
                            <div className="flex items-center gap-3">
                                <Calendar
                                    className="text-rose-gold"
                                    size={20}
                                />
                                <span className="font-modern">
                                    December 15, 2024
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <Clock className="text-luxury-300" size={20} />
                                <span className="font-modern">
                                    6:00 PM - 11:00 PM
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <MapPin className="text-golden-400" size={20} />
                                <span className="font-modern">
                                    Grand Ballroom, Luxury Hotel
                                </span>
                            </div>
                        </div>

                        {/* VIP Badge */}
                        <div className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-golden-500 to-champagne-gold text-white px-4 py-2 rounded-full text-sm font-semibold shadow-golden-glow animate-glow-pulse">
                            <Award size={16} />
                            VIP Finalist Access
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div
                    className={`transition-all duration-800 delay-900 ease-romantic ${
                        animationStep >= 3
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-8"
                    }`}
                >
                    <NavCta />
                </div>

                {/* Additional Info */}
                <div
                    className={`mt-8 transition-all duration-800 delay-1200 ease-romantic ${
                        animationStep >= 4 ? "opacity-100" : "opacity-0"
                    }`}
                >
                    <p className="text-pearl-300 text-sm font-modern">
                        You&apos;ll receive a confirmation email with all the details
                        shortly.
                    </p>
                </div>
            </div>

            {/* Bottom Decorative Elements */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-luxury-900/80 to-transparent" />

            {/* Floating Achievement Badges */}
            <div className="absolute top-10 left-10 animate-float opacity-30">
                <div className="w-16 h-16 bg-champagne-gold/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Award className="text-champagne-gold" size={24} />
                </div>
            </div>

            <div className="absolute top-20 right-16 animate-drift opacity-30">
                <div className="w-12 h-12 bg-rose-gold/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="text-rose-gold" size={18} />
                </div>
            </div>
        </div>
    );
}
