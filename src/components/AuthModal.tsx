'use client';
import { Form, message } from 'antd';
import React, { Fragment, useState } from 'react';
import { FormError } from './Form/form.interface';
import { validateAuthenticationForm } from '@/utils/validate-form';
import { VoterModel, VoterObject } from '@/lib/nobox/record-structures/voter';
import { submitForm } from '@/utils/submit';
import { openNotificationWithIcon } from '@/utils/notification';
import TextInput from './Form/TextInput';
import CheckInput from './Form/CheckInput';
import Attribution from './Attribution';


export default function AuthModal() {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const [formData, setFormData] = useState<any>({});
    const [formerror, setFormError] = useState<FormError | null>(null);
    const [loading, setLoading] = useState(false);


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

    const handleFinish = async () => {
        // console.debug(formData)
        // return null;
        const _errors = validateAuthenticationForm(formData);

        if (_errors) {
            setFormError(()=>_errors);
            messageApi.error('There are issues with your information');
            return;
        }

        setLoading(true);

        messageApi.open({
            type: 'loading',
            content: 'Registering you...',
            duration: 0,
            key: 'loader-1'
        });

        const g = await VoterModel.findOne({email: formData.email});

        if (g) {
            messageApi.destroy('loader-1');
            messageApi.error('There is an issue with your information');
            setFormError((p)=>{
                return {
                    email: 'You cannot use this email address'
                }
            });
            setLoading(false);
            return
        }

        const _d = {...formData};

        delete _d['confirm_password'];

        submitForm(_d)
        .then(async (voter: VoterObject)=>{
            // console.debug(voter);
            setFormError(()=>null);
            openNotificationWithIcon('success', 'Form Submitted', "Your've been registered! Check back soon to vote.");
        })
        .catch((err)=>{
            console.error(err);
            openNotificationWithIcon('error', 'Unable to create account', 'Could not register you!');
        })
        .finally(()=>{
            messageApi.destroy('loader-1');
            setLoading(false);
        })
        
    }

    const getValue = (key:string) => {
        return {
            // ...dummyData,
            ...formData
        }[key]
    }

    return (
        <Fragment>
            {contextHolder}

            <div className="auth-modal">
                <div className="auth-modal-content">

                    <h1 className="text-center clr-primary ff-riffic fw-700 lh-60">
                        Alright! Let&apos;s set you up.
                    </h1>


                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleFinish}
                        autoComplete="off"
                        // initialValues={formData}
                    >


                        <div className="form-group mt-1">
                            <TextInput
                                disable={loading}
                                name="name"
                                label="Full Name"
                                onChange={handleElemChange}
                                getValue={getValue}
                                required
                                error={formerror}
                            />

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
                        </div>



                        {/* <br/> */}




                        <CheckInput
                            label="What level?"
                            name="level"
                            onChange={handleElemChange}
                            getValue={getValue}
                            className='my-1'
                            options={[
                                {
                                    id:'level-100',
                                    label: '100 Level',
                                    icon: '',
                                    value: '100',
                                },
                                {
                                    id:'level-200',
                                    label: '200 Level',
                                    icon: '',
                                    value: '200',
                                },
                                {
                                    id:'level-300',
                                    label: '300 Level',
                                    icon: '',
                                    value: '300',
                                },
                                {
                                    id:'level-400',
                                    label: '400 Level',
                                    icon: '',
                                    value: '400',
                                    disable: true,
                                },
                                {
                                    id:'level-500',
                                    label: '500 Level',
                                    icon: '',
                                    value: '500',
                                    disable: true,
                                },
                            ]}
                            required
                            error={formerror}
                            disable={loading}
                        />

                        {/* <br/> */}


                        <div className="form-group ">
                            <TextInput
                                name="password"
                                label="Set a password for yourself"
                                password
                                onChange={handleElemChange}
                                getValue={getValue}
                                required
                                error={formerror}
                                disable={loading}
                            />
                            <TextInput
                                name="confirm_password"
                                label="Type your password again"
                                password
                                onChange={handleElemChange}
                                getValue={getValue}
                                required
                                error={formerror}
                                disable={loading}
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
                            >
                                {loading ? 'Loading...': 'Submit'}
                            </button>
                        </div>
                        <br/>
                        <Attribution />
                    </Form>

                </div>

            </div>
        </Fragment>
    )
}