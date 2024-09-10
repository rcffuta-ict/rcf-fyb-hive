
import ImageUpload from "../ImageUpload";
import TextInput from "../Form/TextInput";
import CheckInput from "../Form/CheckInput";
import { Form } from "antd";
import { useState } from "react";
import { openNotificationWithIcon } from "@/utils/notification";
import { FormError } from "../Form/form.interface";
import { GuestAccount, GuestModel } from "@/lib/nobox/record-structures/Guest";
import axios from "axios";
import { validateFinalistForm } from "@/utils/validate-form";
import submitData from "@/utils/submit";

const dummyData:any = {
    // "contact": "8122137834",
    // "email": "preciousolusola16@gmail.com",
    // "exco": false,
    // "firstname": "Precious",
    // "gender": "male",
    // "lastname": "Olusola",
    // "partV": true,
    // "picture": "https://nobox-upload-bucket.s3.eu-west-2.amazonaws.com/uploads/9c60fb7e-2653-46d3-b160-ec10e60d8ce6_rcf-logo.png",
    // "worker": false
}


export default function FinalistForm(){
    const [form] = Form.useForm();

    const [formData, setFormData] = useState<any>(()=>{
        return {...dummyData}
    });
    const [formerror, setFormError] = useState<FormError | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFinish = async () => {
        
        const _errors = validateFinalistForm(formData);

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


        submitData(formData, true)
        .then(async (guest: GuestAccount)=>{
            await axios.post('/api/mail-finalist', { guest });
        })
        .then(()=>{

            setFormData(()=>({}))
            setFormError(()=>null);
            // Show a success notification
            openNotificationWithIcon('success', 'Form Submitted', 'Your form has been submitted successfully!');
            openNotificationWithIcon('success', 'Check your mail', `Please check your email address(${(formData as any).email})`, true);
        })
        .catch((err)=>{
            console.error(err);
            openNotificationWithIcon('error', 'Unable to create account', 'Could not register!');
        })
        .finally(()=>{
            setLoading(false);
        })
        
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
    

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            autoComplete="off"
            initialValues={formData}
        >
            <div className="form-group">

                <ImageUpload
                    name="picture"
                    onChange={handleElemChange}
                    getValue={getValue}
                    error={formerror}
                    disable={loading}
                />

                <div className="form-group group-col py-2">

                    <CheckInput
                        label="Select your gender"
                        name="gender"
                        onChange={handleElemChange}
                        getValue={getValue}
                        error={formerror}
                        disable={loading}
                        options={[
                            {
                                id:'gender-male',
                                label: 'Male',
                                icon: 'icon-male',
                                value: 'male',
                            },
                            {
                                id:'gender-female',
                                label: 'Female',
                                icon: 'icon-female',
                                value: 'female',
                            }
                        ]}
                    />

                    <CheckInput
                        label="Part IV or Part V"
                        name="partV"
                        onChange={handleElemChange}
                        getValue={getValue}
                        error={formerror}
                        disable={loading}
                        options={[
                            {
                                id:'part-iv',
                                label: 'Part IV',
                                icon: 'icon-graduation-iv',
                                value: false,
                            },
                            {
                                id:'part-v',
                                label: 'Part V',
                                icon: 'icon-graduation-v',
                                value: true,
                            }
                        ]}
                    />
                </div>

            </div>
            <br/>

            <div className="form-group">
                <TextInput
                    disable={loading}
                    name="firstname"
                    label="First Name"
                    onChange={handleElemChange}
                    getValue={getValue}
                    required
                    error={formerror}
                />

                <TextInput
                    disable={loading}
                    name="lastname"
                    label="Last Name"
                    onChange={handleElemChange}
                    getValue={getValue}
                    required
                    error={formerror}
                />
            </div>

            <br/>

            <div className="form-group">
                <TextInput
                    disable={loading}
                    name="email"
                    label="Email"
                    email
                    onChange={handleElemChange}
                    getValue={getValue}
                    required
                    error={formerror}
                />

                <TextInput
                    name="contact"
                    label="Phone Number"
                    tel
                    onChange={handleElemChange}
                    getValue={getValue}
                    required
                    error={formerror}
                    disable={loading}
                />

            </div>

            

            <br/>


            <div className="form-group">
                <div className="form-group group-col">

                    <CheckInput
                        label="Are you a worker?"
                        name="worker"
                        onChange={handleElemChange}
                        getValue={getValue}
                        options={[
                            {
                                id:'worker-yes',
                                label: 'Yes',
                                icon: 'icon-check',
                                value: true,
                            },
                            {
                                id:'worker-no',
                                label: 'No',
                                icon: 'icon-cross',
                                value: false,
                            }
                        ]}
                        required
                        error={formerror}
                        disable={loading}
                    />

                    <TextInput
                        name="unit"
                        label="Your unit"
                        onChange={handleElemChange}
                        getValue={getValue}
                        error={formerror}
                        disable={loading}
                    />

                </div>


                <div className="form-group group-col">

                    <CheckInput
                        label="Are you an executive"
                        name="exco"
                        onChange={handleElemChange}
                        getValue={getValue}
                        error={formerror}
                        disable={loading || getValue('worker') !== true}
                        options={[
                            {
                                id:'executive-yes',
                                label: 'Yes',
                                icon: 'icon-check-double',
                                value: true,
                            },
                            {
                                id:'executive-no',
                                label: 'No',
                                icon: 'icon-cross',
                                value: false,
                            }
                        ]}
                    />

                    <TextInput
                        name="portfolio"
                        label="Your Portfolio"
                        onChange={handleElemChange}
                        getValue={getValue}
                        error={formerror}
                        required
                        disable={loading}
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
                >
                    {loading ? 'Loading...': 'Submit'}
                </button>
            </div>
        </Form>
    )
}
