import { useEffect, useState,useRef } from 'react'
import { ConfirmModal, EditPlaylistModal, ListContainer, Loader, Switch, VideoCard } from '../components'
import { playlistAPI } from '../api'
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { DeleteIcon, EditIcon } from '../assets/icons';

const Playlist = () => {

    const {playlistId:paramPlaylistId} = useParams();
    const navigate = useNavigate();
    const [loading,setLoading] = useState(true);
    const [playlistInfo,setPlaylistInfo] = useState(null);
    const [playlistId,setPlaylistId] = useState(paramPlaylistId);
    const [isPlaylistPrivate,setIsPlaylistPrivate] = useState(null);
    const [isToggleVisibilityButtonLoading,setIsToggleVisibilityButtonLoading] = useState(false);
    const [enableEdit,setEnableEdit] = useState(null);
    const [isEditModalButtonLoading,setIsEditModalButtonLoading] = useState(false);
    const [enableDelete,setEnableDelete] = useState(null);
    const [isDeleteModalButtonLoading,setIsDeleteModalButtonLoading] = useState(false);
    const userId = useSelector(state=>state.user.user?._id);
    const listRef = useRef(null);

    const {getPlaylistInfoById,getPlaylistVideosById,updatePlaylist,deletePlaylist,togglePlaylistVisibilityStatus} = playlistAPI;

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

    const updateHandler = async (data) =>{
        try
        {
            setIsEditModalButtonLoading(true);
            const updateData = {
                name:(data && data.name && data.name!==playlistInfo.name) ? data.name:null,
                description:(data && data.description && data.description!==playlistInfo.description) ? data.description:null
            }
            const response = await updatePlaylist(playlistInfo._id,updateData);
            console.log(response.data.data);
            setEnableEdit(false);
        }
        catch(error)
        {
            //display an error message
            console.log(error);
        }
        finally
        {
          setIsEditModalButtonLoading(false);
        }
    }

    const deleteHandler = async () =>{
        try
        {
            setIsDeleteModalButtonLoading(true);
            const response = await deletePlaylist(playlistInfo?._id);
            console.log(response.data.data);
            setEnableDelete(false);
            navigate('/'); //navigate to home page
        }
        catch(error)
        {
            //display an error message
            console.log(error);
        }
        finally
        {
          setIsDeleteModalButtonLoading(false);
        }
    }

    const toggleVisibilityStatus = async ()=>{
        try
        {
            setIsToggleVisibilityButtonLoading(true)
            const response = await togglePlaylistVisibilityStatus(playlistInfo?._id);
            console.log(response.data.data);
            setIsPlaylistPrivate(response.data.data);
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            setIsToggleVisibilityButtonLoading(false);
        }
    }

    //sync playlistId state with playlistID param
    useEffect(()=>{
        setPlaylistId(paramPlaylistId);
    },[paramPlaylistId])

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
                    setIsPlaylistPrivate(response.data.data.isPrivate);
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

                {
                    enableEdit && (
                        <EditPlaylistModal 
                        setIsModalOpened={setEnableEdit}
                        defaultData={{
                            name:playlistInfo.name,
                            description:playlistInfo.description
                        }}
                        submitHandler={updateHandler}
                        isSubmitButtonLoading={isEditModalButtonLoading}
                        />
                    )
                }
                {
                    enableDelete && (
                        <ConfirmModal 
                        setIsModalOpened={setEnableDelete}
                        heading="Delete Playlist" 
                        message="Are you sure to delete this playlist ?" 
                        confirmHandler={deleteHandler}
                        isConfirmButtonLoading={isDeleteModalButtonLoading}
                        />
                    )
                }

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
                        {/* options - only for owner*/}
                        {
                            (playlistInfo && playlistInfo.owner._id===userId)?(
                                <div className="w-full py-2 flex flex-row gap-4 items-center justify-between mr-2 text-[1.25rem]">
                                    <div className='flex items-center'>
                                        <span className='mr-2 md:mr-4 text-[1rem] md:text-[1.25rem]'>Private</span>
                                        <Switch 
                                        isSwitchOn={isPlaylistPrivate} 
                                        isLoading={isToggleVisibilityButtonLoading}
                                        onSwitchOn={toggleVisibilityStatus}
                                        onSwitchOff={toggleVisibilityStatus} 
                                        />
                                    </div>

                                    <div className='flex flex-row gap-6'>
                                        {/* Edit Option  */}
                                        <span 
                                        className="cursor-pointer"
                                        onClick={(event)=>{ event.stopPropagation();
                                        setEnableEdit(true);
                                        }}
                                        >
                                            <EditIcon/>
                                        </span>
                                                                                                    {/* Delete Icon */}
                                        <span
                                        className="cursor-pointer" 
                                        onClick={(event)=>{
                                        event.stopPropagation();
                                        setEnableDelete(true);
                                        }}
                                        >
                                            <DeleteIcon/>
                                        </span>
                                    </div>
                                </div>
                            ):'' 
                        }
                        {/* videosCount */}
                        <div className='font-semibold text-[4vw] sm:text-[1rem]  overflow-hidden'>
                            {playlistInfo.videosCount} videos
                        </div>
                        {/* description */}
                        <div className='bg-light-bg_light dark:bg-dark-btn1_color p-4 my-2 shadow-custom shadow-light-btn1_color rounded-lg dark:shadow-none'>
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
                    ref={listRef} 
                    renderCustomItem = {item=>(
                        <div key={item._id} className={`col-span-full  shadow-custom shadow-light-btn1_color dark:shadow-light-btn1_color rounded-lg`}>
                            <VideoCard 
                            playlistId={playlistId} 
                            data={item} 
                            viewType='List'
                            listRef={listRef}
                            enableOptions={true}
                            enabledOptions={{
                                removeVideoFromPlaylistOption:true
                            }}
                            />
                        </div>
                    )}
                    />
                </div>
            </div>
        }
        </>
    )
}

export default Playlist