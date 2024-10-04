'use client';
import { Form, message } from "antd";
import { useState } from "react";
import { openNotificationWithIcon } from "@/utils/notification";
import ImageUpload from "../ImageUpload";
import TextInput from "../Form/TextInput";
import { FormError } from "../Form/form.interface";
import { GuestModel, GuestObject } from "@/lib/nobox/record-structures/Guest";
import axios from "axios";
import CheckInput from "../Form/CheckInput";
import { useRouter } from "next/navigation";


export default function EmailForm(){
    const [form] = Form.useForm();
    const router = useRouter();

    const [formData, setFormData] = useState<any>(()=>{
        return {}
    });
    const [messageApi, contextHolder] = message.useMessage();
    const [formerror, setFormError] = useState<FormError | null>(null);
    const [loading, setLoading] = useState(false);
    const [guests, setGuests] = useState<{guest: GuestObject, associate: GuestObject | null} | undefined>();
    const [verifying, setVerifying] = useState(false);


    const handleFinish = async () => {
        
        setLoading(true);
        messageApi.open({
            type: 'loading',
            content: 'Verifying your details...',
            duration: 0,
            key: 'loader-1'
        });

        if (!guests) {
            messageApi.destroy('loader-1');

            messageApi.error('No guest to mail');
            setLoading(false);
            return;
        }

        messageApi.destroy('loader-1');

        messageApi.open({
            type: 'loading',
            content: 'Sending mail...',
            duration: 0,
            key: 'loader-1'
        });

        let mailAway: Promise<any> | undefined = undefined;


        const {guest, associate} = guests;
        if (guests?.associate) {
            mailAway = axios.post('/api/mail-associate', { guest, associate})
        } else {
            mailAway = axios.post('/api/mail-finalist', { guest });
        }

        mailAway.then(()=>{
            // Show a success notification
            setFormError(()=>null);
            openNotificationWithIcon('success', 'Check your mail', `Please check your email address(${(formData as any).email})`, true);
            // router.replace('/register/done?e=' + formData.email);
            router.refresh();
        })
        .catch((err)=>{
            console.error(err);
            openNotificationWithIcon('error', 'Unable to send mail', 'Could not send mail, contact admin.');

        })
        .finally(()=>{
            messageApi.destroy('loader-1');
            setLoading(false);
        })
        
    }


    const verifyEmail = async () => {
        const {email, gender} = formData;
        // console.log({associateId, gender});

        setVerifying(true);
        // messageApi.destroy('loader-1');
        messageApi.open({
            type: 'loading',
            content: 'Verifying consent...',
            duration: 0,
            key: 'loader-1'
        });

        // const consent = parseConsent(associateId);


        if (!email) {

            messageApi.destroy('loader-1');
            messageApi.error('Please provide a valid email address');

            setFormError((p)=>{
                return {
                    ...p,
                    email: 'Email is required'
                }    
            });

            setVerifying(false);
            return;
        }

        const guest = await GuestModel.findOne({email: email});

        if (!guest) {
            messageApi.destroy('loader-1');
            // messageApi.error('There is an issue with your info');
            openNotificationWithIcon('error', 'Unrecognized Mail address', 'Email address not recognized');


            setFormError((p)=>{
                return {
                    ...p,
                    email: 'Email address not recognized'
                }    
            });

            setVerifying(false);
            return;
        } else {
            openNotificationWithIcon('success', 'Found Mail address', 'Found guest info');
        }

        // console.log(associateId)
        const otherAssociate = await GuestModel.search({
            searchableFields: ['associateId'],
            searchText: (guest.consentId as string)
        }) as unknown as GuestObject[];

        let associate:GuestObject | null = null;

        if (otherAssociate.length > 0) {
            messageApi.destroy('loader-1');
            // messageApi.error('There is an issue with your info');
            associate = otherAssociate.filter((each)=>each.email !== email)[0] || null;

            if (associate) {
                openNotificationWithIcon('success', 'Associate', 'Guest has an associate');
            }
        }


        setFormError((p: any)=>{
            return {}
        });

        messageApi.destroy('loader-1');
        openNotificationWithIcon('success', 'Verified', 'Email verified!');
        setVerifying(false);

        setGuests(()=>{
            // console.debug({guest, associate})
            return {
                guest,
                associate
            }
        });
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
            ...(guests ? guests.guest : {}),
            ...formData
        }[key]
    }


    const canProceed = Boolean(guests?.guest);

    // console.log(guests);

    return (
        <>
            {contextHolder}
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
                        disable={true}
                    />


                    <div className="form-group group-col">
                        <TextInput
                            name="email"
                            label="Your email address"
                            // placeholder="FYB-XXXXXX"
                            // maxLength={10}
                            onChange={handleElemChange}
                            getValue={getValue}
                            required
                            error={formerror}
                            disable={loading}
                            // toUpperCase
                        />
                        
                        <CheckInput
                            label="Select your gender"
                            name="gender"
                            onChange={handleElemChange}
                            getValue={getValue}
                            error={formerror}
                            // disable={!canProceed && !loading}
                            disable={!canProceed}
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


                <div
                    className="steps-action"
                >
                    <button
                        className="btn btn-primary text-uppercase btn-submit fw-700 fs-18"
                        // onClick={handl}
                        title='Submit'
                        type='submit'
                        disabled={loading}
                        data-hide={!canProceed}
                    >
                        {loading ? 'Loading...': 'Send Mail'}
                    </button>

                    <button
                        className="btn btn-primary btn-verify text-uppercase btn-submit fw-700 fs-18"
                        // onClick={handl}
                        title='Verify'
                        type='button'
                        onClick={verifyEmail}
                        disabled={loading || verifying}
                        data-hide={canProceed}
                    >
                        {verifying ? 'Checking...': 'Check'}
                    </button>
                </div>
            </Form>
        </>
    )
}
