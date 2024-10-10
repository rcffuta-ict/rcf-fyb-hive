'use client';
import { CheckModel, CheckObject } from '@/lib/nobox/record-structures/Check';
import { GuestModel, GuestObject } from '@/lib/nobox/record-structures/Guest';
import { TicketModel, TicketObject } from '@/lib/nobox/record-structures/Ticket';
import { approveTicket } from '@/utils/submit';
import { message } from 'antd';
import { MessageInstance } from 'antd/es/message/interface';
import React, {createContext, FC, PropsWithChildren, useContext, useEffect, useMemo, useState} from 'react';

interface TicketContextProps {
    obtainGuestRecord: (id:string) => Promise<GuestObject | null>;
    messageApi: MessageInstance;
    tickets: TicketObject[];
    handleApproval: (id: string) => Promise<TicketObject | undefined>;
}

const TicketContext = createContext<TicketContextProps | null>(null);

export function useTicket() {
    const ticketContext = useContext(TicketContext);

    if (!ticketContext) {
        throw new Error("use useTicket in a TicketContextProvideder");
    }

    return ticketContext;
}

// Custom debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timeout if the value or delay changes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}


export function useCheck() {
    const {messageApi} = useTicket();

    const [checkIn, setCheckIn] = useState<CheckObject[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            if (!loading) return;

            try {
                const _all = await CheckModel.find({});

                setCheckIn(() => _all);
            } catch (err: any) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, [checkIn, loading]);


    const isChecked = (ticketId: string) => {
        if (!checkIn) return false;
        return Boolean(checkIn.find((e)=>Object.is(e.ticketId, ticketId)));
    }

    const checkTicket = async (ticketId: string) => {

        if (!checkIn) return messageApi.error("Cannot check in guest!");
        
        let _checked = false;

        for (let e of checkIn) {
            if (e.ticketId === ticketId) {
                _checked = true;
                break;
            }
        }


        if (!_checked) {

            try {

                const _check = await CheckModel.insertOne({ ticketId });
    
                if (!_check) {
                    throw new Error('Can not check in guest!')
                }
    
                setCheckIn((p)=>{
                    if (!p) return [_check]
    
                    return [...p, _check];
                });
            } catch (err: any) {
                console.error(err);
                messageApi.error("Could not check in guest!");
            }
        }
    }


    return {
        isChecked,
        isLoading: loading,
        checkTicket,
        reload: ()=>setLoading(false),
    };

}



export const TicketContextProvider:FC<PropsWithChildren> = (props) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [guestLog, setGuestLog] = useState<GuestObject[]>([]);

    const [__tickets, setTickets] = useState<TicketObject[]>([]);

    const [loading, setLoading] = useState(true);

    const tickets = __tickets || []; 


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
            if (!loading) return;

            try {

                const _all_tickets = await TicketModel.find({});
    
                setTickets(()=>_all_tickets);
            } catch(err:any) {
                console.error(err);
            } finally {
                setLoading(false);
            }

        })()

    },[loading]);



    const handleApproval = async (id: string) => {
        messageApi.open({
            type: 'loading',
            content: 'Approving ticket...',
            duration: 0,
            key: 'loader-1'
        });

        let _updated_ticket;

        try {
            _updated_ticket = await approveTicket(id);

            messageApi.destroy('loader-1');
            messageApi.success("Approved ticket!");
            
        } catch (error:any) {
            console.error(error);
            messageApi.destroy('loader-1');
            messageApi.error("Could not approve ticket!");
        }

        
        
        if (!_updated_ticket) return;

        setTickets((t)=>{
            return t.map((e)=>{
                if (e.id === id) return _updated_ticket;

                return e;
            })
        })
        return _updated_ticket;
    }


    const context = {
        obtainGuestRecord,
        messageApi,
        tickets,
        handleApproval
    }


    return (
        <>
            {contextHolder}
            <TicketContext.Provider value={context}>
                <h1 className="text-center clr-primary fs-24 lh-30">
                    <span className='ff-riffic fw-700'>FYB Dinner Ticketing</span>
                    <br/>

                    <div className="dot-sep">
                        <span>{(tickets || []).length * 2} guest{(tickets || []).length > 0 ? 's': '' }</span>
                        <span>{(tickets || []).length} Paired </span>
                        <span>{(tickets || []).filter((e)=>e.confirmed).length} approved</span>
                    </div>
                </h1>
                
                <br/><br/>
                {
                    loading && <p className='loader'>Loading...</p>
                }
                {props.children}
            </TicketContext.Provider>
        </>
    )
}
