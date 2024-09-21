'use client'

import { FormEvent, useState } from "react"
import ImageUpload from "../ImageUpload";
import TextInput from "../Form/TextInput";
import { FormError } from "../Form/form.interface";
import Image from "next/image";

export default function TicketForm() {
    const [formData, setFormData] = useState<any>({});

    const [maleConsent, setMaleConsent] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const [formerror, setFormError] = useState<FormError | null>(null);


    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
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
            // ...dummyData,
            ...formData
        }[key]
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="ticket-form">
                <div>
                    <div className="img-wrapper">
                        <Image
                            src={'/images/male.svg'}
                            alt="Male figure"
                            width={100}
                            height={100}
                        />
                    </div>

                    <br/>
                    <TextInput
                        disable={loading}
                        name="consent-male"
                        label="Enter consent Token"
                        placeholder="FYB-XXXXXX"
                        onChange={handleElemChange}
                        getValue={getValue}
                        error={formerror}
                        required
                        toUpperCase
                    />
                </div>
                <div>
                    <button>
                        Buy Ticket
                    </button>
                </div>
                <div>
                    <div className="img-wrapper">
                        <Image
                            src={'/images/female.svg'}
                            alt="Female figure"
                            width={100}
                            height={100}
                        />
                    </div>
                    <br/>
                    <TextInput
                        disable={loading}
                        name="consent-female"
                        label="Enter consent Token"
                        placeholder="FYB-XXXXXX"
                        onChange={handleElemChange}
                        getValue={getValue}
                        required
                        error={formerror}
                        toUpperCase
                    />
                </div>
            </form>
        </>
    )
}