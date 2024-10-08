'use client';
import { useVote } from '@/context/VoteContext';
import { Contestant } from '@/data/data.types';
import { GuestObject } from '@/lib/nobox/record-structures/Guest';
import { VoteCategoryObject } from '@/lib/nobox/record-structures/voteCategory';
import { getGuestName } from '@/utils/process-details';
import { motion, useScroll, Variants } from 'framer-motion';
import Image from 'next/image';
import { Fragment, useEffect, useRef, useState } from 'react';
import Slider from "react-slick";

interface VoteCategoryListProps {
    variants: Variants;
    contestants: Contestant[];
    category?: VoteCategoryObject;
}

interface VoteCardProps {
    contestant: Contestant;
    category: VoteCategoryObject;
    label: string;
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

    const {obtainGuestRecord, handleSelection, checkVote} = useVote();
    const [guests, setGuests] = useState<GuestObject[] | null | undefined>();

    const checkRef = useRef<HTMLInputElement>(null);
    
    const handleSelect = () => {
        if(!guests) return;

        handleSelection(props.category.id, props.contestant.ref);
    }

    useEffect(()=>{
        (async ()=>{

            
            if (guests || guests === null) return;

            const _g = await obtainGuestRecord(props.contestant.ref)

            // console.log(_g)

            setGuests(()=>{
                if (!_g) return null;

                return _g;
            })
        })()
    },)    

    if (guests === undefined) return <SkeletonVoteCard/>

    if (guests === null) return null;


    const isSelected = checkVote(props.category.id, props.contestant.ref);
    const isMultiple = guests.length > 1;
    const shouldMaintain = guests.length === 2;

    return (
        <motion.div 
            className="voter-card-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
            exit={{ opacity: 0 }}

            data-label={props.label}
        >

            <div className="avatar-wrapper-container" data-multiple={isMultiple}>

                {
                    guests.map((guest)=>(
                        <div className="avatar-wrapper" key={guest.id} data-maintain={shouldMaintain}>
                            {/* <div className="shimmer"></div> */}
                            <Image
                                src={guest.picture}
                                alt={guest.firstname + ' Picture'}
                                width={200}
                                height={200}
                            />
                        </div>
                    ))
                }
            </div>
            <div className="voter-card-name">
                {/* <div className="shimmer"></div> */}
                <p className='ff-riffic clr-primary fs-25'>
                    {getGuestName(guests, isMultiple)}
                </p>
                {props.contestant.alias && (<p className='fs-16'>
                    ({props.contestant.alias})
                </p>)}
            </div>
            <div className="voter-card-info">
                {/* <div className="shimmer"></div> */}
                <p className='ff-poppins fs-18 text-capitalize'>{props.category.label}</p>
            </div>

            <div className="voter-card-button">
                {/* <div className="shimmer"></div> */}

                <input ref={checkRef} type="radio" name='vote-check' id='vote-check' data-checked={isSelected}/>

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

                        // if (loading || !props.category) return <SkeletonVoteCard key={i}/>

                        if (loading) return <SkeletonVoteCard key={i}/>;

                        if (!props.category) return <SkeletonVoteCard key={i}/>
                        return (
                            <VoteCard
                                key={i}
                                contestant={contestant}
                                category={props.category}
                                label={`${i+1}/${props.contestants.length}`}
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
                voteList.map((voteCategory, i)=>{
                    return (
                        <div className="vote-wrapper" key={i}>

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