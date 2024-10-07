'use client';
import { GuestModel, GuestObject } from '@/lib/nobox/record-structures/Guest';
import { VoteModel, VoteObject } from '@/lib/nobox/record-structures/vote';
import { VoteCategory, VoteCategoryModel, VoteCategoryObject } from '@/lib/nobox/record-structures/voteCategory';
import { message } from 'antd';
import { MessageInstance } from 'antd/es/message/interface';
import React, {createContext, FC, PropsWithChildren, useContext, useEffect, useMemo, useState} from 'react';

import { NomineeBase, NomineeList } from '@/data/data.types';
import { VoterObject } from '@/lib/nobox/record-structures/voter';
import AuthIndicator from '@/components/Vote/AuthIndicator';
import AuthModal from '@/components/Vote/AuthModal';
import { nominee } from '@/lib/nobox/config';


const canVote = false;



interface VoteContextProps {
    obtainGuestRecord: (id:string) => Promise<GuestObject | null>;
    messageApi: MessageInstance;

    user: VoterObject | null;
    userVotes: VoteObject | null;
    handleSelection: (categoryId: string, guestId: string)=> void;
    checkVote: (categoryId: string, guestId: string)=> boolean;
    voteList: NomineeList[];
    loading: boolean;
}

const VoteContext = createContext<VoteContextProps | null>(null);

export function useVote() {
    const voteContext = useContext(VoteContext);

    if (!voteContext) {
        throw new Error("use useVote in a VoteContextProvideder");
    }

    return voteContext;
}


export const VoteContextProvider:FC<PropsWithChildren> = (props) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [guestLog, setGuestLog] = useState<GuestObject[]>([]);

    const [user, setUser] = useState<VoterObject | null>(null);
    const [userVotes, setUserVotes] = useState<VoteObject | null>(null);
    const [voteCategories, setVoteCategories] = useState<VoteCategoryObject[] | null>(null);

    const [loading, setLoading] = useState(true);


    const obtainGuestRecord = async (id: string) => {

        const guest = guestLog.find((item)=>item.id === id);

        if (guest) return guest;


        const _guest = await GuestModel.findOne({ id });

        if (!_guest) return null;

        setGuestLog((p)=>{
            return [...p, _guest];
        });

        return _guest;

    }


    useEffect(()=>{

        (async ()=>{
            // if (!user) return;
            // if (!loading && !user) return;

            try {

                // const _all_tickets = await TicketModel.find({});
                // Load Votes

                if (user && userVotes === null) {

                    const user_votes = await VoteModel.findOne({
                        userId: user.id
                    });
                    if (user_votes) setUserVotes(()=>user_votes);
                }

                if (!voteCategories) {
                    const categories = await VoteCategoryModel.find({});
                    setVoteCategories(()=>categories);
                }

    
                // setTickets(()=>_all_tickets);
                // return
            } catch(err:any) {
                console.error(err);
            } finally {
                setLoading(false);
            }

        })()

    });



    const handleSelection = async (categoryId: string, guestId: string) => {
        messageApi.open({
            type: 'loading',
            content: 'Sending vote...',
            duration: 0,
            key: 'loader-1'
        });

        let updated_votes, _urs_vote=userVotes, updated= false ;

        try {
            
            // Upload vote

            if (!user) throw new Error("Cannot Vote!");
            if (!canVote) throw new Error("You cannot vote yet! Please hold on.");

            if (!userVotes) {
                _urs_vote = await VoteModel.insertOne({
                    userId: user.id,
                    votes: []
                })
            };


            if (!_urs_vote) throw new Error("Cannot Vote...!");
            

            // updated_votes = await 

            updated_votes = [..._urs_vote.votes];

            const existingVote = updated_votes.find((item)=>item.categoryId === categoryId);


            if (existingVote) {
                if (existingVote.guestId !== guestId) {
                    updated_votes.map((each)=>{
                        if (each.categoryId === categoryId) {
                            each.guestId = guestId;
                            updated = true;
                        }

                        return each;
                    })  
                };
            } else {
                // No existing vote
                updated_votes.push({
                    categoryId,
                    guestId
                });
                updated = true;
            }


            if (updated) {
                const _votes = await VoteModel.updateOneById(_urs_vote.id, {
                    votes: updated_votes,
                });

                setUserVotes(()=>_votes);
            }

            // await new Promise((res, rej)=>setTimeout(()=>rej(null), 3000));

            const category = voteCategories?.find((each)=>each.id===categoryId);

            messageApi.destroy('loader-1');
            messageApi.success(`Sent your vote for ${category?.label || 'your recent cast'}!`);
            
        } catch (error:any) {
            console.error(error);
            messageApi.destroy('loader-1');
            messageApi.error(error.message || "Could not send vote for ...!");
        }
    }


    const checkVote = (categoryId: string, guestId: string) => {

        if (!userVotes) return false;
        return Boolean(userVotes.votes.find((vote)=>{
            return Object.is(vote.categoryId, categoryId) && Object.is(vote.guestId, guestId);
        }))
    }



    const voteList = useMemo(()=>{
        const nomList = nominee as unknown as NomineeBase[];

        // if (!user) return null;
        if (loading || !voteCategories) return (nomList as unknown as NomineeList[]);


        const _list = nomList.map((each)=>{
            const category = voteCategories.find((category)=>category.id === each.categoryId);
            if (!category) return null;

            return {
                category,
                ...each,
            }
        })
        
        return _list.filter((e)=>Boolean(e)) as NomineeList[];

    }, [voteCategories])


    const context = {
        obtainGuestRecord,
        messageApi,
        user,
        userVotes,
        handleSelection,
        voteList,
        loading,
        checkVote,
    }


    return (
        <>
            {contextHolder}
            <VoteContext.Provider value={context}>
                {
                    user ? (

                        <AuthIndicator user={user}/>
                    ) : (
                        <AuthModal show={true} onHide={(data: VoterObject)=>{
                            setUser(data)
                        }}/>
                    )
                }
                {props.children}
            </VoteContext.Provider>
        </>
    )
}
