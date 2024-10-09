import { VoteStat, Winner } from "@/data/data.types";


export function getSum(stat: {[id: string]: string[]}) {

    return Object.values(stat).reduce((acc, val)=>{
        return acc + val.length;
    }, 0)
}


export function getWinners(stats: VoteStat) {

    // const winner = {
    //     category: null,
    //     contestant: null,
    //     value: 0
    // }

    const winners:Winner = {};

    Object.entries(stats).forEach(([category, voteItems])=> {
        Object.entries(voteItems).forEach(([contestant, votes])=>{
            if (!winners[category]) {
                winners[category] = {
                    contestant,
                    value: votes.length
                }

                return
            }


            if (votes.length > winners[category].value) {
                winners[category] = {
                    contestant,
                    value: votes.length
                }
            }
        })
    });


    return winners;
}