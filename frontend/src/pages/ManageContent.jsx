import { useEffect, useRef, useState } from 'react'
import { Button, Heading, ListContainer } from '../components'
import {videoAPI,tweetAPI,playlistAPI} from "../api";
import { useSelector } from 'react-redux';
import {useSyncEvents} from "../events/hooks";

const ManageContent = () => {

    const [activeButtonIndex,setActiveButtonIndex] = useState(null);
    const [activeContent,setActiveContent] = useState(null);
    const activeContentRef = useRef(null);
    const listRef = useRef(null);

    const userId = useSelector(state=>state.user.user?._id);

    const {getAllUserVideos} = videoAPI;
    const {getAllUserTweets} = tweetAPI;
    const {getAllUserPlaylists} = playlistAPI;

    const ribbon=[
        {
            id:'1',
            name:'Videos',
            content: {
                type: 'Video',
                getData: (userId, page, limit) => {
                    return getAllUserVideos(userId, page, limit);
                },
                options:{
                    editOption:true,
                    deleteOption:true,
                    togglePublishOption:true
                }
            }
        },
        {
            id:'2',
            name:'Tweets',
            content: {
                type: 'Tweet',
                getData: (userId, page, limit) => {
                    return getAllUserTweets(userId, page, limit);
                },
                options:{
                    editOption:true,
                    deleteOption:true,
                    togglePublishOption:true
                }
            }
        },
        {
            id:'3',
            name:'Playlists',
            content: {
                type: 'Playlist2',
                getData: (userId, page, limit) => {
                    return getAllUserPlaylists(userId, page, limit);
                },
                options:{
                    editOption:true,
                    deleteOption:true,
                    togglePrivateOption:true
                }
            }
        }
    ];

    useEffect(()=>{
        //track activeContent
        activeContentRef.current=activeContent;
    },[activeContent])

    useEffect(()=>{
        if(userId)
        {
            setActiveButtonIndex(0);
            setActiveContent(ribbon[0].content);
        }
    },[userId]);

    const loadContentData = async (pageIndex = 1,limit = 6)=>{

        try
        {
            const response = await activeContent.getData(userId,pageIndex,limit)
            if (response.status < 200 || response.status >= 300)
            {
                //error
                //TODO: View the error component
                console.log("Error: ");
                return null;
            }
            else
            {
                // console.log(response.data.data.paginatedContent);
                return response.data.data;
            }
        }
        catch(error)
        {
            //display an error message
            // console.log(error);
            return null;
        }
    }

    //sync events for user domain
    useSyncEvents({
      domain:'user',
      id:userId?userId:null,
      publicHandlers:{
        onReload:({source,value})=>{
          switch(source)
          {
            case 'videolist':
              if(activeContentRef.current.type.toLowerCase()==='video')
                {
                    listRef.current.reload(value);
                }
              break;
            
            case 'tweetlist':
              if(activeContentRef.current.type.toLowerCase()==='tweet')
                {
                    listRef.current.reload(value);
                }
              break;

            case 'playlistlist':
              if(activeContentRef.current.type.toLowerCase()==='playlist2')
                {
                    listRef.current.reload(value);
                }
              break;
          }
        }
      }
    });

    return (
        <div>
            <Heading>Manage Content</Heading>

            {/* ribbon */}
            <ul className='flex flex-row justify-center gap-4 p-4'>
                {
                    ribbon.map((button,index)=>(
                        <Button 
                        className={`${activeButtonIndex===index?'bg-color-yellow':'bg-transparent hover:bg-light-bg_light dark:hover:bg-dark-btn1_color text-light-font_color_dark dark:text-dark-font_color_light'}`} 
                        key={button.id} 
                        onClick={()=>{
                            setActiveButtonIndex(()=>index);
                            setActiveContent(button.content);
                        }}
                        >
                            {button.name}
                        </Button>
                    ))
                }
            </ul>

            {/* Horizontal line bar */}
            <div className='bg-light-font_color_dark dark:bg-dark-font_color_light h-[1px]'></div>

            {/*Paginated Content*/}
            {
                activeContent && (
                    <ListContainer 
                    type={activeContent.type} 
                    isPaginationEnabled={true}  
                    fetchPaginatedData={loadContentData}
                    dataLimitPerPage={6}
                    viewType="List"
                    ref={listRef}
                    enabledItemOptions={activeContent.options}
                    allowDelayLoad={true}
                    delayLoadDurationInMs={700}
                    />
                )
            }
        </div>
    )
}

export default ManageContent