import { useEffect, useState,useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { throttle } from "lodash";
import { resetUpload,finishUpload } from '../../slices/uploadSlice';
import { setSuccessMessage, setFailureMessage } from '../../slices/messageSlice';
import { colors,lightTheme } from '../../assets/themes/theme';
import { TickIcon } from '../../assets/icons';
import { videoAPI } from '../../api';

const Uploader = () => {
  const dispatch = useDispatch();
  const { isUploading, hasCompleted, data, filesCount } = useSelector((state) => state.upload);
  const [progress, setProgress] = useState(0);
  const totalFilesSizeRef = useRef(0);
  const totalUploadedBytesRef = useRef(0);
  const lastFileUploadedBytesRef = useRef(0);
  const {getFileUploadCredentials,uploadFileToCloudinary,publishVideo} = videoAPI;

  const constructFilefromMetaData = async (metadata) => {
    const response = await fetch(metadata.tempUrl);
    const blob = await response.blob();
    return new File([blob], metadata.name, { type: metadata.type });
  };

  const throttledSetProgress = useRef(
    throttle((uploadedFileBytes) => {

      const newUploadedBytes = Math.abs(uploadedFileBytes - lastFileUploadedBytesRef.current); //calcuting the diff between now & last uploaded bytes
      lastFileUploadedBytesRef.current = uploadedFileBytes;
      totalUploadedBytesRef.current += newUploadedBytes; //appending the diff to totalUploadedBytes
      const combinedProgress = Math.floor((totalUploadedBytesRef.current / totalFilesSizeRef.current) * 100);
      if(Math.abs(combinedProgress - progress) >= 10)
        setProgress(combinedProgress)
      },500,{leading:false,trailing:true})
  ).current;

  useEffect(() => {

    let timer1,timer2;
    (async () => {

      try {
        //contruct the files from their metadata
        const video = await constructFilefromMetaData(data.videoMetadata);
        const thumbnail = await constructFilefromMetaData(data.thumbnailMetadata);
        if(!(video && thumbnail))
        {
          throw new Error("Video or Thumbnail is missing");
        }
        totalFilesSizeRef.current = video.size+thumbnail.size; //storing the total size of all files
        // console.log((totalFilesSizeRef.current / (1032*1032)).toPrecision(2));

        //get the upload crendentials for the video
        let uploadCredentials;
        uploadCredentials = await getFileUploadCredentials('video');
        if(!uploadCredentials.data.data)
        {
          throw new Error("Video upload credentails fetch failed")
        }
        // console.log("video: ",uploadCredentials.data.data);
        //upload the video to cloudinary
        lastFileUploadedBytesRef.current=0; //intitializing lastUploadedBtyes for each file
        const videoMetadata = await uploadFileToCloudinary(video,uploadCredentials.data.data,throttledSetProgress);
        // console.log("video size: ",(video.size/(1032*1032)).toPrecision(2));

        //get the upload crendentials for the thumbnail
        uploadCredentials = await getFileUploadCredentials('image');
        if(!uploadCredentials.data.data)
        {
          throw new Error("Thumbnail upload credentails fetch failed")
        }
        // console.log("thumbnail: ",uploadCredentials.data.data);
        //upload the thumbnail to cloudinary
        lastFileUploadedBytesRef.current=0;
        const thumbnailMetadata = await uploadFileToCloudinary(thumbnail,uploadCredentials.data.data,throttledSetProgress);
        // console.log("thumbnail size: ",(thumbnail.size/(1032*1032)).toPrecision(2));

        //save the metadata to the backend
        const metadata = {
          videoMetadata: videoMetadata.data,
          thumbnailMetadata: thumbnailMetadata.data,
          title: data.title,
          description: data.description
        }
        await publishVideo(metadata);

        await new Promise((resolve,reject) =>{ //delay for showing animation
          timer1 = setTimeout(() => { 
            dispatch(finishUpload());
            dispatch(setSuccessMessage({ content: 'Video uploaded successfully!' }));
            resolve();
          }, 3000);
        });
      } 
      catch (err) 
      {
        console.error(err);
        dispatch(setFailureMessage({ content: 'Something went wrong while uploading' }));
      }
      finally
      {
        timer2 = setTimeout(() => { //delay for showing completed status
          dispatch(resetUpload());
        }, 3000);
      }
    })();
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    } // Cleanup timeout on unmount
  }, []);

  return (
    <div className='fixed right-[2rem] bottom-[2rem] z-[60] transition-all bg-light-bg_light dark:bg-dark-btn1_color text-light-font_color_dark dark:text-dark-font_color_light flex flex-row rounded-full overflow-hidden duration-500 shadow-custom shadow-light-btn1_color'>
            {/* {hasCompleted && <div className='flex items-center justify-center p-2 pl-5'>Video Uploaded Successfully</div>} */}
            <div className={`w-[4rem] md:w-[5rem] aspect-1 rounded-full transition-all duration-500 text-[0.75rem] md:text-[1.2rem] p-2 flex items-center justify-center ${(progress===100 && !hasCompleted) && 'animate-[spin_0.7s_ease-in-out_infinite]'}`} style={{ background: `conic-gradient(${colors.yellow} ${progress<100?progress:hasCompleted?'100':'75'}%, ${lightTheme.font_color_light} 0)`}}>
              {
                progress<100 && (
                  <div className="flex items-center justify-center rounded-full w-[2.85rem]  md:w-[3.75rem] aspect-1 bg-light-bg_light dark:bg-dark-btn1_color shadow-custom shadow-light-btn1_color">
                    <span className='transition-all duration-500'>
                        <span className='font-extrabold text-color-dark_yellow'>
                        {`${progress}%`}
                        </span>                       
                    </span>
                  </div>
                )
              }
              </div>   
            {
              progress===100 && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full w-[2.85rem]  md:w-[3.75rem] aspect-1 bg-light-bg_light dark:bg-dark-btn1_color shadow-custom shadow-light-btn1_color text-[0.75rem] md:text-[1.2rem]">
                  <span className='transition-all duration-500'>
                    { 
                        !hasCompleted?
                        <span className='font-extrabold text-color-dark_yellow'>
                        {`${progress}%`}
                        </span>
                        : 
                      <span className='text-[2.5rem]'>
                        <TickIcon />
                      </span>  
                    }
                  </span>
                </div>
              )
            }
          </div>
  );
};

export default Uploader;