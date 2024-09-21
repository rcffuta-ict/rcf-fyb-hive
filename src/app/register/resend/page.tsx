import EmailForm from "@/components/Register/EmailForm";

export default function ResendEmailPage() {
    return (
        <>
            <h1 className="text-center clr-primary ff-riffic fw-700 fs-24 lh-30">
                FYB registration Emaiiling
            </h1>
            <br/><br/>
            <section className="registration-container">

                <div className="tab-content">
                    <EmailForm />
                </div>
            </section>
            <br/>
        </>
    )
}