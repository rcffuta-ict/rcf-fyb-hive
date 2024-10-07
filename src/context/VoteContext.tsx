'use client';
import { GuestModel, GuestObject } from '@/lib/nobox/record-structures/Guest';
import { VoteModel, VoteObject } from '@/lib/nobox/record-structures/vote';
import { VoteCategory, VoteCategoryModel, VoteCategoryObject } from '@/lib/nobox/record-structures/voteCategory';
import { message } from 'antd';
import { MessageInstance } from 'antd/es/message/interface';
import React, {createContext, FC, PropsWithChildren, useContext, useEffect, useMemo, useState} from 'react';
import nomineeList from '@/data/nominees.json';
import { NomineeBase, NomineeList } from '@/data/data.types';
import { VoterObject } from '@/lib/nobox/record-structures/voter';
import AuthIndicator from '@/components/Vote/AuthIndicator';

interface VoteContextProps {
    obtainGuestRecord: (id:string) => Promise<GuestObject | null>;
    messageApi: MessageInstance;

    user: VoterObject | null;
    userVotes: VoteObject | null;
    handleSelection: (categoryId: string, guestId: string)=> void;
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
            if (!loading) return;

            try {

                // const _all_tickets = await TicketModel.find({});
                // Load Votes

                if (user) {

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

    },[loading]);



    const handleSelection = async (categoryId: string, guestId: string) => {
        messageApi.open({
            type: 'loading',
            content: 'Sending vote...',
            duration: 0,
            key: 'loader-1'
        });

        let _updated_ticket;

        try {
            // _updated_ticket = await approveTicket(id);
            // Upload vote

            await new Promise((res, rej)=>setTimeout(()=>rej(null), 3000));

            messageApi.destroy('loader-1');
            messageApi.success("Sent your vote for...!");
            
        } catch (error:any) {
            console.error(error);
            messageApi.destroy('loader-1');
            messageApi.error("Could not send vote for ...!");
        }

        
        
        if (!_updated_ticket) return;

        // Update vote log
        // setTickets((t)=>{
        //     return t.map((e)=>{
        //         if (e.id === id) return _updated_ticket;

        //         return e;
        //     })
        // })
        return _updated_ticket;
    }

    const voteList = useMemo(()=>{
        const nomList = nomineeList as unknown as NomineeBase[];

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
    }


    return (
        <>
            {contextHolder}
            <VoteContext.Provider value={context}>
                {
                    user && (

                        <AuthIndicator user={user}/>
                    )
                }
                {props.children}
            </VoteContext.Provider>
        </>
    )
}
