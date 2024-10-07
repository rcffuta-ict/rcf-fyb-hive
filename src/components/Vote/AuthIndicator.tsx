'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React, { Fragment } from 'react';
import Attribution from '../Attribution';



interface AuthModalProps {
    user: any;
}

export default function AuthIndicator(props: AuthModalProps) {

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
                <motion.div 
                    className="auth-indicator-wrapper"
                >
                    <motion.div variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit" className="auth-modal-content donna">

                        <h1 className="text-center clr-primary ff-riffic fw-700 fs-14">
                            Logged In as: Precious Olusola
                        </h1>

                        {/* <Attribution /> */}

                    </motion.div>

                </motion.div>
            </AnimatePresence>

        </Fragment>
    )
}