'use client';
import { motion, useScroll, Variants } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';
import Slider from "react-slick";

interface VoteCategoryListProps {
    variants: Variants
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

function VoteCard() {
    const checkRef = useRef<HTMLInputElement>(null);
    const handleSelect = () => {
        if(!checkRef.current) return;


        checkRef.current.checked = !checkRef.current.checked;
    }
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
                    src={"https://nobox-upload-bucket.s3.eu-west-2.amazonaws.com/uploads/a4239623-caed-42f3-9fd1-a3c31afa2471_img-20240929-wa0124.jpg"}
                    alt='Avatar'
                    width={200}
                    height={200}
                />
            </div>
            <div className="voter-card-name">
                {/* <div className="shimmer"></div> */}
                <p className='ff-riffic clr-primary fs-25'>
                    Ruth Alabi
                </p>
                <p className='fs-16'>
                    (Mama)
                </p>
            </div>
            <div className="voter-card-info">
                {/* <div className="shimmer"></div> */}
                <p className='ff-poppins fs-18'>Executive of the year</p>
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

    var settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    return (
        <div
            className="carousel-item" 
        >
            <div className="vote-lists">

            {/* <Slider {...settings}> */}
                {
                    [...Array(5)].map((_, i)=>{
                        return (
                            <VoteCard key={i}/>
                        )
                    })
                }
            {/* </Slider> */}
            </div>
        </div>
    )
}

export default function VoteListing() {
    const slideVariants = {
        hidden: { opacity: 0, y: 50 },  // Slide enters from below
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
        exit: { opacity: 0, y: -50, transition: { duration: 0.8, ease: 'easeIn' } }  // Slide leaves upwards
    };

    return (
        <section className="carousel-container">
            
            <div className="vote-wrapper">

                <div className="vote-header">

                    <h3 className='ff-riffic fs-25 lg-fs-48'>Executive of the Year</h3>


                </div>

                <VoteCategoryList variants={slideVariants}/>
            </div>
            <div className="vote-wrapper">

                <div className="vote-header">
                    <h3 className='ff-riffic fs-25 lg-fs-48'>Executive of the Year</h3>
                </div>

                <VoteCategoryList variants={slideVariants}/>
            </div>
            <div className="vote-wrapper">

                <div className="vote-header">
                    <h3 className='ff-riffic fs-25 lg-fs-48'>Executive of the Year</h3>
                </div>

                <VoteCategoryList variants={slideVariants}/>
            </div>

            

        </section>
    )
}