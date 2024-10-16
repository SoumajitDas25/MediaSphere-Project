import React, { useEffect, useState } from 'react';
import {VideoCard,TweetCard,PlaylistCard,ContentLoader,Button} from '.';

const ListContainer = ({
    // data,
    fetchData, //for non paginated data
    type ='Video',
    isPaginationEnabled = false,
    // totalPaginationPages = 1,
    fetchPaginatedData, //for paginated data
}) => {

    const [activeButtonIndex,setActiveButtonIndex] = useState(null);
    const [loading,setLoading] = useState(false); 
    const [data,setData] = useState(null);
    const [totalPaginationPages,setTotalPaginationPages] = useState(null);

    // Function to fetch data(paginated/non-paginated)
    const loadData = async (pageIndex) => {

        setLoading(true); 
        try 
        {
            if(isPaginationEnabled)
            {
                //fetch paginated data
                const response = await fetchPaginatedData(pageIndex); 
                setData(response.paginatedContent);
            }
            else
            {
                //fetch non-paginated data
                const response = await fetchData(); 
                setData(response);
            }
        } 
        catch(error) 
        {
            console.error('Error fetching data:', error);
        } 
        finally 
        {
            setLoading(false);
        }
    };

    const handlePageButtonClick = async (pageIndex)=>{

        if(isPaginationEnabled)
        {
            loadData(pageIndex);
        }
        setActiveButtonIndex(pageIndex-1);
    }

    useEffect(()=>{

        //Fetch initial data when the component mounts or when the type changes
        (async ()=>{
            setLoading(true); 
            try 
            {
                if(isPaginationEnabled)
                {
                    setActiveButtonIndex(0);
                    //fetch paginated data
                    const response = await fetchPaginatedData(1); 
                    setData(response.paginatedContent);
                    setTotalPaginationPages(response.totalPages);
                }
                else
                {
                    //fetch non-paginated data
                    const response = await fetchData(); 
                    setData(response);
                }
            } 
            catch(error) 
            {
                console.error('Error fetching data:', error);
            } 
            finally 
            {
                setLoading(false);
            }
        })();

    },[type]);

    return (
        <>
        {
            // <ContentLoader/>
            loading?
            <div className="h-[13rem]">
                 <ContentLoader/>
            </div>
            :
            <div className="flex flex-col justify-center">

                {/* Content Container */}
                <div className="grid grid-cols-12 gap-[1rem] md:gap-[1.2vw] xl:gap-[1.5rem] xxl:max-w-[100rem] flex-1 p-4">
                {
                    data ?
                    (
                        (type==='Video' &&
                            data.map((video)=>(
                                <div key={video._id} className='col-span-full sm:col-span-10 sm:col-start-2 md:col-span-6 lg:col-span-4 aspect-w-5 aspect-h-[4.5] flex justify-center'>
                                    <VideoCard  {...video}/>
                                </div>
                            ))
                        ) 
                        ||
                        (type==='Tweet' &&
                            data.map((tweet)=>(
                                <div key={tweet._id} className='col-span-full   flex justify-center'>
                                    <TweetCard  {...tweet}/>
                                </div>
                            ))
                        ) 
                        ||
                        (type==='Playlist' && 
                            data.map((playlist)=>(
                                <div key={playlist._id} className='col-span-full sm:col-span-10 sm:col-start-2 md:col-span-6 lg:col-span-4 aspect-w-5 aspect-h-[4.5] flex justify-center'>
                                    <PlaylistCard  {...playlist}/>
                                </div>
                            ))
                        )
                    )
                    :
                    <div className='col-span-full flex-1 flex justify-center items-center h-[10rem]'>
                        <h2 className="text-[6vw] sm:text-[1.5rem] font-semibold">{`No ${type} Available `}</h2>
                    </div>
                }
                </div>

                {/* Horizontal line bar */}
                <div className='bg-light-font_color_dark dark:bg-dark-font_color_light h-[1px]'></div>

                {/* Page Buttons - only for Paginated Data */}
                {
                    isPaginationEnabled && totalPaginationPages && (
                        <div className="flex flex-row justify-center items-center gap-2 py-4 px-2">
                        {
                            totalPaginationPages ?
                            Array.from({length:totalPaginationPages},(_,index)=>(
                                <Button 
                                key={index+1}
                                className={`${activeButtonIndex===index?'bg-color-yellow text-light-font_color_dark':'bg-light-bg_light hover:bg-light-font_color_light text-light-font_color_dark hover:text-dark-font_color_light dark:bg-dark-btn1_color dark:hover:bg-light-bg_light hover:dark:text-light-font_color_dark dark:text-dark-font_color_light'}`} 
                                onClick={()=>{handlePageButtonClick(index+1)}}
                                >{index+1}</Button>
                            ))
                            :
                            null
                        }
                        </div>
                    )
                }
            </div>
        }
        </>
    )
}

export default ListContainer