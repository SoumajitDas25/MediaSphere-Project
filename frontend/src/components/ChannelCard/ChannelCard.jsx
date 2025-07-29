import React, { useState } from 'react'
import {Button} from '../';
import { useNavigate } from 'react-router-dom';
import { connectionAPI } from '../../api';

const ChannelCard = ({
    data,
    connectionType,
    reloadData=null,
    viewType="List",
    showUsername=true
}) => {

    const navigate = useNavigate();
    const {toggleSubscription} = connectionAPI;
    const {_id,avatar,channelName,username,isSubscribed,subscribersCount} = data;
    const [isButtonLoading,setIsButtonLoading] = useState(false);

    const toggleSubscribe = async () =>{
        try
        {
            //first toggle isSubscribed state(before api call)
            // setChannelProfile(state=>({...state,isSubscribed:!state.isSubscribed}));
            setIsButtonLoading(true);
            const response = await toggleSubscription(_id);
            console.log(response.data);
            // if(!(response.data.statusCode >= 200 && response.data.statusCode <300))
            //     //re-toggle isSubscribed state if any wrong statusCode arrives
            //     setChannelProfile(state=>({...state,isSubscribed:!state.isSubscribed}));
            if(reloadData)
            {
                if(connectionType.toLowerCase()==='subscriber')
                    reloadData("current"); //reload the current page
                else if(connectionType.toLowerCase()==='subscription')
                    reloadData("deleteone") //reload by checking underflow condition
                else
                    reloadData("reset"); //reload first page
            } 
        }
        catch(error)
        {
            //re-toggle isSubscribed state if any error occurs
            // setChannelProfile(state=>({...state,isSubscribed:!state.isSubscribed}));      
            console.log(error);
        }
        finally
        {
            setIsButtonLoading(false);
        }
    }

    return (
        <div 
        className={`bg-light-bg_light dark:bg-dark-btn1_color text-light-font_color_dark dark:text-dark-font_color_light flex  ${viewType==='Grid'?'flex-col':'flex-row h-[25vw] lg:h-[15vw] max-h-[120px]'} rounded-lg overflow-hidden w-full`} 
        onClick={()=>navigate(`/channel/@${username}`)}>

            {/* avatar */}
            <div className={`${viewType==='Grid'?'flex justify-center w-full py-[1rem] px-[2rem]':'h-full p-2'} relative overflow-hidden`}>
                <img className={`aspect-1 ${viewType==='Grid'?'w-[70%]':'h-full'} rounded-full z-5`} src={avatar} alt="User Avatar" />
            </div>

            {/* Channel Info*/}
            <div className={`grid ${viewType==='Grid'?'w-full grid-rows-12':'grid-cols-12'} overflow-hidden p-2 flex-1`}>

                <div
                className={`${viewType==='Grid'?'row-span-8':'col-span-7 md:col-span-8'} grid grid-rows-12`}>
                    {/* Channel Name */}
                    <h1 className={`row-span-4 font-bold overflow-hidden text-[0.9rem] sm:text-[1rem] md:text-[1.1rem] text-wrap p-0 flex items-center ${viewType==='Grid'?'justify-center':'justify-start'}`}>{channelName}</h1>

                    <div className={`row-span-8 flex flex-col justify-center ${viewType==='Grid'?'items-center':'items-start'} gap-1 text-[0.7rem] sm:text-[0.9rem] md:text-[1rem]`}>
                        {/* username */}
                        {
                            showUsername && <h2 className='font-thin overflow-hidden'>@{username}</h2>
                        }
                        {/* Subscribers Count */}
                        <h2 className=' font-medium overflow-hidden'>{subscribersCount} Subscribers</h2>
                    </div>
                </div>

                <div className={`flex items-center ${viewType==='Grid'?'row-span-4 justify-center':'col-span-5 md:col-span-4 justify-end sm:pr-2'}`}>
                    <Button 
                    fontSize='text-[0.7rem] sm:text-[0.8rem] md:text-[1rem]' 
                    bgcolor={`${isSubscribed? 'bg-transparent hover:bg-dark-font_color_dark dark:hover:bg-light-bg_dark':'bg-color-yellow'}`} 
                    textcolor={`${isSubscribed? 'text-light-font_color_dark dark:text-dark-font_color_dark hover:dark:text-light-font_color_dark':'text-light-font_color_dark'}`}
                    className={`${isSubscribed && 'border border-light-font_color_dark dark:border-dark-font_color_dark'}`} 
                    onClick={(event)=>{
                        event.stopPropagation();
                        toggleSubscribe();
                    }}
                    isLoading={isButtonLoading}
                    >
                        {isSubscribed?'Unsubscribe':'Subscribe'}
                    </Button>
                </div>
            </div>

        </div>
    )
}

export default ChannelCard