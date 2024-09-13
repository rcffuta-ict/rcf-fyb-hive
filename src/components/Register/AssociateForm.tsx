
import { Form } from "antd";
import { useState } from "react";
import { openNotificationWithIcon } from "@/utils/notification";
import ImageUpload from "../ImageUpload";
import TextInput from "../Form/TextInput";
import { FormError } from "../Form/form.interface";
import submitData from "@/utils/submit";
import { GuestAccount, GuestModel, GuestObject } from "@/lib/nobox/record-structures/Guest";
import axios from "axios";
import CheckInput from "../Form/CheckInput";
import { getNameByGender } from "@/utils/process-details";
import { validateAssociatetForm } from "@/utils/validate-form";
import { useRouter } from "next/navigation";


const dummyData:any = {
    // "contact": "8122137834",
    // "email": "preciousbusiness10@gmail.com",
    // "firstname": "Precious",
    // // "gender": "male",
    // "lastname": "Olusola",
    // "picture": "https://nobox-upload-bucket.s3.eu-west-2.amazonaws.com/uploads/9c60fb7e-2653-46d3-b160-ec10e60d8ce6_rcf-logo.png",
}


const parseConsent = (associateId:string)=>associateId.toLocaleLowerCase().replaceAll(' ','').replaceAll('fyb-', '')

export default function AssociateForm(){
    const [form] = Form.useForm();
    const router = useRouter();

    const [formData, setFormData] = useState<any>(()=>{
        return {...dummyData}
    });
    const [formerror, setFormError] = useState<FormError | null>(null);
    const [loading, setLoading] = useState(false);
    const [guest, setGuest] = useState<GuestObject | undefined>();
    const [verifying, setVerifying] = useState(false);


    const handleFinish = async () => {
        
        const _errors = validateAssociatetForm(formData);

        if (_errors) {
            setFormError(_errors);
            return;
        }
        
        setLoading(true);
        const g = await GuestModel.findOne({email: formData.email});

        if (g) {
            setFormError((p)=>{
                return {
                    email: 'You cannot use this email address' + ' ' + (formData.gender === 'male'? 'sir': 'ma').trim()
                }
            });
            setLoading(false);
            return
        }

        if (guest && (guest.gender === formData.gender)) {
            openNotificationWithIcon('error', 'Match error', 'Gender match error');

            setLoading(false);
            return;
        }


        const e = await GuestModel.findOne({contact: formData.contact});

        if (e) {
            setFormError((p)=>{
                return {
                    contact: 'You cannot use this contact info' + ' ' + (formData.gender === 'male'? 'sir': 'ma').trim()
                }
            });
            setLoading(false);
            return
        }


        submitData(formData)
        .then(async (associate: GuestAccount)=>{
            await axios.post('/api/mail-associate', { guest, associate});
        })
        .then(()=>{

            // setFormData(()=>({}))
            // Show a success notification
            setFormError(()=>null);
            openNotificationWithIcon('success', 'Form Submitted', 'Your form has been submitted successfully!');
            openNotificationWithIcon('success', 'Check your mail', `Please check your email address(${(formData as any).email})`, true);
            router.replace('/register/done?e=' + formData.email);
        })
        .catch((err)=>{
            console.error(err);
            openNotificationWithIcon('error', 'Unable to create account', 'Could not register!');

        })
        .finally(()=>{
            setLoading(false);
        })
        
    }


    const verifyConsentToken = async () => {
        const {associateId, gender} = formData;
        // console.log({associateId, gender});

        setVerifying(true);

        const consent = parseConsent(associateId);

        // console.log(consent);


        if (!associateId) {

            setFormError((p)=>{
                return {
                    ...p,
                    associateId: 'Consent token is required'
                }    
            });

            setVerifying(false);
            return;
        }

        if (!gender) {

            setFormError((p)=>{
                return {
                    ...p,
                    gender: 'Your gender please?'
                }    
            });

            setVerifying(false);
            return;
        }

        const guest = await GuestModel.findOne({consentId: consent});

        if (!guest) {
            openNotificationWithIcon('error', 'Unrecognized Consent', 'Consent not recognized');


            setFormError((p)=>{
                return {
                    ...p,
                    associateId: 'Unrecognized consent'
                }    
            });

            setVerifying(false);
            return;
        }

        if (guest.gender === gender) {
            openNotificationWithIcon('error', 'Match error', 'Gender match error');

            setVerifying(false);
            return;
        }

        // console.log(associateId)
        const otherAssociate = await GuestModel.search({
            searchableFields: ['associateId'],
            searchText: associateId
        }) as unknown as GuestObject[];

        if (otherAssociate.length > 0) {
            openNotificationWithIcon('error', 'Consent error', 'Cannot register with given consent');

            setVerifying(false);
            return;
        }


        setFormError((p: any)=>{
            return {}
        });

        openNotificationWithIcon('success', 'Verified', 'Consent verified!');
        setVerifying(false);
        setGuest(guest);
    }


    const handleElemChange = (key:string, val:any)=>{
        setFormError((p)=>{
            if (!p) return null;
            return null;
        })
        setFormData((prev: any)=>(
            {
                ...prev,
                [key]: val
            }
        ));
    }

    const getValue = (key:string) => {
        return {
            ...dummyData,
            ...formData
        }[key]
    }


    const canProceed = Boolean(guest);

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            // initialValues={formData}
        >
            <div className="form-group">

                <ImageUpload
                    name="picture"
                    onChange={handleElemChange}
                    getValue={getValue}
                    error={formerror}
                    disable={loading}
                />


                <div className="form-group group-col">
                    <TextInput
                        name="associateId"
                        label="Finalist consent token"
                        placeholder="FYB-XXXXXX"
                        maxLength={10}
                        onChange={handleElemChange}
                        getValue={getValue}
                        required
                        error={formerror}
                        disable={loading}
                        toUpperCase
                    />
                    
                    <CheckInput
                        label="Select your gender"
                        name="gender"
                        onChange={handleElemChange}
                        getValue={getValue}
                        error={formerror}
                        // disable={!canProceed && !loading}
                        disable={loading}
                        options={[
                            {
                                id:'gender-male',
                                label: 'Male',
                                icon: 'icon-male',
                                value: 'male'
                            },
                            {
                                id:'gender-female',
                                label: 'Female',
                                icon: 'icon-female',
                                value: 'female'
                            }
                        ]}
                    />

                    
                </div>

            </div>
            <br/>


            <div className="rest-form" data-disabled={!canProceed}>

                <div className="form-group">
                    <TextInput
                        name="firstname"
                        label="First Name"
                        onChange={handleElemChange}
                        getValue={getValue}
                        required
                        error={formerror}
                        disable={!canProceed && !loading}
                    />

                    <TextInput
                        name="lastname"
                        label="Last Name"
                        onChange={handleElemChange}
                        getValue={getValue}
                        required
                        error={formerror}
                        disable={!canProceed && !loading}
                    />
                </div>

                <br/>

                <div className="form-group">
                    <TextInput
                        name="email"
                        label="Email"
                        onChange={handleElemChange}
                        getValue={getValue}
                        required
                        error={formerror}
                        disable={!canProceed && !loading}
                        email
                    />

                    <TextInput
                        name="contact"
                        label="Phone Number"
                        onChange={handleElemChange}
                        getValue={getValue}
                        required
                        error={formerror}
                        disable={!canProceed && !loading}
                        tel
                    />

                </div>

                <br/>


                <TextInput
                    name="relationsipWithAssociate"
                    label={`Relationship with ${getNameByGender(guest)}?`}
                    onChange={handleElemChange}
                    getValue={getValue}
                    required
                    error={formerror}
                    disable={!canProceed && !loading}
                />

            </div>


            <br/>


            <div
                className="steps-action"
            >
                <button
                    className="btn btn-primary text-uppercase btn-submit fw-700 fs-18"
                    // onClick={handl}
                    title='Submit'
                    type='submit'
                    disabled={loading}
                    data-hide={!Boolean(guest)}
                >
                    {loading ? 'Loading...': 'Submit'}
                </button>

                <button
                    className="btn btn-primary btn-verify text-uppercase btn-submit fw-700 fs-18"
                    // onClick={handl}
                    title='Verify'
                    type='button'
                    onClick={verifyConsentToken}
                    disabled={loading || verifying}
                    data-hide={Boolean(guest)}
                >
                    {verifying ? 'Verifying...': 'Verify'}
                </button>
            </div>
        </Form>
    )
}
