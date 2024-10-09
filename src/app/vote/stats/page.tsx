
import { Fragment } from "react";
import VoteWrapper from "../../../components/Vote/VoteWrapper";
import VoteListing from "@/components/Vote/VoteListing";
import AuthIndicator from "@/components/Vote/AuthIndicator";
import VoteStats from "@/components/Vote/VoteStats";


export default function Vote() {
    return (
        <Fragment>
            <div className="_heading">
                <h1 className="text-center clr-primary ff-riffic fw-700 fs-24 lh-30">
                    Vote Statistics
                </h1>

                <p>
                    Overview of Voting Results
                </p>
            </div>

            <br />

            {/* <VoteListing/> */}
            <VoteStats />

            {/* <VoteWrapper/> */}
        </Fragment>
    );
}