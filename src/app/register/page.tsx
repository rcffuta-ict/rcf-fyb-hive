import RegistrationForm from "../../components/Register";
import TestConnection from "../../components/TestConnection";




export default function Register() {
    return (
        <>
            <h1 className="text-center clr-primary ff-riffic fw-700 fs-24 lh-30">
                FYB registration
            </h1>

            <br/><br/>
            <RegistrationForm/>
            <br/><br/>
            <TestConnection/>

            <p className="attribution">
                © 2024 Army of Light Family, RCF FUTA. All rights reserved.
            </p>
        </>
    )   
}
