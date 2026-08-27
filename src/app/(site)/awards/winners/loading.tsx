/**
 * The winners screen takes over the viewport, so its loading state has to as
 * well — a centred spinner on the site's ordinary page would flash the header
 * and footer in for a moment on the very screen that exists to hide them.
 */
const WinnersLoading = (): React.JSX.Element => {
    return (
        <div className="fixed inset-0 z-[60] overflow-hidden bg-background">
            <div aria-hidden className="hero-aurora absolute inset-0" />

            <div className="relative flex h-full flex-col items-center justify-center gap-[3vh] px-[6vw]">
                <div className="skeleton h-[clamp(1.5rem,4.4vw,4.5rem)] w-[min(80vw,32rem)]" />
                <div className="skeleton h-[clamp(0.95rem,1.9vw,2rem)] w-[min(70vw,24rem)]" />
                <div className="skeleton mt-[3vh] h-[clamp(7.5rem,26vh,17rem)] w-[clamp(7.5rem,26vh,17rem)] rounded-full" />
                <div className="skeleton h-[clamp(1.75rem,5.5vw,5rem)] w-[min(60vw,20rem)]" />
            </div>
        </div>
    );
};

export default WinnersLoading;
