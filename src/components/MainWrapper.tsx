import { Fragment, PropsWithChildren } from "react";

export default function MainWrapper(props: PropsWithChildren) {
    return (
        <main>
            <section className="main-wrapper">
                <div className="main-content">
                    <br/>
                    {props.children}
                </div>
            </section>
        </main>
    )
}