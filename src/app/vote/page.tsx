
import { Fragment } from "react";
import VoteWrapper from "../../components/Vote/VoteWrapper";
import VoteListing from "@/components/Vote/VoteListing";


export default function Vote() {
    return (
        <Fragment>

            <div className="_heading">
                <h1 className="text-center clr-primary ff-riffic fw-700 fs-24 lh-30">
                    Vote Spotlight
                </h1>

                <p>
                    Welcome to RCF-FYB Award vote spotlight, 
                    where your vote decides the winners! Explore the nominees, cast your votes, and help us celebrate our FYB. Your voice matters—let&apos;s crown the winners together!
                </p>
            </div>

            <br/>

            <VoteListing/>

            <VoteWrapper/>
        </Fragment>
    )
}