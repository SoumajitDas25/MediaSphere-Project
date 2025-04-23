import React, { useEffect, useState } from 'react';
import {useDispatch,useSelector} from "react-redux";
import { clearUpload } from '../../slices/uploadSlice';
import {setSuccessMessage,setFailureMessage} from '../../slices/messageSlice'
import { colors } from '../../assets/themes/theme';
import { TickIcon } from '../../assets/icons';
import { videoAPI } from '../../api';
import {uploadListeners} from '../../sockets/listeners';

const Uploader = () => {

  const dispatch = useDispatch();
  const {isUploading, hasCompleted,data,filesCount} = useSelector((state) => state.upload);
  const [progress,setProgress] = useState(0);
  const {listenToUploadProgress,stopListeningUploadProgress,listenToUploadError,stopListeningUploadError}=uploadListeners;
  let uploadedFilesProgress = {};

  const constructFilefromMetaData = async(metadata)=>{
      const response = await fetch(metadata.tempUrl);
      // console.log(response);
      const blob = await response.blob();
      return new File([blob],metadata.name,{type:metadata.type});
  }

  // const setTotalProgressPercentage = (progressPercentage)=>{

  //   let totalProgressPercentage
  //   if(progress<50)
  //   { //upload phase 1(upload from client to server)- 0-49%
  //     totalProgressPercentage=Math.floor(progressPercentage*0.5);
  //     if(Math.abs(totalProgressPercentage-progress)>=10)
  //     {
  //       // console.log('Upload Phase 1: ',progress,progressPercentage,totalProgressPercentage);
  //       setProgress(totalProgressPercentage);
  //     }
  //   }
  //   else
  //   {
  //     //upload phase 2(upload from server to blob storage)- 50-100%
  //     totalProgressPercentage=Math.floor((50+((progressPercentage/filesCount)*0.5)));
  //     console.log(totalProgressPercentage);//for debugging
  //     if(Math.abs(totalProgressPercentage-progress)>=10)
  //     {
  //       // console.log('Upload Phase 2: ',progress,progressPercentage,totalProgressPercentage);
  //       setProgress(totalProgressPercentage);
  //     }
  //   }
  //   setTimeout(()=>{ //for debugging
  //     console.log(progress,progressPercentage,totalProgressPercentage);
  //   },1000);  

  // } 

  const setTotalProgressPercentage = (progressPercentage, phase, fileIndex = null) => {
    let totalProgressPercentage;

    if (phase === 1) 
    {
      // Upload phase 1: overall upload from client to server (0–49%)
      totalProgressPercentage = Math.floor(progressPercentage * 0.5);
    } else if (phase === 2 && fileIndex !== null) {
      // Upload phase 2: per-file upload from server to blob (50–100%)
      uploadedFilesProgress[fileIndex] = progressPercentage;

      const totalFileProgress =
        Object.values(uploadedFilesProgress).reduce((sum, val) => sum + val, 0) / filesCount;

      // Map to 50–100%
      totalProgressPercentage = Math.floor(50 + (totalFileProgress * 0.5));
    }

    // Update only if change is significant (>=10%)
    if (Math.abs(totalProgressPercentage - progress) >= 10) {
      setProgress(totalProgressPercentage);
    }
   
  };


  useEffect(()=>{

    (async()=>{

      try
      {
        //construct video & thumbnail files from their data
        // console.log(data);
        const video = await constructFilefromMetaData(data.videoMetadata);
        const thumbnail = await constructFilefromMetaData(data.thumbnailMetadata);

        const uploadData={
          video,
          thumbnail,
          title:data.title,
          description:data.description
        }

        const response = await videoAPI.publishVideo(uploadData,setTotalProgressPercentage);
        if(response.status==201)
        dispatch(setSuccessMessage({
          content:'Video Uploaded Successfully'
        }));
        else
        dispatch(setFailureMessage({
          content:'Something went wrong while Uploading'
        }));
        dispatch(clearUpload());
      }
      catch(err)
      {
        console.log('error');
        dispatch(setFailureMessage({
          content:'Something went wrong while Uploading'
        }));
        dispatch(clearUpload());
      }
    })();

    listenToUploadProgress(setTotalProgressPercentage);
    // listenToUploadComplete(() => {
    //   console.log("Upload complete");
    // });
    listenToUploadError(() => {
      console.error("Upload failed");
    });

    return () => {
      stopListeningUploadProgress(); // Clean up
      stopListeningUploadError();
    };

  },[]);

  // useEffect(()=>{
  //   if(progress>=100)
  //   {
  //     // dispatch(finishUpload());
  //     dispatch(clearUpload());
      
  //     // setTimeout(()=>{
  //     //   dispatch(resetUpload());
  //     // },3000);
  //   }
  // },[progress])

    return (
      <div className='fixed right-[2rem] bottom-[2rem] z-[60] transition-all  bg-light-bg_light dark:bg-dark-btn1_color text-light-font_color_dark dark:text-dark-font_color_light flex flex-row rounded-full overflow-hidden duration-500'>

          {
              hasCompleted && <div className='flex items-center justify-center p-2 pl-5'>
              Video Uploaded Successfully
              </div>
          }

        <div 
          className='relative h-[4rem] w-[4rem] md:h-[5rem] md:w-[5rem] rounded-full bg-transparent transition-all duration-500 text-[0.75rem] md:text-[1rem] p-2 flex items-center justify-center'
          style={{ background: `conic-gradient( ${colors.dark_yellow} ${progress}%, gray 0)`}}
        >
          <div className="flex items-center justify-center rounded-full h-[2.85rem] w-[2.85rem] md:h-[3.75rem] md:w-[3.75rem]  bg-light-bg_light dark:bg-dark-btn1_color text-light-font_color_dark dark:text-dark-font_color_light">
            <span className='transition-all duration-500'>{progress<100?`${progress}%`:
            <span className='text-[2.5rem]'>
              <TickIcon/>
            </span>
            }</span>
          </div>
        </div>
      </div>
    )
}

export default Uploader