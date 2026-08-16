/**
 * Skeleton of the ballot itself — a stack of categories, each with a rail of
 * candidate cards — so the page doesn't reflow into a different shape once the
 * real thing arrives.
 */
export default function Loading(): React.JSX.Element {
    return (
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
            <div className="mx-auto h-3 w-24 skeleton" />
            <div className="mx-auto mt-4 h-10 w-64 skeleton" />
            <div className="mx-auto mt-3 h-4 w-80 max-w-full skeleton" />

            <div className="surface mt-8 flex items-center gap-4 p-4">
                <div className="h-11 w-11 shrink-0 rounded-full skeleton" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 skeleton" />
                    <div className="h-1.5 w-full skeleton" />
                </div>
            </div>

            <div className="mt-10 space-y-14">
                {[0, 1, 2].map((row) => (
                    <div key={row}>
                        <div className="h-3 w-10 skeleton" />
                        <div className="mt-2 h-7 w-72 max-w-full skeleton" />
                        <div className="mt-2 h-4 w-96 max-w-full skeleton" />
                        <div className="mt-4 flex gap-3 overflow-hidden">
                            {[0, 1, 2, 3, 4].map((card) => (
                                <div key={card} className="w-40 shrink-0 sm:w-48">
                                    <div className="aspect-[4/5] w-full skeleton" />
                                    <div className="mx-auto mt-3 h-4 w-28 skeleton" />
                                    <div className="mx-auto mt-2.5 h-3 w-20 skeleton" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
