'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React, { Fragment } from 'react';
import Attribution from '../Attribution';



interface AuthModalProps {
    show?: boolean;
}

export default function AwaitModal(props: AuthModalProps) {

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
                {
                    props.show && (
                        <motion.div 
                            className="auth-modal"
                        >
                            <motion.div variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit" className="auth-modal-content donna">

                                <h1 className="text-center clr-primary ff-riffic fw-700 lh-60">
                                    Voting will start very soon!
                                </h1>

                                <Attribution />

                            </motion.div>

                        </motion.div>
                    )
                }
            </AnimatePresence>

        </Fragment>
    )
}