'use client';


import AuthModal from '@/components/Vote/AuthModal';
import React, { useState } from 'react';
import AwaitModal from './AwaitModal';


export default function VoteWrapper() {
    const [auth, setAuth] = useState(true);
    const [done, setDone] = useState(false);

    return (
        <>
            <AuthModal show={auth} onHide={()=>{
                setAuth(false)
                setDone(true)
            }}/>
            <AwaitModal show={done}/>
        </>
    )
}