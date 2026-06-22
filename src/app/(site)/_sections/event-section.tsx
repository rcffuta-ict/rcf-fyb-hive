import { CalendarDays, Clock, MapPin, Shirt, Users } from "lucide-react";

import { site } from "@/config/site";

const eventDate = new Date(site.event.dateISO);

const formatted = {
    date: new Intl.DateTimeFormat("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(eventDate),
    time: new Intl.DateTimeFormat("en-NG", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(eventDate),
};

const details = [
    { icon: CalendarDays, label: "Date", value: formatted.date },
    { icon: Clock, label: "Time", value: formatted.time },
    { icon: MapPin, label: "Venue", value: site.event.venue },
    { icon: Shirt, label: "Dress code", value: site.event.dressCode },
];

const EventSection = (): React.JSX.Element => {
    return (
        <section id="event" className="scroll-mt-20 bg-card/40 py-20 md:py-28">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
                <div className="mx-auto max-w-2xl text-center">
                    <span className="eyebrow mb-4">{site.copy.aboutEyebrow}</span>
                    <h2 className="font-luxury text-foreground">{site.event.title}</h2>
                    <p className="mx-auto mt-5 max-w-xl text-balance font-elegant text-lg text-foreground/70">
                        {site.copy.aboutBody}
                    </p>
                </div>

                <dl className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {details.map(({ icon: Icon, label, value }, i) => (
                        <div
                            key={label}
                            className="surface-interactive flex animate-slide-up flex-col gap-3 p-6"
                            style={{ animationDelay: `${i * 80}ms` }}
                        >
                            <span className="flex h-11 w-11 items-center justify-center rounded-token bg-accent text-primary">
                                <Icon size={20} />
                            </span>
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {label}
                                </dt>
                                <dd className="mt-1 font-medium text-foreground">{value}</dd>
                            </div>
                        </div>
                    ))}
                </dl>

                <div className="surface mt-5 flex items-center gap-3 p-6">
                    <Users className="shrink-0 text-primary" size={22} />
                    <p className="text-sm text-foreground/80">
                        <span className="font-semibold text-foreground">Who it&apos;s for:</span>{" "}
                        {site.event.audience}.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default EventSection;
