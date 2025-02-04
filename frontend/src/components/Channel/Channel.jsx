import React, { useEffect, useState } from 'react'
import { SampleCoverImage,VideoThumbnail } from '../../assets/images'
import { Button, ListContainer,Loader } from '..'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { userAPI,videoAPI,tweetAPI,playlistAPI } from '../../api'

const Channel = () => {

    let {username} = useParams();
    const {avatar,channelName,username:Username} = useSelector(state=>state.user.user);
    const [channelProfile,setChannelProfile] = useState(null);
    // const [activeContentData,setActiveContentData] = useState(null);
    const [activeButtonIndex,setActiveButtonIndex] = useState(null);
    const [activeContent,setActiveContent] = useState(null);
    const [loading,setLoading] = useState(true);
    const {getUserChannelProfile} = userAPI;
    const {getUserVideos} = videoAPI;
    const {getUserTweets} = tweetAPI;
    const {getUserPlaylists} = playlistAPI;

    // const videos = [
    //     {
    //         _id:'1',
    //         thumbnail: "https://res.cloudinary.com/predator-op/image/upload/v1721682299/zti6yq56udcw3kljsal0.png",
    //         title: "Understanding JavaScript Closures",
    //         duration: 600,
    //         viewsCount: 105,
    //         owner:{
    //                 _id:"66e9cb6ef5a380d1842c4624",
    //                 username:"predator315",
    //                 channelName:"Code_With_Predator",
    //                 avatar:"http://res.cloudinary.com/predator-op/image/upload/v1726598000/gczafpyqy0mnwen02stx.jpg"
    //         },
    //         createdAt: "2024-09-29T10:00:00.000+00:00",
    //         updatedAt: "2024-09-29T10:00:00.000+00:00"
    //     },
    //     {
    //         _id:'2',
    //         thumbnail: VideoThumbnail,
    //         title: "React Hooks Explained",
    //         duration: 750,
    //         viewsCount: 200,
    //         owner:{
    //                 _id:"66e9cb6ef5a380d1842c4624",
    //                 username:"predator315",
    //                 channelName:"Code_With_Predator",
    //                 avatar:"http://res.cloudinary.com/predator-op/image/upload/v1726598000/gczafpyqy0mnwen02stx.jpg"
    //             }, 
    //         createdAt: "2024-09-28T12:00:00.000+00:00",
    //         updatedAt: "2024-09-28T12:00:00.000+00:00"
    //     },
    //     {
    //         _id:'3',
    //         thumbnail: "https://res.cloudinary.com/predator-op/image/upload/v1721682299/zti6yq56udcw3kljsal0.png",
    //         title: "Mastering Redux Toolkit",
    //         duration: 1200,
    //         viewsCount: 350,
    //         owner:{
    //                 _id:"66e9cb6ef5a380d1842c4624",
    //                 username:"predator315",
    //                 channelName:"Code_With_Predator",
    //                 avatar:"http://res.cloudinary.com/predator-op/image/upload/v1726598000/gczafpyqy0mnwen02stx.jpg"
    //             }, 
    //         createdAt: "2024-09-27T15:00:00.000+00:00",
    //         updatedAt: "2024-09-27T15:00:00.000+00:00"
    //     }
    //   ];    
      
    // const tweets = [
    //     {
    //         _id:'1',
    //         owner:{
    //             _id:"66e9cb6ef5a380d1842c4624",
    //             username:"predator315",
    //             channelName:"Code_With_Predator",
    //             avatar:"http://res.cloudinary.com/predator-op/image/upload/v1726598000/gczafpyqy0mnwen02stx.jpg"
    //         },
    //         content: "Excited about the new project launch!",
    //         likesCount: 45,
    //         commentsCount: 20,
    //         isLiked:true,
    //         createdAt: "2024-09-29T12:00:00.000+00:00",
    //         updatedAt: "2024-09-30T12:00:00.000+00:00"
    //     },
    //     {
    //         _id:'2',
    //         owner:{
    //             _id:"66e9cb6ef5a380d1842c4624",
    //             username:"predator315",
    //             channelName:"Code_With_Predator",
    //             avatar:"http://res.cloudinary.com/predator-op/image/upload/v1726598000/gczafpyqy0mnwen02stx.jpg"
    //         },
    //         content: "Had a great day at the conference today.",
    //         likesCount: 32,
    //         commentsCount: 10,
    //         isLiked:false,
    //         createdAt: "2024-09-28T10:00:00.000+00:00",
    //         updatedAt: "2024-09-28T10:00:00.000+00:00"
    //     },
    //     {
    //         _id:'3',
    //         owner:{
    //             _id:"66e9cb6ef5a380d1842c4624",
    //             username:"predator315",
    //             channelName:"Code_With_Predator",
    //             avatar:"http://res.cloudinary.com/predator-op/image/upload/v1726598000/gczafpyqy0mnwen02stx.jpg"
    //         },
    //         content: "Looking forward to the weekend!",
    //         likesCount: 15,
    //         commentsCount: 50,
    //         isLiked:false,
    //         createdAt: "2024-09-27T08:00:00.000+00:00",
    //         updatedAt: "2024-09-27T08:00:00.000+00:00"
    //     }
    // ];    
    
    // const playlists = [
    //     {
    //         _id:'1',
    //         name: "JavaScript Essentials",
    //         description:
    //         "A collection of videos explaining the core concepts of JavaScript.",
    //         thumbnail: VideoThumbnail,
    //         videosCount: 4, 
    //         owner:{
    //             _id:"66e9cb6ef5a380d1842c4624",
    //             username:"predator315",
    //             channelName:"Code_With_Predator",
    //             avatar:"http://res.cloudinary.com/predator-op/image/upload/v1726598000/gczafpyqy0mnwen02stx.jpg"
    //         },
    //         createdAt: "2024-09-29T11:00:00.000+00:00",
    //         updatedAt: "2024-09-29T11:00:00.000+00:00",
    //     },
    //     {
    //         _id:'2',
    //         name: "React for Beginners",
    //         description: "Beginner-friendly videos to get started with React.js.",
    //         thumbnail: VideoThumbnail,
    //         videosCount: 10, 
    //         owner:{
    //             _id:"66e9cb6ef5a380d1842c4624",
    //             username:"predator315",
    //             channelName:"Code_With_Predator",
    //             avatar:"http://res.cloudinary.com/predator-op/image/upload/v1726598000/gczafpyqy0mnwen02stx.jpg"
    //         },
    //         createdAt: "2024-09-28T15:30:00.000+00:00",
    //         updatedAt: "2024-10-01T15:30:00.000+00:00",
    //     },
    //     {
    //         _id:'3',
    //         name: "Full Stack Development",
    //         description: "A complete guide to full stack development using MERN.",
    //         thumbnail: VideoThumbnail,
    //         videosCount: 6, 
    //         owner:{
    //             _id:"66e9cb6ef5a380d1842c4624",
    //             username:"predator315",
    //             channelName:"Code_With_Predator",
    //             avatar:"http://res.cloudinary.com/predator-op/image/upload/v1726598000/gczafpyqy0mnwen02stx.jpg"
    //         },
    //         createdAt: "2024-09-27T09:00:00.000+00:00",
    //         updatedAt: "2024-09-27T09:00:00.000+00:00",
    //     }
    // ];
      
    const ribbon=[
        {
            id:'1',
            name:'Videos',
            content: {
                type: 'Video',
                getData: (userId, page, limit) => {
                    return getUserVideos(userId, page, limit);
                }
            }
        },
        {
            id:'2',
            name:'Tweets',
            content: {
                type: 'Tweet',
                getData: (userId, page, limit) => {
                    return getUserTweets(userId, page, limit);
                }
            }
        },
        {
            id:'3',
            name:'Playlists',
            content: {
                type: 'Playlist',
                getData: (userId, page, limit) => {
                    return getUserPlaylists(userId, page, limit);
                }
            }
        }
    ];

    const loadContentData = async (pageIndex = 1,limit = 6)=>{

        try
        {
            let response;

            switch(activeContent.type)
            {
                case 'Video':
                {
                    response = await getUserVideos(channelProfile._id,pageIndex,limit);
                    break;
                }
                case 'Tweet':
                {
                    response = await getUserTweets(channelProfile._id,pageIndex,3);
                    break;
                }
                case 'Playlist':
                {
                    response = await getUserPlaylists(channelProfile._id,pageIndex,4);
                    break;
                }
            }
            if (response.status < 200 || response.status >= 300)
            {
                //error
                //TODO: View the error component
                console.log("Error: ");
            }
            else
            {
                return response.data.data;
            }
        }
        catch(error)
        {
            //display an error message
            console.log(error);
        }
    }

    useEffect(()=> {

        //strip @ from the start of username
        username = username.startsWith('@') ? username.substring(1) : username;
        console.log(username);

        //get the userChannelProfile
        (async ()=>{
            try
            {
                const response = await getUserChannelProfile(username);
                if (response.status < 200 || response.status >= 300)
                {
                    //error
                    //TODO: View the error component
                    console.log("Error: ");
                }
                else
                {
                    // console.log(response.data.data);
                    setChannelProfile(response.data.data);
                    setActiveButtonIndex(0);
                    setActiveContent(ribbon[0].content);
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
    },[]);

    // useEffect(()=>{

    //     //get the ribbon content data only when the user profile is loaded successfully
    //     if(channelProfile && activeContent)
    //     loadContentData();

    // },[activeContent]);

    return (
        <>
        {
            loading?
            <Loader hideBackground={true}/>
            :
            <div>

                {/* Cover Image */}
                <div 
                style={{backgroundImage: `url('${SampleCoverImage}')`}} 
                className={`h-[13rem] overflow-hidden bg-cover bg-center`}>
                    {/* <img src={SampleCoverImage} alt="" /> */}
                </div>

                {/* Info Section*/}
                <div className="flex py-4 gap-4">
                    {/* avatar */}
                    <div>
                        <img 
                        src={avatar} 
                        className="h-[8rem] md:h-[9rem] lg:h-[10rem] rounded-full"
                        alt="User Avatar"
                        />
                    </div>
                    {/* info */}
                    <div className='flex flex-1 flex-col gap-2 justify-center'>
                        {/* Channel Name */}
                        <h1 className="font-bold text-[5vw] md:text-[2rem] lg:text-[2.5rem]">{channelName}</h1>
                        {/* username */}
                        <h2 className='text-[3vw] sm:text-[1rem] md:text-[1.2rem] text-light-font_color_light dark:text-dark-font_color_dark'>@{Username}</h2>
                        <div className='flex flex-row gap-4 text-[3vw] sm:text-[1rem] md:text-[1.2rem] text-light-font_color_light dark:text-dark-font_color_dark'>
                            {/* subscriber */}
                            <h2>65 Subscribers</h2>
                            <h2>14 Videos</h2>
                        </div>
                    </div>
                </div>

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
                        // data={activeContentData?activeContentData.paginatedContent:null}  
                        // fetchData={loadContentData}
                        isPaginationEnabled={true} 
                        // totalPaginationPages={activeContentData?activeContentData.totalPages:null} 
                        fetchPaginatedData={loadContentData}
                        />
                    )
                }

            </div>
        }
        </>
        
    )
}

export default Channel