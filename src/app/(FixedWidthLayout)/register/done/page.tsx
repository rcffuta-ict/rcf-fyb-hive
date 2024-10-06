import NavCta from "@/components/Nav";
import Image from "next/image";
import { Fragment } from "react";


export default function Done() {
    return (
        <Fragment>
            <div className="img-wrapper">
                <Image
                    src={'/images/thumbs.png'}
                    alt="Welldone"
                    width={205}
                    height={205}
                />
            </div>

            <h1 className="text-center clr-primary ff-riffic fw-700 fs-48 lh-60">
                Registered!
            </h1>
            <br/>
            <p className="fw-400 fs-14 lh-21 text-center">
                Welcome to the Place Where Good Things<br/>Never Cease
            </p>

            <br/><br/>

            <NavCta />
        </Fragment>
    )   
}
