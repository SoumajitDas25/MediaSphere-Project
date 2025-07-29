import {Heading,ListContainer,Button,VideoCard} from "../components/"
import {DeleteIcon} from "../assets/icons/"
import { userAPI } from "../api"
import { useRef, useState } from "react"

const WatchHistory = () => {

    const [isDataEmpty,setIsDataEmpty] = useState(true);
    const [isDeleteAllLoading,setIsDeleteAllLoading] = useState(false);
    const [deleteVideoId,setDeleteVideoId] = useState(false); //the videoId of video which is to be deleted(for which loading is to be shown)
    const listRef = useRef(null);
    const {getWatchHistory,deleteWatchHistory,deleteVideoFromWatchHistory} = userAPI;

    const fetchWatchHistory = async (pageIndex = 1,limit = 6) => {
         try
        {
            const response = await getWatchHistory(pageIndex,limit);
            console.log(response.data.data);
            if(response.data.data && ((Array.isArray(response.data.data.paginatedContent) && response.data.data.paginatedContent.length===0)|| !response.data.data.paginatedContent))
                setIsDataEmpty(true);
            else
                setIsDataEmpty(false);
            return response.data.data;
        }
        catch(error)
        {
            //display an error message
            console.log(error);
            return null;
        }
    }

    const deleteAllWatchHistory = async () => {
        try
        {
            setIsDeleteAllLoading(true);
            const response = await deleteWatchHistory();
            console.log(response.data.data);
            listRef.current.reload("reset");
        }
        catch(error)
        {
            //display an error message
            console.log(error);
        }
        finally
        {
            setIsDeleteAllLoading(false);
       }
    }

    const deleteWatchHistoryById = async (videoId) =>{
        try
        {
            setDeleteVideoId(videoId);
            const response = await deleteVideoFromWatchHistory(videoId);
            console.log(response.data.data);
            listRef.current.reload("deleteOne");
        }
        catch(error)
        {
            //display an error message
            console.log(error);
        }
        finally
        {
            setDeleteVideoId(null);
        }
    }
   
    return (
        <div className="flex-1">
            {/* heading */}
            <Heading className='py-2'>Watch History</Heading>

            {
                !isDataEmpty &&  
                (
                <div className="p-4 flex flex-row justify-end">
                    <Button 
                    onClick={deleteAllWatchHistory} 
                    isLoading={isDeleteAllLoading}
                    >
                        <DeleteIcon/>
                        Delete Watch History
                    </Button>
                </div>
                )
            }

            {/* Video List */}
            <ListContainer
            type="video"
            isPaginationEnabled={true}
            fetchPaginatedData={fetchWatchHistory}
            dataLimitPerPage={6}
            ref={listRef}
            viewType="List" 
            noDataDisplayMessage='Empty Watch History'
            allowDelayLoad={true}
            delayLoadDurationInMs={700}
            renderCustomItem ={(item)=>(
                <div key={item._id} className={`col-span-full shadow-custom shadow-light-btn1_color rounded-lg dark:shadow-none`}>
                    <VideoCard  
                    data={item} 
                    viewType="List"
                    extraElements={(videoId)=>(
                        <div className="flex justify-center items-center pr-2 md:px-4 lg:px-6 py-2">
                            <Button 
                            className="px-[0.5rem]"
                            onClick={(event)=>{
                                event.stopPropagation();
                                deleteWatchHistoryById(videoId)
                            }}
                            isLoading={deleteVideoId === videoId?true:false}
                            >  
                                <span className="text-[2.5vw] sm:text-[1rem] md:text-[1.2rem] lg:text-[1.25rem]">
                                    <DeleteIcon/>
                                </span>
                            </Button>
                        </div>
                    )}
                    />
                </div>
            )}
            />
        </div>
    )
}

export default WatchHistory