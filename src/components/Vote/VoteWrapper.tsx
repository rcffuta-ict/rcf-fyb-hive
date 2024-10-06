'use client';

import AuthModal from '@/components/Vote/AuthModal';
import React, { useState } from 'react';


export default function VoteWrapper() {
    const [auth, setAuth] = useState(false);

    return (
        <>
            <AuthModal show={auth} onHide={()=>setAuth(false)}/>
        </>
    )
}