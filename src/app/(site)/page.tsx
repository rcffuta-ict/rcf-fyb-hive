import Hero from "./_sections/hero";
import EventSection from "./_sections/event-section";
import ExploreSection from "./_sections/explore-section";
import CtaBand from "./_sections/cta-band";

export default function HomePage(): React.JSX.Element {
    return (
        <>
            <Hero />
            <EventSection />
            <ExploreSection />
            <CtaBand />
        </>
    );
}
