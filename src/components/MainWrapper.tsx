import { Fragment, PropsWithChildren } from "react";

export default function MainWrapper(props: PropsWithChildren) {
    return (
        <main>
            {/* <section className="main-wrapper">
                <div className="main-content">
                    <br/>
                </div>
            </section> */}
            {props.children}
        </main>
    )
}