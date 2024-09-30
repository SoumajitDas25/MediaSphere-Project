import React from 'react'
import {ListContainer} from '../components'
import {VideoThumbnail} from "../assets/images"
import { useNavigate } from 'react-router-dom';

const Home = () => {

  const navigate = useNavigate();

    const videos=[
        {
          _id:'1',
          thumbnail: VideoThumbnail,
          title:"Learn DBMS in 1 Video | Interview Preparation",
          channelName: "Code with Predator",
          views: '1k',
          duration:'4:30',
          createdAt: '21 Aug, 2024 09:00 AM'
        },
        {
          _id:'2',
          thumbnail: VideoThumbnail,
          title:"Learn DBMS in 1 Video | Interview Preparation",
          channelName: "Code with Predator",
          views: '1k',
          duration:'6:00',
          createdAt: '4 Sep, 2024 00:36 AM'
        },
        {
          _id:'3',
          thumbnail: VideoThumbnail,
          title:"Learn DBMS in 1 Video | Interview Preparation",
          channelName: "Code with Predator",
          views: '1k',
          duration:'16:30:35',
          createdAt: '5 Sep, 2024 08:55 PM'
        },
        {
          _id:'4',
          thumbnail: VideoThumbnail,
          title:"Learn DBMS in 1 Video | Interview Preparation",
          channelName: "Code with Predator",
          views: '1k',
          duration:'50:32',
          createdAt: '20 July, 2024 10:00 AM'
        },
        {
          _id:'5',
          thumbnail: VideoThumbnail,
          title:"Learn DBMS in 1 Video | Interview Preparation",
          channelName: "Code with Predator",
          views: '1k',
          duration:'1:50:32',
          createdAt: '2 Feb, 2024 01:00 AM'
        },
        {
          _id:'6',
          thumbnail: VideoThumbnail,
          title:"Learn DBMS in 1 Video | Interview Preparation",
          channelName: "Code with Predator",
          views: '1k',
          duration:'1:32:00',
          createdAt: '25 July, 2022 10:00 AM'
        },
        {
          _id:'7',
          thumbnail: VideoThumbnail,
          title:"Learn DBMS in 1 Video | Interview Preparation",
          channelName: "Code with Predator",
          views: '1k',
          duration:'10:32',
          createdAt: '25 July, 2022 10:00 AM'
        },
    ]

  return (
            // <div className="grid grid-cols-12 gap-[1rem] md:gap-[1.2vw] xl:gap-[1.5rem] xxl:w-[100rem] mx-auto flex-1">
            //   {
            //     videos.map((video,index)=>(
            //       <div key={video._id} className='col-span-full sm:col-span-10 sm:col-start-2 md:col-span-6 lg:col-span-4 xl:col-span-3 xl:max-w-[25rem] flex justify-center' onClick={()=>navigate('/video')}>
            //         <VideoCard  {...video}/>
            //       </div>
            //     ))
            //   }
            // </div>
            <ListContainer data={videos} type='Video'/>

  )
}

export default Home