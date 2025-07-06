import React, { useEffect } from 'react';
import { videoAPI } from '../api';
import { useParams } from 'react-router-dom';

const Video = () => {

    let {videoId} = useParams();
    const {getVideoById} = videoAPI;

    const getVideoDetails = async () =>{
       try
        {
            console.log(videoId);
            const response = await getVideoById(videoId);
            return response.data.data;
        }
        catch(error)
        {
            //display an error message
            console.log(error);
        }
    }

    useEffect(()=>{

      //load video details
      (async()=>{
        const response = await getVideoDetails();
        console.log(response);
      })();
    },[])

    return (
      <div className="text-[4rem] font-extrabold">
          Video
      </div>
    )
}

export default Video