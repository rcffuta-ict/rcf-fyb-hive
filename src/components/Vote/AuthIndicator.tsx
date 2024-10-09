'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React, { Fragment } from 'react';
import { VoterObject } from '@/lib/nobox/record-structures/voter';
import { useVote } from '@/context/VoteContext';
import AuthModal from './AuthModal';




export default function AuthIndicator() {

    const { user, updateUser } = useVote();

    
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
    

    if (!user) return <AuthModal onHide={(user: any)=>updateUser(user)} />;

    return (
        <Fragment>

            <AnimatePresence>
                <motion.div 
                    className="auth-indicator-wrapper"
                >
                    <motion.div variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit" className="auth-modal-content donna"
                    >

                        <h1 className="text-center clr-primary ff-riffic fw-700 fs-14">
                            Logged In as: {user.name}
                        </h1>

                    </motion.div>

                </motion.div>
            </AnimatePresence>

        </Fragment>
    )
}