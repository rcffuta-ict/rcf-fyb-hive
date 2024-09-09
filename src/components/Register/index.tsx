'use client';

import { useState } from 'react';
import FinalistForm from './FinalistForm';
import AssociateForm from './AssociateForm';



export default function RegistrationForm() {
    const [currentTab, setCurrentTab] = useState(0);

    const tabs = [
        { title: 'Register as a finalist', content: <FinalistForm /> },
        { title: 'Register an associate', content: <AssociateForm /> },
    ];

    const handleTabClick = (index: number) => {
        setCurrentTab(index);
    };

    return (
        <section className="registration-container">
            <div className="tabs">
                {tabs.map((tab, index) => (
                <button
                    key={index}
                    className={`tab-button ${currentTab === index ? 'active' : ''}`}
                    onClick={() => handleTabClick(index)}
                >
                    {tab.title}
                </button>
                ))}
            </div>

            <div className="tab-content">
                {tabs[currentTab].content}
            </div>
        </section>
        
    );
}
