'use client';
import { Form, message } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import React, { Fragment, useEffect, useState } from 'react';
import { FormError } from '../Form/form.interface';
import { validateAuthenticationForm } from '@/utils/validate-form';
import { VoterModel, VoterObject } from '@/lib/nobox/record-structures/voter';
import TextInput from '../Form/TextInput';
import Attribution from '../Attribution';
import { useVote } from '@/context/VoteContext';



interface AuthModalProps {
    show?: boolean;
    onHide: (data: VoterObject)=>void;
}


export default function AuthModal(props: AuthModalProps) {

    const {messageApi, canVote} = useVote()

    const [form] = Form.useForm();

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

        if (!canVote) {
            message.info("Voting has ended!");
            return;
        }
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
            content: 'Checking you...',
            duration: 0,
            key: 'loader-1'
        });

        const g = await VoterModel.findOne({email: formData.email, password: formData.password});

        if (!g) {
            messageApi.destroy('loader-1');
            messageApi.error("Sorry you're not allowed!");
            setFormError((p)=>{
                return {
                    email: "It looks like you didn't register to vote",
                    password: 'Perhaps, your password may be wrong!'
                }
            });
            setLoading(false);
            return
        }


        props.onHide(g);
        
    }

    const getValue = (key:string) => {
        return {
            // ...dummyData,
            ...formData
        }[key]
    }


    const modalVariants = {
        hidden: {
            opacity: 0,
            y: "500vh",
        },
        visible: {
            opacity: 1,
            y: "0",
            transition: { duration: 0.5, ease: "easeInOut" }
        },
        exit: {
            opacity: 0,
            y: "100vh",
            transition: { duration: 0.3, ease: "easeInOut" }
        }
    };

    return (
        <Fragment>
            <AnimatePresence>
                <motion.div className="auth-modal">
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="auth-modal-content"
                    >
                        <h1 className="text-center clr-primary ff-riffic fw-700 lh-60">
                            Hello! Who are you?<br/>
                        {!canVote && <b className="error-display">Voting has ended!</b>}
                        </h1>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleFinish}
                            autoComplete="off"
                            // initialValues={formData}
                        >

                            <br />
                            <TextInput
                                disable={loading}
                                name="email"
                                label="What's your email address?"
                                email
                                onChange={handleElemChange}
                                getValue={getValue}
                                required
                                error={formerror}
                            />

                            <br />

                            <TextInput
                                name="password"
                                label="What's your password?"
                                password
                                onChange={handleElemChange}
                                getValue={getValue}
                                required
                                error={formerror}
                                disable={loading}
                            />

                            <br />

                            <div className="steps-action">
                                <button
                                    className="btn btn-primary text-uppercase btn-submit fw-700 fs-18"
                                    // onClick={handl}
                                    title="Login"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? "Loading..." : "Continue"}
                                </button>
                            </div>
                            <br />
                            <Attribution />
                        </Form>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </Fragment>
    );
}