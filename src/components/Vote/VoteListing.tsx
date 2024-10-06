'use client';
import { motion, useScroll, Variants } from 'framer-motion';
import Slider from "react-slick";

interface VoteCategoryListProps {
    variants: Variants
}


const SkeletonVoteCard = () => {
    return (
        <div className="skeleton-vote-card">
            <div className="skeleton-avatar">
                <div className="skeleton-shimmer"></div>
            </div>
            <div className="skeleton-name">
                <div className="skeleton-shimmer"></div>
            </div>
            <div className="skeleton-info">
                <div className="skeleton-shimmer"></div>
            </div>
            <div className="skeleton-button">
                <div className="skeleton-shimmer"></div>
            </div>
        </div>
    );
};

function VoteCard() {
    return (
        <motion.div 
            className="skeleton-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
            exit={{ opacity: 0 }}
        >
            {/* Video Thumbnail */}
            <div className="skeleton-thumbnail">
                <div className="skeleton-shimmer"></div>
            </div>

            {/* Title Placeholder */}
            <div className="skeleton-title">
                <div className="skeleton-shimmer"></div>
            </div>

            {/* Subtitle Placeholder */}
            <div className="skeleton-subtitle">
                <div className="skeleton-shimmer"></div>
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
            // initial="hidden" 
            // animate="visible" 
            // exit="exit" 
            // variants={props.variants}
            // key="slide1"
            // style={{ backgroundColor: '#f9a825' }}
        >

            <div className="vote-lists">

            {/* <Slider {...settings}> */}
                {
                    [...Array(5)].map((_, i)=>{
                        return (
                            <SkeletonVoteCard key={i}/>
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
            
            
            <VoteCategoryList variants={slideVariants}/>
            <VoteCategoryList variants={slideVariants}/>
            <VoteCategoryList variants={slideVariants}/>
            

        </section>
    )
}