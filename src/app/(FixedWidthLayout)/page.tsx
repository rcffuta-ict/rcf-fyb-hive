"use client"
import { appToast } from "@/providers/ToastProvider";
import { authStore } from "@/stores/authStore";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useState, useEffect } from "react";


const testimonials = [
    {
        text: "An unforgettable celebration of our academic journey",
        author: "Grace A.",
        role: "Computer Science",
        icon: "🎓",
    },
    {
        text: "Connecting hearts and minds for a magical evening",
        author: "David O.",
        role: "Engineering",
        icon: "💝",
    },
    {
        text: "Where excellence meets elegance in perfect harmony",
        author: "Sarah M.",
        role: "Medicine",
        icon: "✨",
    },
];


const features = [
    {
        icon: "🌟",
        title: "Excellence Recognition",
        description: "Celebrating the brightest minds and achievements",
    },
    {
        icon: "🤝",
        title: "Community Bonding",
        description: "Building lasting connections among finalists",
    },
    {
        icon: "🎭",
        title: "Memorable Experience",
        description: "Creating magical moments that last forever",
    },
];

function HomePage() {
    const [isVisible, setIsVisible] = useState(false);
    const member = authStore.member;

    useEffect(() => {
        setIsVisible(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    

    

    return (
        <Fragment>
            {/* Hero Section - Completely Redesigned */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-pearl-900 via-luxury-900 to-romance-900"></div>
                <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-champagne-gold/10 rounded-full blur-3xl animate-float-slow"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-romance-400/15 rounded-full blur-2xl animate-drift"></div>
                <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-luxury-400/10 rounded-full blur-xl animate-pulse-romantic"></div>

                {/* Floating Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className={`absolute w-1 h-1 bg-champagne-gold/40 rounded-full animate-twinkle`}
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${i * 0.5}s`,
                                animationDuration: `${2 + Math.random() * 2}s`,
                            }}
                        ></div>
                    ))}
                </div>

                <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
                    {/* Hero Image with Enhanced Styling */}
                    <div
                        className={`transition-all duration-1000 ${
                            isVisible
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-8"
                        }`}
                    >
                        <div className="relative inline-block mb-8">
                            <div className="absolute inset-0 bg-champagne-gold/20 rounded-full blur-2xl animate-glow-pulse"></div>
                            <div className="relative bg-glass-warm backdrop-blur-xl p-8 rounded-full border border-white/20 shadow-golden-glow">
                                <Image
                                    src="/images/illustr-1.png"
                                    alt="Welcome to FYB Hive"
                                    width={250}
                                    height={250}
                                    className="animate-float"
                                />
                            </div>
                            {/* Decorative rings */}
                            <div className="absolute inset-0 border-2 border-champagne-gold/30 rounded-full animate-ping"></div>
                            <div className="absolute inset-4 border border-romance-400/20 rounded-full animate-pulse"></div>
                        </div>
                    </div>

                    {/* Hero Title */}
                    <div
                        className={`transition-all duration-1200 delay-300 ${
                            isVisible
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-8"
                        }`}
                    >
                        <h1 className="text-6xl md:text-8xl font-luxury font-bold leading-none mb-6">
                            <span className="block bg-gradient-to-r from-pearl-100 via-champagne-gold to-pearl-100 bg-clip-text text-transparent animate-shimmer">
                                Welcome to
                            </span>
                            <span className="block mt-4 bg-gradient-to-r from-romance-300 via-rose-gold to-luxury-300 bg-clip-text text-transparent">
                                FYB Hive
                            </span>
                        </h1>

                        {/* Subtitle with elegant styling */}
                        <p className="text-xl md:text-2xl font-elegant text-pearl-300 mb-4 tracking-wide">
                            RCF FUTA Finalists&#39; Celebration Hub
                        </p>

                        {/* Decorative line */}
                        <div className="flex items-center justify-center space-x-4 mb-8">
                            <div className="w-16 h-px bg-gradient-to-r from-transparent to-champagne-gold"></div>
                            <div className="w-4 h-4 bg-champagne-gold rounded-full animate-sparkle shadow-golden-glow"></div>
                            <div className="w-16 h-px bg-gradient-to-l from-transparent to-champagne-gold"></div>
                        </div>
                    </div>

                    {/* Hero Description */}
                    <div
                        className={`transition-all duration-1400 delay-500 pb-28 ${
                            isVisible
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-8"
                        }`}
                    >
                        <div className="max-w-4xl mx-auto bg-glass-warm backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-glass">
                            <p className="text-lg md:text-xl leading-relaxed font-elegant text-pearl-200">
                                A luxurious hub created for the{" "}
                                <span className="font-bold bg-gradient-to-r from-champagne-gold to-golden-400 bg-clip-text text-transparent">
                                    Final Year Brethren (FYB)
                                </span>{" "}
                                to celebrate our remarkable journey, forge
                                lasting connections, and prepare for the grand{" "}
                                <span className="font-bold text-romance-300">
                                    FYB Dinner
                                </span>
                                .
                            </p>

                            <div className="mt-6 flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-8 text-pearl-300">
                                <div className="flex items-center space-x-2">
                                    <span className="text-champagne-gold animate-sparkle">
                                        ✨
                                    </span>
                                    <span className="font-semibold">
                                        Army of Light Family Legacy
                                    </span>
                                </div>
                                <div className="hidden md:block w-px h-6 bg-pearl-600"></div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-romance-400 animate-pulse-romantic">
                                        💝
                                    </span>
                                    <span className="font-semibold">
                                        300 Level Family Powered
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    {/* <div
                        className={`transition-all duration-1600 delay-700 ${
                            isVisible
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-8"
                        }`}
                    >
                        <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center">
                            <Link
                                href="/register"
                                className="group relative px-10 py-5 bg-gradient-to-r from-champagne-gold via-golden-400 to-golden-500 text-white font-bold text-lg rounded-2xl shadow-trophy-glow hover:shadow-golden-glow hover:scale-110 transition-all duration-400 overflow-hidden"
                            >
                                <div className="relative z-10 flex items-center space-x-3">
                                    <span className="text-2xl group-hover:animate-bounce-gentle">
                                        🎟️
                                    </span>
                                    <span>Join the Celebration</span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </Link>

                            <Link
                                href="/about"
                                className="group px-10 py-5 bg-glass-warm backdrop-blur-xl border-2 border-champagne-gold/30 text-pearl-200 font-bold text-lg rounded-2xl hover:bg-glass-gold hover:border-champagne-gold hover:shadow-golden-glow hover:scale-105 transition-all duration-400"
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl group-hover:animate-sparkle">
                                        📖
                                    </span>
                                    <span>Learn More</span>
                                </div>
                            </Link>
                        </div>
                    </div> */}
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-champagne-gold/50 rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-champagne-gold rounded-full mt-2 animate-pulse"></div>
                    </div>
                </div>
            </section>

            {/* Features Section */}

            {/* Enhanced Call to Actions */}
            <section className="relative py-24">
                <div className="absolute inset-0 bg-gradient-to-br from-luxury-900/40 via-pearl-900/60 to-romance-900/40"></div>
                <div className="relative z-10 max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-luxury font-bold bg-gradient-to-r from-pearl-100 to-champagne-gold bg-clip-text text-transparent mb-4">
                            Your Journey Starts Here
                        </h2>
                        <div className="flex items-center justify-center space-x-4 mb-8">
                            <div className="w-20 h-px bg-gradient-to-r from-transparent to-romance-400"></div>
                            <span className="text-3xl animate-pulse-romantic">
                                💫
                            </span>
                            <div className="w-20 h-px bg-gradient-to-l from-transparent to-romance-400"></div>
                        </div>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {[
                            {
                                href: "/register",
                                icon: "🎫",
                                title: "Register for Dinner",
                                description:
                                    "Secure your exclusive seat at the most anticipated FYB celebration",
                                gradient:
                                    "from-champagne-gold via-golden-400 to-golden-500",
                                hoverShadow: "shadow-golden-glow",
                                delay: "0ms",
                            },
                            {
                                href: "#",
                                icon: "👑",
                                title: "Vote a Finalist",
                                description:
                                    "Crown excellence and celebrate the remarkable achievements of your peers",
                                gradient:
                                    "from-romance-500 via-rose-gold to-romance-400",
                                hoverShadow: "shadow-romantic-glow",
                                delay: "200ms",
                            },
                            {
                                href: "#",
                                icon: "💕",
                                title: "Pair Your Date",
                                description:
                                    "Bring your special someone and create magical memories together",
                                gradient:
                                    "from-luxury-500 via-luxury-400 to-luxury-600",
                                hoverShadow: "shadow-magic",
                                delay: "400ms",
                            },
                        ].map((action, index) => (
                            <div
                                key={index}
                                className="group animate-fade-in-slow"
                                style={{ animationDelay: action.delay }}
                            >
                                <Link
                                    href={action.href}
                                    onClick={(e) => {
                                        
                                        if (action.href === "#") {
                                            e.preventDefault();
                                            appToast.notImplemented();
                                            return
                                        }

                                        if (!member) {
                                            e.preventDefault();
                                            appToast.error(
                                                "Please log in to continue"
                                            );
                                        }
                                    }}
                                    className={`block relative bg-glass-warm backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center hover:scale-110 hover:${action.hoverShadow} transition-all duration-500 overflow-hidden`}
                                >
                                    {/* Background gradient on hover */}
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-400`}
                                    ></div>

                                    {/* Content */}
                                    <div className="relative z-10">
                                        <div className="text-6xl mb-6 group-hover:animate-bounce-gentle transform group-hover:scale-110 transition-transform duration-400">
                                            {action.icon}
                                        </div>
                                        <h3 className="text-2xl font-luxury font-bold text-champagne-gold mb-4 group-hover:text-white transition-colors duration-300">
                                            {action.title}
                                        </h3>
                                        <p className="text-pearl-300 font-elegant leading-relaxed group-hover:text-pearl-100 transition-colors duration-300">
                                            {action.description}
                                        </p>

                                        {/* Hover arrow */}
                                        <div className="mt-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400 transform translate-y-4 group-hover:translate-y-0">
                                            <span className="text-champagne-gold font-bold">
                                                Explore
                                            </span>
                                            <span className="ml-2 text-champagne-gold animate-bounce-gentle">
                                                →
                                            </span>
                                        </div>
                                    </div>

                                    {/* Shimmer effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}

            {/* Final CTA Section */}
        </Fragment>
    );
}


export default observer(HomePage);


function Testimonials() {
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    useEffect(() => {
        // Auto-rotate testimonials
        const interval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 4000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return (
        <section className="relative py-24 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-pearl-900/30 to-luxury-900/50"></div>
            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                <h2 className="text-4xl md:text-5xl font-luxury font-bold bg-gradient-to-r from-champagne-gold to-romance-400 bg-clip-text text-transparent mb-16">
                    What Fellow Brethren Say
                </h2>

                <div className="relative">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-all duration-700 ${
                                index === currentTestimonial
                                    ? "opacity-100 translate-y-0"
                                    : "opacity-0 translate-y-8"
                            }`}
                        >
                            <div className="bg-glass-warm backdrop-blur-xl border border-white/10 rounded-3xl p-12">
                                <div className="text-4xl mb-6">
                                    {testimonial.icon}
                                </div>
                                <blockquote className="text-2xl font-elegant italic text-pearl-200 mb-8">
                                    &#39;{testimonial.text}&#39;
                                </blockquote>
                                <div className="flex items-center justify-center space-x-4">
                                    <div className="w-12 h-12 bg-champagne-gold/20 rounded-full flex items-center justify-center">
                                        <span className="font-bold text-champagne-gold">
                                            {testimonial.author.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-champagne-gold">
                                            {testimonial.author}
                                        </div>
                                        <div className="text-pearl-400 text-sm">
                                            {testimonial.role}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Static height container */}
                    <div className="h-80"></div>
                </div>

                {/* Testimonial indicators */}
                <div className="flex justify-center space-x-3 mt-8">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentTestimonial(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                index === currentTestimonial
                                    ? "bg-champagne-gold shadow-golden-glow"
                                    : "bg-pearl-600 hover:bg-pearl-500"
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}


function Features() {
    return (
        <section className="relative py-24 bg-gradient-to-b from-pearl-900/50 to-luxury-900/30">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-luxury font-bold bg-gradient-to-r from-champagne-gold via-golden-400 to-romance-400 bg-clip-text text-transparent mb-4">
                        Why Choose FYB Hive?
                    </h2>
                    <p className="text-xl text-pearl-300 font-elegant max-w-2xl mx-auto">
                        Experience excellence, elegance, and unforgettable
                        memories
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group bg-glass-warm backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center hover:shadow-golden-glow hover:scale-105 transition-all duration-400 hover:border-champagne-gold/30"
                        >
                            <div className="text-6xl mb-4 group-hover:animate-bounce-gentle">
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-luxury font-bold text-champagne-gold mb-4">
                                {feature.title}
                            </h3>
                            <p className="text-pearl-300 font-elegant leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}


function CTALast() {
    return (
        <section className="relative py-32 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-luxury-900 via-romance-900 to-pearl-900"></div>
            <div className="absolute inset-0 bg-intimate-glow opacity-20"></div>

            <div className="relative z-10 max-w-4xl mx-auto px-6">
                <div className="text-6xl mb-8 animate-sparkle">🌟</div>
                <h2 className="text-5xl md:text-6xl font-luxury font-bold bg-gradient-to-r from-champagne-gold via-golden-300 to-romance-400 bg-clip-text text-transparent mb-8">
                    Ready to Make History?
                </h2>
                <p className="text-2xl font-elegant text-pearl-200 mb-12 leading-relaxed">
                    Join us for an unforgettable celebration of excellence,
                    achievement, and friendship
                </p>

                <Link
                    href="/register"
                    className="group inline-flex items-center space-x-4 px-12 py-6 bg-gradient-to-r from-champagne-gold via-golden-400 to-golden-500 text-white text-xl font-bold rounded-3xl shadow-trophy-glow hover:shadow-golden-glow hover:scale-110 transition-all duration-500 overflow-hidden"
                >
                    <span className="relative z-10 flex items-center space-x-3">
                        <span className="text-3xl group-hover:animate-sparkle">
                            🎊
                        </span>
                        <span>Begin Your Journey</span>
                        <span className="group-hover:animate-bounce-gentle">
                            →
                        </span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1200"></div>
                </Link>
            </div>
        </section>
    );
}