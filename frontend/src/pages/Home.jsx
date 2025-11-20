import {Heading, ListContainer,ContentLoader} from '../components'
import {videoAPI} from "../api";

const Home = () => {

    // const videos=[
    //     {
    //       _id:'1',
    //       thumbnail: VideoThumbnail,
    //       title:"Learn DBMS in 1 Video | Interview Preparation",
    //       channelName: "Code with Predator",
    //       views: '1k',
    //       duration:'4:30',
    //       createdAt: '21 Aug, 2024 09:00 AM'
    //     },
    //     {
    //       _id:'2',
    //       thumbnail: VideoThumbnail,
    //       title:"Learn DBMS in 1 Video | Interview Preparation",
    //       channelName: "Code with Predator",
    //       views: '1k',
    //       duration:'6:00',
    //       createdAt: '4 Sep, 2024 00:36 AM'
    //     },
    //     {
    //       _id:'3',
    //       thumbnail: VideoThumbnail,
    //       title:"Learn DBMS in 1 Video | Interview Preparation",
    //       channelName: "Code with Predator",
    //       views: '1k',
    //       duration:'16:30:35',
    //       createdAt: '5 Sep, 2024 08:55 PM'
    //     },
    //     {
    //       _id:'4',
    //       thumbnail: VideoThumbnail,
    //       title:"Learn DBMS in 1 Video | Interview Preparation",
    //       channelName: "Code with Predator",
    //       views: '1k',
    //       duration:'50:32',
    //       createdAt: '20 July, 2024 10:00 AM'
    //     },
    //     {
    //       _id:'5',
    //       thumbnail: VideoThumbnail,
    //       title:"Learn DBMS in 1 Video | Interview Preparation",
    //       channelName: "Code with Predator",
    //       views: '1k',
    //       duration:'1:50:32',
    //       createdAt: '2 Feb, 2024 01:00 AM'
    //     },
    //     {
    //       _id:'6',
    //       thumbnail: VideoThumbnail,
    //       title:"Learn DBMS in 1 Video | Interview Preparation",
    //       channelName: "Code with Predator",
    //       views: '1k',
    //       duration:'1:32:00',
    //       createdAt: '25 July, 2022 10:00 AM'
    //     },
    //     {
    //       _id:'7',
    //       thumbnail: VideoThumbnail,
    //       title:"Learn DBMS in 1 Video | Interview Preparation",
    //       channelName: "Code with Predator",
    //       views: '1k',
    //       duration:'10:32',
    //       createdAt: '25 July, 2022 10:00 AM'
    //     },
    // ]

    const {getAllVideos} = videoAPI;

    const fetchAllVideos = async (page=1,limit=9)=>{
      try
      {
        const response = await getAllVideos(page,limit);
        // console.log(response.data.data);
        return response.data.data;
      }
      catch(err)
      {
        console.log(err);
        return null;
      }
    }

  return (
    <div>
      {/* <Heading className='py-2'>Home</Heading>  */}
      <ListContainer 
      isPaginationEnabled={true} 
      fetchPaginatedData={fetchAllVideos}
      dataLimitPerPage={15}
      allowDelayLoad={true}
      delayLoadDurationInMs={700}
      />
    </div>  
  )
}

export default Home