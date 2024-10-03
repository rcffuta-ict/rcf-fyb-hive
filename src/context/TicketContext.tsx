'use client';
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
    handleApproval: (id: string) => Promise<void>;
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



export const TicketContextProvider:FC<PropsWithChildren> = (props) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [guestLog, setGuestLog] = useState<GuestObject[]>([]);

    const [tickets, setTickets] = useState<TicketObject[]>([]);

    const [loading, setLoading] = useState(true);

    // const [searchTerm, setSearchTerm] = useState<string>(''); // For search input
    // const debouncedSearchTerm = useDebounce(searchTerm, 300); // Using debounced value

    // // Memoized filtered results to avoid recalculating on every render
    // const filteredResults = useMemo(() => {
    //     return guestLog.filter(item =>
    //         item.firstname.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    //     );
    // }, [debouncedSearchTerm]); // Only recalculate when `debouncedSearchTerm` changes


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

        // return _updated_ticket;


        if (!_updated_ticket) return;

        setTickets((t)=>{
            return t.map((e)=>{
                if (e.id === id) return _updated_ticket;

                return e;
            })
        })
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
                <h1 className="text-center clr-primary ff-riffic fw-700 fs-24 lh-30">
                    Approve ticket ({tickets.length} registered!)
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
