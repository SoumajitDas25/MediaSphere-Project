import { useState } from 'react'
import { PlaylistIcon,PlusIcon,MinusIcon, DeleteIcon, EditIcon } from '../../assets/icons';
import {Button, ConfirmModal, EditPlaylistModal, Switch} from "..";
import {playlistAPI} from '../../api'
import { useSelector } from 'react-redux';

const PlaylistCard2 = ({
    videoId=null,
    data,
    viewType = "Grid",
    enableOptions=false,
    enabledOptions={
        editOption:false,
        deleteOption:false,
        togglePrivateOption:false,
        videoAdditionOrDeletionOption:false
    },
    listRef,
    extraElements
}) => {

    const {
        _id,
        thumbnail="",
        name="",
        description,
        videosCount=0,
        owner,
        isPrivate,
        createdAt="",
        updatedAt="",
        isVideoPresent=false
    } = data;
    const {editOption,deleteOption,togglePrivateOption,videoAdditionOrDeletionOption} = enabledOptions;

    const [isPlaylistPrivate,setIsPlaylistPrivate] = useState(isPrivate);
    const [isToggleVisibilityButtonLoading,setIsToggleVisibilityButtonLoading] = useState(false);
    const [enableEdit,setEnableEdit] = useState(null);
    const [isEditModalButtonLoading,setIsEditModalButtonLoading] = useState(false);
    const [enableDelete,setEnableDelete] = useState(null);
    const [isDeleteModalButtonLoading,setIsDeleteModalButtonLoading] = useState(false);
    const [isVideoAdded,setIsVideoAdded] = useState(videoAdditionOrDeletionOption?isVideoPresent:null);
    const [isAddOrRemoveVideoButtonLoading,setIsAddOrRemoveVideoButtonLoading] = useState(false);
    const userId = useSelector(state=>state.user.user?._id);

    const {addVideoToPlaylist,removeVideoFromPlaylist,updatePlaylist,deletePlaylist,togglePlaylistVisibilityStatus} = playlistAPI;

    // Function to calculate time difference
    function timeSince(date) 
    {
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

    const addOrRemoveVideoHandler = async () =>{
        try
        {
            setIsAddOrRemoveVideoButtonLoading(true);
            let response;
            if(isVideoAdded)
            {
                response = await removeVideoFromPlaylist(videoId,_id);
                setIsVideoAdded(false);
            }
            else
            {
                response = await addVideoToPlaylist(videoId,_id);
                setIsVideoAdded(true);
            } 
            console.log(response.data);
        }
        catch(err)
        {
            console.log(err);
        }
        finally 
        {
            setIsAddOrRemoveVideoButtonLoading(false);
        }
    }

    const updateHandler = async (data) =>{
        try
        {
            setIsEditModalButtonLoading(true);
            const updateData = {
                name:(data && data.name && data.name!==name) ? data.name:null,
                description:(data && data.description && data.description!==description) ? data.description:null
            }
            const response = await updatePlaylist(_id,updateData);
            // console.log(response.data.data);
            setEnableEdit(false);
            listRef.current.reload('current');
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
            const response = await deletePlaylist(_id);
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

    const toggleVisibilityStatus = async ()=>{
        try
        {
            setIsToggleVisibilityButtonLoading(true)
            const response = await togglePlaylistVisibilityStatus(_id);
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

    return (
        <div className={`w-full`}>

            {
                enableEdit && (
                    <EditPlaylistModal 
                    setIsModalOpened={setEnableEdit}
                    defaultData={{
                        name:name,
                        description:description
                    }}
                    submitHandler={updateHandler}
                    isSubmitButtonLoading = {isEditModalButtonLoading}
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

            <div className='w-full relative transform transition-transform duration-300'>
                {/* <input 
                type="checkbox" 
                className='absolute top-1/2 -translate-y-1/2 right-4 md:top-4 md:left-4 md:translate-y-0 z-40 h-8 w-8 scale-200 accent-color-yellow'
                checked={isVideoAdded}
                readOnly
                /> */}
                {
                    videoAdditionOrDeletionOption ?
                    isVideoAdded? <span className='absolute  bottom-2 left-4 md:top-4 md:bottom-auto z-40 bg-color-yellow text-light-font_color_dark text-[4vw] sm:text-[1rem] px-4 py-2 rounded-2xl font-semibold shadow-custom shadow-dark-btn1_color dark:shadow-light-btn1_color'>Added</span>
                    :''
                    :''
                }

                <div 
                className={`w-full ${viewType==='Grid' && 'md:aspect-1'}`} 
                >
                    <div 
                    className={`bg-light-bg_light dark:bg-dark-btn1_color text-light-font_color_dark dark:text-dark-font_color_light flex  ${viewType==='Grid'?'flex-row h-[25vw] sm:h-[18vw] md:flex-col md:h-full':'flex-row h-[25vw] sm:h-[18vw] lg:h-[10vw] max-h-[150px]'} gap-2 rounded-lg overflow-hidden w-full ${isVideoAdded?'opacity-60':'opacity-100'}`} 
                    >

                        <div className={`${viewType==='Grid'?'h-full md:w-full md:h-auto':'h-full'} relative overflow-hidden`}>

                            {/* Playlist Thumbnail */}
                            <img className={`aspect-[8/5]  ${viewType==='Grid'?'h-full md:w-full':'h-full'} rounded-lg z-5`} src={thumbnail} alt="Playlist Thumbnail" />

                            <div className="bg-light-btn1_color dark:bg-dark-bg_light text-light-bg_light font-semibold absolute z-10 left-0 bottom-0 w-full rounded-md px-2 py-4 text-[3vw] sm:text-[0.9rem] flex flex-row justify-between gap-2 md:gap-4 
                            bg-opacity-70 dark:bg-opacity-70  fill-transparent">
                                {/* Playlist icon*/}
                                <span className='flex flex-row gap-1 md:gap-2'>
                                    <span className='text-[1.5rem]'>
                                        <PlaylistIcon/>
                                    </span>
                                    Playlist
                                </span>
                                {/* Videos Count */}
                                <span>
                                    {`${videosCount} videos`}
                                </span>
                            </div>
                        </div>

                        {/* Playlist Info*/}
                        <div className={`${viewType==='Grid'?'w-full':''} grid grid-cols-12 overflow-hidden p-2 gap-2 flex-1`}>
                            {/* avatar */}
                            {
                                viewType==='Grid' && (<div className={`hidden  md:col-span-2 md:overflow-hidden md:flex md:justify-center md:items-start md:cursor-pointer`}>
                                {
                                    owner && owner.avatar?
                                    <img 
                                    src={owner.avatar} 
                                    alt="Playlist Thumbnail" 
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
                                <h3 className={`row-span-1 font-semibold ${viewType==='Grid'?'text-[3.4vw] sm:text-[1rem] md:text-[0.85rem] lg:text-[0.75rem] xl:text-[1rem]':'text-[3.2vw] sm:text-[0.75rem] md:text-[1rem]'} overflow-hidden`}>
                                    {name}
                                </h3>

                                <div className={`row-span-1 text-light-font_color_dark dark:text-dark-font_color_dark ${viewType==='Grid'?'text-[3vw]  sm:text-[0.85rem] md:text-[0.7rem] lg:text-[0.65rem] xl:text-[0.85rem]':'text-[2.5vw] sm:text-[0.6rem] md:text-[0.75rem] xl:text-[0.85rem]'} flex flex-col justify-center`}>
                                    {/* Channel Name */}
                                    <h3 className='hidden md:block cursor-pointer'>
                                        {owner && owner.channelName}
                                    </h3>
                                    {/* timestamp */}
                                    <h3 className='flex gap-4'>                     
                                    {
                                        createdAt===updatedAt?
                                        `${timeSince(new Date(createdAt))}`:`${timeSince(new Date(updatedAt))} (edited)`
                                    }
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* options */}
            {
                enableOptions ? 
                    (owner && owner._id === userId) ? 
                    (
                        <div className='grid grid-cols-12 gap-4 p-4 border-t border-light-btn1_color dark:border-light-bg_dark bg-dark-font_color_dark dark:bg-dark-bg_light'>
                            {/* toggle private option*/}
                            {
                                togglePrivateOption && (
                                    <div className='col-span-6 flex items-center'>
                                        <span className='mr-2 md:mr-4 text-[1rem] md:text-[1.25rem]'>Private</span>
                                        <Switch 
                                        isSwitchOn={isPlaylistPrivate} 
                                        isLoading={isToggleVisibilityButtonLoading}
                                        onSwitchOn={toggleVisibilityStatus}
                                        onSwitchOff={toggleVisibilityStatus} 
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
                            {/* add/remove from playlist option */}
                            {
                                videoAdditionOrDeletionOption && (
                                    <div className='col-span-full grid grid-cols-6'>
                                        <Button 
                                        className={`col-start-5 col-span-2 ${viewType==='Grid' && 'md:col-start-4 md:col-span-3'}`} 
                                        onClick={addOrRemoveVideoHandler}
                                        isLoading={isAddOrRemoveVideoButtonLoading}
                                        >
                                            {
                                            isVideoAdded?
                                            <span className='flex flex-row gap-1 justify-center items-center'>
                                                <span className='text-[1.5rem]'>
                                                    <MinusIcon/>
                                                </span>
                                                Remove
                                            </span>
                                            :
                                            <span className='flex flex-row gap-1 justify-center items-center'>
                                                <span className='text-[1.5rem]'>
                                                    <PlusIcon/>
                                                </span>
                                                Add
                                            </span>
                                            }
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

export default PlaylistCard2;