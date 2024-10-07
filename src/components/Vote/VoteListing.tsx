'use client';
import { useVote } from '@/context/VoteContext';
import { GuestObject } from '@/lib/nobox/record-structures/Guest';
import { VoteCategoryObject } from '@/lib/nobox/record-structures/voteCategory';
import { getGuestName } from '@/utils/process-details';
import { motion, useScroll, Variants } from 'framer-motion';
import Image from 'next/image';
import { Fragment, useEffect, useRef, useState } from 'react';
import Slider from "react-slick";

interface VoteCategoryListProps {
    variants: Variants;
    contestants: string[];
    category?: VoteCategoryObject;
}

interface VoteCardProps {
    contestantId: string;
    category: VoteCategoryObject;
}

const SkeletonVoteCard = () => {
    return (
        <div className="voter-card-container">
            <div className="avatar-wrapper">
                <div className="shimmer"></div>
            </div>
            <div className="voter-card-name">
                <div className="shimmer"></div>
            </div>
            <div className="voter-card-info">
                <div className="shimmer"></div>
            </div>
            <div className="voter-card-button">
                <div className="shimmer"></div>
            </div>
        </div>
    );
};

function VoteCard(props: VoteCardProps) {

    const {obtainGuestRecord} = useVote();
    const [guest, setGuest] = useState<GuestObject | null | undefined>();

    const checkRef = useRef<HTMLInputElement>(null);
    const handleSelect = () => {
        if(!checkRef.current) return;

        checkRef.current.checked = !checkRef.current.checked;
    }

    useEffect(()=>{
        (async ()=>{
            if (guest || guest == null) return;
            const _g = await obtainGuestRecord(props.contestantId)

            setGuest(()=>{
                if (!_g) return null;

                return _g;
            })
        })()
    }, [props.contestantId, guest, obtainGuestRecord])


    if (guest === undefined) return <SkeletonVoteCard/>

    if (guest === null) return null;

    return (
        <motion.div 
            className="voter-card-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
            exit={{ opacity: 0 }}
        >
            <div className="avatar-wrapper">
                {/* <div className="shimmer"></div> */}
                <Image
                    src={guest.picture}
                    alt={guest.firstname + ' Picture'}
                    width={200}
                    height={200}
                />
            </div>
            <div className="voter-card-name">
                {/* <div className="shimmer"></div> */}
                <p className='ff-riffic clr-primary fs-25'>
                    {getGuestName(guest)}
                </p>
                {/* <p className='fs-16'>
                    (Mama)
                </p> */}
            </div>
            <div className="voter-card-info">
                {/* <div className="shimmer"></div> */}
                <p className='ff-poppins fs-18 text-capitalize'>{props.category.label}</p>
            </div>

            <div className="voter-card-button">
                {/* <div className="shimmer"></div> */}

                <input ref={checkRef} type="radio" name='vote-check' id='vote-check'/>

                <button onClick={handleSelect}>
                    Vote
                </button>
            </div>
        </motion.div>
    )
}

function VoteCategoryList(props: VoteCategoryListProps) {

    const {loading} = useVote();

    return (
        <div
            className="carousel-item" 
        >
            <div className="vote-lists">        
                {
                    props.contestants.map((contestant, i)=>{

                        if (loading || !props.category) return <SkeletonVoteCard key={i}/>
                        return (
                            <VoteCard
                                key={i}
                                contestantId={contestant}
                                category={props.category}
                            />
                        )
                    })
                }
            </div>
        </div>
    )
}

export default function VoteListing() {
    const {voteList} = useVote();

    const slideVariants = {
        hidden: { opacity: 0, y: 50 },  // Slide enters from below
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
        exit: { opacity: 0, y: -50, transition: { duration: 0.8, ease: 'easeIn' } }  // Slide leaves upwards
    };

    return (
        <section className="carousel-container">

            {
                voteList.map((voteCategory)=>{
                    return (
                        <div className="vote-wrapper" key={voteCategory.categoryId}>

                            <div className="vote-header">

                                <h3 className='ff-riffic fs-25 lg-fs-48 text-capitalize'>{voteCategory.category?.label || 'loading...'}</h3>
                            </div>

                            <VoteCategoryList
                                variants={slideVariants}
                                contestants={voteCategory.contestants}
                                category={voteCategory.category}
                            />
                        </div>
                    )
                })
            }
        </section>
    )
}