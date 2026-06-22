import Link from "next/link";

export default function Footer() {
    return (
        <footer className="relative border-t border-white/10 bg-gradient-to-b from-pearl-900/90 via-luxury-900/80 to-pearl-900 backdrop-blur-xl overflow-hidden">
            {/* Background ambient effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-golden-400/5 via-romance-400/8 to-luxury-400/5 animate-pulse-romantic"></div>
            <div className="absolute top-0 left-1/4 w-48 h-24 bg-champagne-gold/5 blur-3xl animate-float-slow"></div>
            <div className="absolute bottom-0 right-1/3 w-32 h-16 bg-romance-400/10 blur-2xl animate-drift"></div>

            <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                {/* Decorative top border */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-champagne-gold to-transparent animate-shimmer"></div>

                {/* Main content */}
                <div className="flex flex-col items-center space-y-8 text-center">
                    {/* Elegant divider with icon */}
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-px bg-gradient-to-r from-transparent to-champagne-gold/50"></div>
                        <div className="w-8 h-8 bg-gradient-to-br from-champagne-gold via-golden-400 to-golden-600 rounded-full flex items-center justify-center shadow-golden-glow animate-sparkle">
                            <span className="text-white text-sm">🌹</span>
                        </div>
                        <div className="w-16 h-px bg-gradient-to-l from-transparent to-champagne-gold/50"></div>
                    </div>

                    {/* Main contribution text */}
                    <div className="max-w-4xl mx-auto px-4">
                        <blockquote className="relative">
                            {/* Quote marks */}
                            <div className="absolute -top-4 -left-2 text-4xl text-champagne-gold/30 font-serif">
                                &#34;
                            </div>
                            <div className="absolute -bottom-8 -right-2 text-4xl text-champagne-gold/30 font-serif">
                                &#34;
                            </div>

                            <p className="text-pearl-200 text-lg leading-relaxed font-elegant italic relative z-10 animate-fade-in-slow">
                                This innovation is rooted in the vision of the{" "}
                                <span className="font-semibold text-champagne-gold hover:text-golden-300 transition-colors duration-300 cursor-default">
                                    Army of Light Family
                                </span>
                                <span className="inline-block mx-1 animate-sparkle">
                                    ✨
                                </span>
                                carried forward by the{" "}
                                <span className="font-semibold text-rose-gold hover:text-romance-300 transition-colors duration-300 cursor-default">
                                    RCF FUTA 300 Level Family
                                </span>
                                <span className="inline-block mx-1 animate-twinkle">
                                    💫
                                </span>
                                to serve the{" "}
                                <span className="font-semibold text-luxury-300 hover:text-luxury-200 transition-colors duration-300 cursor-default">
                                    Final Year Brethren
                                </span>
                                <span className="inline-block mx-1 animate-pulse-romantic">
                                    🙏
                                </span>
                            </p>
                        </blockquote>
                    </div>

                    {/* Decorative separator */}
                    <div className="flex items-center space-x-2 py-4">
                        <div className="w-2 h-2 bg-champagne-gold rounded-full animate-pulse opacity-60"></div>
                        <div
                            className="w-1.5 h-1.5 bg-romance-400 rounded-full animate-pulse opacity-40"
                            style={{ animationDelay: "0.5s" }}
                        ></div>
                        <div
                            className="w-1 h-1 bg-luxury-400 rounded-full animate-pulse opacity-50"
                            style={{ animationDelay: "1s" }}
                        ></div>
                    </div>

                    {/* Powered by section */}
                    <Link href={"https://ict.rcffuta.com"} className="bg-glass-warm backdrop-blur-md border border-white/10 rounded-2xl px-8 py-4 shadow-glass hover:shadow-golden-glow/20 transition-all duration-400 hover:scale-105">
                        <p className="text-pearl-300 text-base font-elegant">
                            Powered by{" "}
                            <span className="font-bold bg-gradient-to-r from-champagne-gold via-golden-400 to-golden-500 bg-clip-text text-transparent hover:animate-shimmer cursor-default">
                                RCF FUTA ICT
                            </span>
                            <span className="inline-block ml-2 text-lg animate-bounce-gentle">
                                ⚡
                            </span>
                        </p>
                    </Link>

                    {/* Social links or additional info */}
                    <div className="flex items-center space-x-6 text-pearl-400 text-sm">
                        {/* <div className="flex items-center space-x-2 hover:text-champagne-gold transition-colors duration-300 cursor-pointer">
                            <span className="animate-sparkle">📧</span>
                            <span className="font-elegant">Contact</span>
                        </div>
                        <div className="w-px h-4 bg-pearl-600"></div>
                        <div className="flex items-center space-x-2 hover:text-romance-400 transition-colors duration-300 cursor-pointer">
                            <span className="animate-pulse-romantic">💝</span>
                            <span className="font-elegant">Support</span>
                        </div> */}
                        {/* <div className="w-px h-4 bg-pearl-600"></div> */}
                        <Link href={"/privacy"} className="flex items-center space-x-2 hover:text-luxury-400 transition-colors duration-300 cursor-pointer">
                            <span className="animate-twinkle">🔒</span>
                            <span className="font-elegant">Privacy</span>
                        </Link>
                    </div>

                    {/* Copyright */}
                    <div className="pt-4 border-t border-white/5 w-full">
                        <p className="text-xs text-pearl-500 font-elegant tracking-wide">
                            © {new Date().getFullYear()}{" "}
                            <span className="font-medium text-pearl-400 hover:text-champagne-gold transition-colors duration-300 cursor-default">
                                RCF FUTA
                            </span>
                            . All rights reserved.
                            <span className="inline-block ml-2 animate-sparkle opacity-50">
                                ✨
                            </span>
                        </p>
                    </div>

                    {/* Floating hearts for romantic touch */}
                    <div className="absolute bottom-4 left-8 opacity-20">
                        <div className="animate-float text-romance-400">💕</div>
                    </div>
                    <div className="absolute top-8 right-12 opacity-15">
                        <div
                            className="animate-float-slow text-champagne-gold"
                            style={{ animationDelay: "1s" }}
                        >
                            🌟
                        </div>
                    </div>
                    <div className="absolute bottom-12 right-8 opacity-25">
                        <div
                            className="animate-drift text-luxury-400"
                            style={{ animationDelay: "2s" }}
                        >
                            ✨
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom gradient glow */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-champagne-gold/5 via-transparent to-transparent pointer-events-none"></div>

            {/* Subtle particle effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/6 w-1 h-1 bg-golden-300 rounded-full animate-twinkle opacity-30"></div>
                <div
                    className="absolute bottom-1/3 right-1/4 w-0.5 h-0.5 bg-romance-300 rounded-full animate-sparkle opacity-40"
                    style={{ animationDelay: "3s" }}
                ></div>
                <div
                    className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-luxury-300 rounded-full animate-pulse-romantic opacity-20"
                    style={{ animationDelay: "4s" }}
                ></div>
            </div>
        </footer>
    );
}
