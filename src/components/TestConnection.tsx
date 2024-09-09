'use client';

import { GuestModel } from "@/lib/nobox/record-structures/Guest";
import { useEffect } from "react";

export default function TestConnection() {

    useEffect(()=>{
        (async ()=>{

            const guests = await GuestModel.find({});

            console.log(guests);
        })()
    },[])
    return null;
}