"use client";

import { useState } from "react";
import FinalistForm from "./FinalistForm";
import AssociateForm from "./AssociateForm";

export default function RegistrationForm() {
    const [currentTab, setCurrentTab] = useState(0);

    const tabs = [
        {
            title: "Register as Finalist",
            subtitle: "For graduating students of RCFFUTA",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                    />
                </svg>
            ),
            content: <FinalistForm />,
        },
        {
            title: "Register Associate",
            subtitle: "For non-graduating students of RCFFUTA",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
            ),
            content: <AssociateForm />,
        },
    ];

    const handleTabClick = (index: number) => {
        setCurrentTab(index);
    };

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-champagne-gold to-golden-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-serif text-pearl-100 mb-2">
                        Register For Dinner
                    </h1>
                    <p className="text-pearl-400 max-w-2xl mx-auto">
                        Choose your registration type below to get started with
                        your application
                    </p>
                </div>

                {/* Registration Card */}
                <div className="bg-pearl-800/40 backdrop-blur-md border border-pearl-700/50 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="border-b border-pearl-700/50">
                        <div className="flex">
                            {tabs.map((tab, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleTabClick(index)}
                                    className={`flex-1 relative px-6 py-6 text-left transition-all duration-300 ${
                                        currentTab === index
                                            ? "bg-pearl-700/30 text-pearl-100"
                                            : "text-pearl-400 hover:text-pearl-200 hover:bg-pearl-700/20"
                                    }`}
                                >
                                    <div className="flex flex-col items-center space-y-4 space-x-3">
                                        <div
                                            className={`flex-shrink-0 p-2 rounded-lg transition-colors duration-300 ${
                                                currentTab === index
                                                    ? "bg-champagne-gold text-white"
                                                    : "bg-pearl-600/50 text-pearl-300"
                                            }`}
                                        >
                                            {tab.icon}
                                        </div>
                                        <div className="text-center">
                                            <h3 className="font-medium text-sm mb-1">
                                                {tab.title}
                                            </h3>
                                            <p
                                                className={`text-xs transition-colors duration-300 ${
                                                    currentTab === index
                                                        ? "text-pearl-300"
                                                        : "text-pearl-500"
                                                }`}
                                            >
                                                {tab.subtitle}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Active Tab Indicator */}
                                    {currentTab === index && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-champagne-gold to-golden-600"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="transition-all duration-300 ease-in-out px-1 py-5">
                        {tabs[currentTab].content}
                    </div>
                </div>

                {/* Help Text */}
                <div className="mt-6 text-center">
                    <p className="text-pearl-500 text-sm">
                        Need help? Contact our ICT team at{" "}
                        <a
                            href="mailto:ict@rcffuta.com"
                            className="text-champagne-gold hover:text-golden-400 hover:underline"
                        >
                            ic@rcffuta.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
