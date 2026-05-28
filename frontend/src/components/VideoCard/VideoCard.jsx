import { useState } from 'react';
import { DeleteIcon, EditIcon, MinusIcon, NoAvatarIcon } from '../../assets/icons';
import { useNavigate } from 'react-router-dom';
import {Button,Switch,EditVideoModal,ConfirmModal} from "../"
import { useSelector } from 'react-redux';
import { videoAPI,playlistAPI } from '../../api';

const VideoCard = ({
    playlistId=null,
    data,
    viewType = "Grid",
    enableOptions=false,
    enabledOptions={
        editOption:false,
        deleteOption:false,
        togglePublishOption:false,
        removeVideoFromPlaylistOption:false
    },
    listRef,
    extraElements
}) => {

    const navigate = useNavigate();
    const {
        _id,
        thumbnail="",
        title="",
        description,
        viewsCount=0,
        owner,
        isPublished,
        duration='0:00',
        createdAt="",
    } = data;
    const {editOption,deleteOption,togglePublishOption,removeVideoFromPlaylistOption} = enabledOptions;

    const [isVideoPublished,setIsVideoPublished] = useState(isPublished);
    const [isTogglePublishButtonLoading,setIsTogglePublishButtonLoading] = useState(false);
    const [enableEdit,setEnableEdit] = useState(null);
    const [isEditModalButtonLoading,setIsEditModalButtonLoading] = useState(false);
    const [enableDelete,setEnableDelete] = useState(null);
    const [isDeleteModalButtonLoading,setIsDeleteModalButtonLoading] = useState(false);
    const [isRemoveVideoFromPlaylistButtonLoading,setIsRemoveVideoFromPlaylistButtonLoading] = useState(false);
    const userId = useSelector(state=>state.user.user?._id);

    const {updateVideo,deleteVideo,toggleVideoPublishStatus} = videoAPI;
    const {removeVideoFromPlaylist} = playlistAPI;

    // Function to calculate time difference
    const timeSince = (date)=> {

        const isoDate = new Date(date.toISOString());
        const now = new Date();

        const secondsPast = Math.abs(Math.floor((now - isoDate) / 1000));

        if (secondsPast < 60) {
            return `${secondsPast} ${secondsPast==1?'second':'seconds'} ago`;
        }
        if (secondsPast < 3600) {
            const minutes = Math.floor(secondsPast / 60);
            return `${minutes} ${minutes==1?'minute':'minutes'} ago`;
        }
        if (secondsPast < 86400) {
            const hours = Math.floor(secondsPast / 3600);
            return `${hours} ${hours==1?'hour':'hours'} ago`;
        }
        if (secondsPast < 604800) {
            const days = Math.floor(secondsPast / 86400);
            return `${days} ${days==1?'day':'days'} ago`;
        }
        if (secondsPast < 2592000) {
            const weeks = Math.floor(secondsPast / 604800);
            return `${weeks} ${weeks==1?'week':'weeks'} ago`;
        }
        if (secondsPast < 31536000) {
            const months = Math.floor(secondsPast / 2592000);
            return `${months} ${months==1?'month':'months'} ago`;
        }
        const years = Math.floor(secondsPast / 31536000);
        return `${years} ${years==1?'year':'years'} ago`;
    }

    //function to compute duration in hh:mm:ss format
    const computeDuration = (duration)=> {

        // duration=Math.floor(duration);
        if (duration < 60) 
        {
            if(duration<10)
                duration = '0'+String(duration);
            return `00:${duration}`;
        }
        if (duration < 3600) 
        {
            let minutes = Math.floor(duration / 60);
            let seconds = duration % 60;
            if(seconds<10)
                seconds = '0'+String(seconds);
            return `${minutes}:${seconds}`;
        }
        else
        {
            let hours = Math.floor(duration / 3600);
            let minutes = Math.floor(duration % 3600);
            if(minutes < 10)
                minutes = '0'+String(minutes);
            let seconds = minutes % 60;
            if(seconds < 10)
                seconds = '0'+String(seconds);
            return `${hours}:${minutes}:${seconds}`;
        }
    }

    const updateHandler = async (data) =>{
        try
        {
            setIsEditModalButtonLoading(true);
            const updateData = {
                thumbnail:(data && data.thumbnail && data.thumbnail[0])?data.thumbnail[0]:null,
                title:(data && data.title && data.title!==title) ? data.title:null,
                description:(data && data.description && data.description!==description) ? data.description:null
            }
            // console.log(updateData);
            const response = await updateVideo(_id,updateData);
            // console.log(response.data.data);
            setEnableEdit(false);
            listRef.current.reload('current');
            // console.log('reload list');
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
            const response = await deleteVideo(_id);
            console.log(response.data.data);
            setEnableDelete(false);
            listRef.current.reload('deleteOne');
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

    const togglePublishStatus = async ()=>{
        try
        {
            setIsTogglePublishButtonLoading(true)
            const response = await toggleVideoPublishStatus(_id);
            // console.log(response.data.data);
            setIsVideoPublished(response.data.data);
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            setIsTogglePublishButtonLoading(false);
        }
    }

    const removeVideoFromPlaylistHandler = async ()=>{
        try
        {
            setIsRemoveVideoFromPlaylistButtonLoading(true);
            const response = await removeVideoFromPlaylist(_id,playlistId);
            console.log(response.data.data);
            listRef.current.reload('deleteOne');
        }
        catch(error)
        {
            //display an error message
            console.log(error);
        }
        finally
        {
          setIsRemoveVideoFromPlaylistButtonLoading(false);
        }
    }

  return (
    <div 
    className='bg-light-bg_light dark:bg-dark-btn1_color text-light-font_color_dark dark:text-dark-font_color_light rounded-lg w-full' 
    >

        {
            enableEdit && (
                <EditVideoModal 
                setIsModalOpened={setEnableEdit}
                defaultData={{
                    thumbnailUrl:thumbnail,
                    title:title,
                    description:description
                }}
                submitHandler={updateHandler}
                submitButtonText='Update'
                isSubmitButtonLoading = {isEditModalButtonLoading}
                />
            )
        }
        {
            enableDelete && (
                <ConfirmModal 
                setIsModalOpened={setEnableDelete}
                heading="Delete Video" 
                message="Are you sure to delete this video ?" 
                confirmHandler={deleteHandler}
                isConfirmButtonLoading={isDeleteModalButtonLoading}
                />
            )
        }

        <div 
        className={`flex ${viewType==='Grid'?'flex-col':'flex-row h-[25vw] sm:h-[18vw] lg:h-[10vw] max-h-[150px]'} gap-2 overflow-hidden w-full`} 
        onClick={()=>navigate(`/video/${_id}`)}
        >
            {/* thumbnail */}
            <div className={`${viewType==='Grid'?'w-full':'h-full'} relative overflow-hidden`}>
                
                <img className={`aspect-[8/5] ${viewType==='Grid'?'w-full':'h-full'} rounded-lg z-5`} src={thumbnail} alt="Video Thumbnail" />

                <div className="bg-black text-white absolute z-10 right-2 bottom-[5%] rounded-md px-2 text-[3.5vw] sm:text-[0.9rem]">
                    {computeDuration(duration)}
                </div>
            </div>   
            
            {/* Video Info*/}
            <div className={`${viewType==='Grid'?'w-full':''} grid grid-cols-12 overflow-hidden p-2 gap-2 flex-1`}>
                {/* avatar - Grid View*/}
                {
                    viewType==='Grid' && (<div className="col-span-2 overflow-hidden flex justify-center items-start cursor-pointer" onClick={(event)=>{
                        event.stopPropagation();
                        navigate(`/channel/@${owner.username}`);
                    }}>
                    {
                        owner && owner.avatar?
                        <img 
                        src={owner.avatar} 
                        alt="Video Thumbnail" 
                        className="rounded-[50%] max-h-[12vw] sm:max-h-[3rem]"
                        />
                        :
                        <span className="text-[7vw] sm:text-[2.5rem] text-light-font_color_light dark:text-dark-font_color_light">
                            <NoAvatarIcon/>
                        </span>    
                    }                                  
                    </div>)
                }
                {/* info */}
                <div className={`${viewType==='Grid'?'col-span-10':'col-span-full'} grid grid-rows-2 gap-1 lg:gap-2`}>
                    {/* title */}
                    <h3 className={`row-span-1 font-semibold ${viewType==='Grid'?'text-[4vw] sm:text-[1rem] md:text-[0.85rem] lg:text-[0.75rem] xl:text-[1rem]':'text-[3.2vw] sm:text-[0.75rem] md:text-[1rem]'} overflow-hidden`}>
                        {title}
                    </h3>

                    <div className={`row-span-1 text-light-font_color_dark dark:text-dark-font_color_dark ${viewType==='Grid'?'text-[3.75vw]  sm:text-[0.85rem] md:text-[0.7rem] lg:text-[0.65rem] xl:text-[0.85rem]':'text-[2.5vw] sm:text-[0.6rem] md:text-[0.75rem] xl:text-[0.85rem]'} flex flex-col justify-center`}>

                        <div className='flex flex-row gap-2'>
                            {/* avatar - List View*/}
                            {
                                // viewType==='List' && (<div className="hidden lg:block overflow-hidden">
                                //     {
                                //         owner && owner.avatar?
                                //         <img 
                                //         src={owner.avatar} 
                                //         alt="Video Thumbnail" 
                                //         className="rounded-[50%] max-h-[2rem]"
                                //         />
                                //         :
                                //         <span className="text-[2rem] text-light-font_color_light dark:text-dark-font_color_light">
                                //             <NoAvatarIcon/>
                                //         </span>    
                                //     }
                                    
                                // </div>)
                            }
                            {/* Channel Name */}
                            <h3 className='flex items-center cursor-pointer' 
                            onClick={(event)=>{
                                event.stopPropagation();
                                navigate(`/channel/@${owner.username}`);
                            }}
                            >
                                {owner && owner.channelName}
                            </h3>
                        </div>
                        {/* Views & timestamp */}
                        <h3 className='flex gap-4'>
                            <span>
                                {`${viewsCount} views`}
                            </span>
                            <span>
                                {`${timeSince(new Date(createdAt))}`}
                            </span>
                        </h3>
                    </div>
                </div>
            </div>

            {/* Extra Elements */}
            {extraElements && extraElements(_id)}
        </div>

        {/* options */}
        {
            enableOptions ? 
                (owner && owner._id === userId) ? 
                (
                    <div className='grid grid-cols-12 gap-4 p-4 border-t border-light-btn1_color dark:border-light-bg_dark bg-dark-font_color_dark dark:bg-dark-bg_light'>
                        {/* toggle publish option*/}
                        {
                            togglePublishOption && (
                                <div className='col-span-6 flex  items-center'>
                                    <span className='mr-2 md:mr-4 text-[1rem] md:text-[1.25rem]'>Published</span>
                                    <Switch 
                                    isSwitchOn={isVideoPublished} 
                                    isLoading={isTogglePublishButtonLoading}
                                    onSwitchOn={togglePublishStatus}
                                    onSwitchOff={togglePublishStatus} 
                                    />
                                </div>
                            )
                        }
                        {/* edit option */}
                        {
                            editOption && (
                                <Button 
                                className='col-span-3' 
                                fontSize='text-[0.75rem] md:text-[1rem]' 
                                onClick={(event)=>{
                                    event.stopPropagation();
                                    setEnableEdit(true);
                                }}
                                >
                                    <span className='flex flex-row gap-1 justify-center items-center'>
                                        <span className='text-[1.2rem] md:text-[1.5rem]'>
                                            <EditIcon/>
                                        </span>
                                        <span className='hidden sm:block'>Edit</span>
                                    </span>
                                </Button>
                            )
                        } 
                        {/* delete option */}
                        {
                            deleteOption && (
                                <Button 
                                className='col-span-3' 
                                fontSize='text-[0.75rem] md:text-[1rem]' 
                                onClick={(event)=>{
                                    event.stopPropagation();
                                    setEnableDelete(true);
                                }}
                                >
                                    <span className='flex flex-row gap-1 justify-center items-center'>
                                        <span className='text-[1.2rem] md:text-[1.5rem] '>
                                            <DeleteIcon/>
                                        </span>
                                        <span className='hidden sm:block'>Delete</span>
                                    </span>
                                </Button>
                            )
                        }
                        {/* remove video from playlist option */}
                        {
                            removeVideoFromPlaylistOption && (
                                <div className='col-span-full flex flex-row justify-end'>
                                    <Button 
                                    onClick={removeVideoFromPlaylistHandler}
                                    isLoading={isRemoveVideoFromPlaylistButtonLoading}
                                    >
                                        <span className='flex flex-row gap-1 justify-center items-center'>
                                            <span className='text-[1.5rem]'>
                                                <MinusIcon/>
                                            </span>
                                            Remove From Playlist
                                        </span>
                                    </Button>
                                </div>
                            )
                        }
                    </div>
                ):''
            :''
        }
    </div>
  )
}

export default VideoCard