import Spacer from "@/app/components/ui/Spacer";
import { Fragment, PropsWithChildren } from "react";

export default function MainWrapper(props: PropsWithChildren) {
    return (
        <>
            {/* <section className="main-wrapper">
                <div className="main-content">
                    <br/>
                </div>
            </section> */}
            <Spacer />
            {props.children}
        </>
    );
}