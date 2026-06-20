
import Link from 'next/link';
import React from 'react';


export default function NavCta() {
    return (
        <div className="home-cta">
            <Link
                href={'/register'}
                className="btn btn-primary-outline text-uppercase"
            >
                Register
            </Link>

            <Link
                href={'/vote'}
                className="btn btn-primary-outline text-uppercase"
            >
                Vote Nominees
            </Link>

            <Link
                href={'/buy-ticket'}
                className="btn btn-primary-outline text-uppercase"
            >
                Pay for Dinner
            </Link>
        </div>
    )
}
