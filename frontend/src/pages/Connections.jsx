import React from 'react'
import { Heading,ListContainer,Button } from '../components'
import { connectionAPI } from '../api'
import { useSelector } from 'react-redux'
import { useState } from 'react'

const Connections = () => {

    const [connectionType,setConnectionType] = useState('Subscription');
    const userId = useSelector(state=>state.user.user?._id);
    const {getSubscribers,getSubscriptions} = connectionAPI;

    const fetchConnections = async (pageIndex = 1,limit = 6) =>{
        try
        {
            let response;
            switch(connectionType.toLowerCase())
            {
                case 'subscription':
                {
                    response = await getSubscriptions(userId,pageIndex,limit);
                    break;
                }
                case 'subscriber':
                {
                    response = await getSubscribers(userId,pageIndex,limit);
                    break;
                }
            }
            if (response.status < 200 || response.status >= 300)
            {
                //error
                //TODO: View the error component
                console.log("Error: ");
                return null;
            }
            else
            {
                // console.log(response.data.data);
                return response.data.data;
            }
        }
        catch(error)
        {
            //display an error message
            console.log(error);
            return null;
        }
    }

    const reloadConnections = (reloadData,currentData,currentPageIndex) =>{
        if(connectionType.toLowerCase()==='subscriber')
        {
            reloadData(currentPageIndex);
        }
        else
        {
            //underflow case
            if(currentData.length===1)
            {
                if(currentPageIndex<=1)
                reloadData(currentPageIndex,true)  //if current page is 1, then load the current page
                else
                reloadData(currentPageIndex-1,true); //if current page is greater than 1, then load previous page
            }
            else
            reloadData(currentPageIndex,true) //if data before this reload is greater than 1, then load current page
        }
    }

    return (
        <div>
            {/* heading */}
            <Heading className='py-2'>Connections</Heading>

            <div className='grid grid-cols-12 px-4 pt-6 max-w-[70rem] mx-auto'>
                <Button
                bgcolor={`${connectionType==='Subscription'? 'bg-color-yellow':'bg-transparent'}`} 
                textcolor={`${connectionType==='Subscription'?'text-light-font_color_dark':'text-light-font_color_dark dark:text-dark-font_color_light'}`} 
                className={`col-span-6`} 
                onClick={()=>setConnectionType('Subscription')}>
                    Subscription
                </Button>
                <Button 
                bgcolor={`${connectionType==='Subscriber'?'bg-color-yellow':'bg-transparent'}`} 
                textcolor={`${connectionType==='Subscriber'?'text-light-font_color_dark':'text-light-font_color_dark dark:text-dark-font_color_light'}`}
                className={`col-span-6`} 
                onClick={()=>setConnectionType('Subscriber')}>
                    Subscriber
                </Button>
            </div>

            {/* Horizontal line bar */}
            <div className='bg-light-font_color_dark dark:bg-dark-font_color_light h-[1px] max-w-[70rem] mx-auto'></div>

            {/* Connections List */}
            <ListContainer
            type={connectionType}
            isPaginationEnabled={true}
            fetchPaginatedData={fetchConnections}
            reloadData={reloadConnections}
            dataLimitPerPage={1}
            viewType="List"
            allowDelayLoad={true}
            delayLoadDurationInMs={700}
            />

        </div>
  )
}

export default Connections