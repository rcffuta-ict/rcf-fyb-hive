/** Skeleton for the standard page: a header, then a stack of award cards. */
export default function Loading(): React.JSX.Element {
    return (
        <section className="mx-auto max-w-3xl animate-pulse px-4 py-12 sm:px-6">
            <div className="mx-auto h-3 w-24 rounded bg-muted" />
            <div className="mx-auto mt-4 h-10 w-3/4 rounded bg-muted" />
            <div className="mx-auto mt-4 h-4 w-full max-w-2xl rounded bg-muted" />
            <div className="mt-10 h-24 rounded-token bg-muted" />

            <div className="mt-12 grid gap-3 sm:grid-cols-3">
                {[0, 1, 2].map((key) => (
                    <div key={key} className="h-32 rounded-token bg-muted" />
                ))}
            </div>

            <div className="mt-12 space-y-4">
                {[0, 1, 2, 3].map((key) => (
                    <div key={key} className="h-56 rounded-token bg-muted" />
                ))}
            </div>
        </section>
    );
}
