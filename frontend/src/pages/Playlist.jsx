import React, { useEffect, useState } from 'react'
import { ListContainer, Loader } from '../components'
import { playlistAPI } from '../api'
import { useParams } from 'react-router-dom';

const Playlist = () => {

    const {getPlaylistInfoById,getPlaylistVideosById} = playlistAPI;
    const {playlistId} = useParams();
    const [loading,setLoading] = useState(true);
    const [playlistInfo,setPlaylistInfo] = useState(null);

    const loadPlaylistVideos = async (pageIndex = 1,limit = 6)=>{
        try
        {
            const response = await getPlaylistVideosById(playlistId,pageIndex,limit);
            console.log(response.data.data);
            return response.data.data;
        }
        catch(error)
        {
            //display an error message
            console.log(error);
        }
    }

    useEffect(()=>{

        //get the playlist info
        (async ()=>{
            try
            {
                const response = await getPlaylistInfoById(playlistId);
                if (response.status < 200 || response.status >= 300)
                {
                    //error
                    //TODO: View the error component
                    console.log("Error: ");
                }
                else
                {
                    console.log(response.data.data);
                    setPlaylistInfo(response.data.data);
                }
            }
            catch(error)
            {
                //error
                console.log("Error: ",error);
            }
            finally
            {
                setLoading(false);
            }
        })();
    },[])

    return (
        <>
        {
            loading?
            <Loader hideBackground={true}/>
            :
            <div className="grid grid-cols-12 lg:flex-1">

                <div className="col-span-full lg:col-span-5 flex flex-col gap-4">

                    {/* Thumbnail */}
                    <div>
                        <img src={playlistInfo.thumbnail} alt="Playlist Thumbnail"
                        className='w-full aspect-[8/5]' />
                    </div>
                    {/* info */}
                    <div className='p-4 flex flex-col gap-2'>
                        {/* name */}
                        <h2 className='text-light-font_color_dark font-bold text-2xl sm:text-3xl
                        md:text-4xl lg:text-3xl
                        xl:text-4xl xxl:text-5xl dark:text-dark-font_color_light my-2'>{playlistInfo.name}</h2>
                        {/* avatar & channelName */}
                        <div className='flex flex-row items-center overflow-hidden gap-2 flex-1'>
                                <img 
                                src={playlistInfo.owner.avatar} 
                                alt="User Avatar" 
                                className="rounded-[50%] max-h-[8vw] sm:max-h-[2rem]"
                                />
                            <h3 className='font-semibold text-[4vw] sm:text-[1rem] md:text-[0.85rem] lg:text-[0.75rem] xl:text-[1rem] overflow-hidden'>
                                by {playlistInfo.owner.channelName}
                            </h3>
                        </div>
                        {/* videosCount */}
                        <div className='font-semibold text-[4vw] sm:text-[1rem]  overflow-hidden'>
                            {playlistInfo.videosCount} videos
                        </div>
                        {/* description */}
                        <div className='font-semibold text-[4vw] sm:text-[1rem]  overflow-hidden'>
                            {playlistInfo.description}
                        </div>
                    </div>
                </div>
                
                <div className="col-span-full lg:col-span-7">
                    {/* Video List */}
                    <ListContainer
                    type='Video'
                    isPaginationEnabled={true}
                    fetchPaginatedData={loadPlaylistVideos}
                    viewType='List'
                    />
                </div>
            </div>
        }
        </>
    )
}

export default Playlist