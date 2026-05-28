import { useEffect, useRef, useState } from "react";
import { UploadIcon } from "../../assets/icons";
import {Button,Input,Modal, TextArea, ImageCropper} from "../";
import { useDispatch, useSelector } from "react-redux";
import { startUpload } from '../../slices/uploadSlice';
import {setIsCropperOpened,setCropProperties,setCropReset,setCropLoading} from '../../slices/cropSlice'
import { useForm,Controller } from "react-hook-form";

const UploadVideoModal = ({setIsModalOpened}) => {

    const dispatch = useDispatch();
    const [videoSrc, setVideoSrc] = useState("");
     const [thumbnailSrc, setThumbnailSrc] = useState("");
    const videoRef = useRef(null); // Reference to the video element
    const [enableSubmitButton,setEnableSubmitButton] = useState(false);
    const {isCropperOpened,image:cropImage,aspectRatio:cropAspectRatio,cropSource,isCompleted:isCropCompleted,error:cropError} = useSelector(state=>state.crop);
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        watch
      } = useForm({ 
        mode: onchange,
        defaultValues: {
            video:null,
            thumbnail: null,
            title:"",
            description:""
        }
      });
    const watchedValues = watch();

    useEffect(() => { 
        const notEmpty = watchedValues.title!=='' && watchedValues.description!=='' && watchedValues.thumbnail!==null && watchedValues.video!==null;
        setEnableSubmitButton(notEmpty);
    }, [watchedValues, thumbnailSrc, videoSrc]);

    const handleVideoFileChange = (event) => {
        const file = event.target.files[0]; // Get the selected file
        if (file) {
        const newVideoURL = URL.createObjectURL(file); // Create temporary URL
        if (videoSrc) 
        {
          URL.revokeObjectURL(videoSrc); // Revoke the previous URL to prevent memory leaks
        }
        setVideoSrc(newVideoURL); // Set video source
        }
        // setVideo(file);
    };

    const handleThumbnailFileChange = (event) => {
      const file = event.target.files[0]; // Get the selected file
      if (file) 
      {
        updateImageViaCropperHandler(file,8/5,'thumbnail')
      }
    };
    
    const updateImageViaCropperHandler = (file,aspectRatio,cropSource) => {
      //create temp Url
      const tempUrl = URL.createObjectURL(file);
        
      //dispatch crop actions
      dispatch(setCropProperties({
        image: tempUrl,
        aspectRatio: aspectRatio,
        cropSource: cropSource
      })); 
      dispatch(setIsCropperOpened(true));
    }
        
    const onCropComplete = async (croppedImage)=>{
        
      //enable loading
      dispatch(setCropLoading(true));
        
      //create temp Url
      const tempUrl = URL.createObjectURL(croppedImage);
        
      // Set thumbnail source
      setThumbnailSrc(tempUrl);
      // console.log(croppedImage);
        
      //reset the crop state
      dispatch(setCropReset());
    }

    const submitHandler = async (data)=>{

      const uploadData = {
        videoMetadata: {
          name:data.video[0].name,
          type:data.video[0].type,
          tempUrl:URL.createObjectURL(data.video[0])
        },
        thumbnailMetadata: {
          name:data.thumbnail[0].name,
          type:data.thumbnail[0].type,
          tempUrl:URL.createObjectURL(data.thumbnail[0])
        },
        title: data.title,
        description: data.description
      }

      //disptach the upload action
      dispatch(startUpload({
        data:uploadData,
        filesCount:2
      }));
      setIsModalOpened(false);
    }

    // Reload video when src changes
    useEffect(() => {
      if (videoRef.current) {
        videoRef.current.load(); // Forces the video to reload the new source
      }
    }, [videoSrc]);

  return (
        <Modal 
        className="w-[90%] max-w-3xl" 
        heading="Upload Video" 
        setIsModalOpened={setIsModalOpened}
        >
          {/* Content */}
          <form 
          onSubmit={handleSubmit(submitHandler)} 
          className="mx-auto flex w-full flex-col gap-y-4 p-4 max-h-[80vh] overflow-auto scrollbar-hide">

            {/* Image Cropper */}
            {(isCropperOpened && cropImage && cropAspectRatio && cropSource)? 
              <ImageCropper
              file={cropImage}
              aspect={cropAspectRatio}
              cropSource = {cropSource}
              onComplete={onCropComplete}
              />:''
            }

            {/* Video */}
            <div className='w-full flex flex-col gap-2'>
              <h2 className="text-left text-[1rem] font-medium leading-6">Video<sup>*</sup></h2>
              <div className={`flex  w-full aspect-[8/5] rounded-lg ${videoSrc?'border-none':'border-2 border-dashed border-light-font_color_light dark:border-light-btn1_color bg-light-bg_dark dark:bg-dark-bg_light dark:bg-opacity-30'}`}>
                {
                  videoSrc ? 
                  <video ref={videoRef}
                  controls
                  className="w-full aspect-[8/5] rounded-lg">
                    <source src={videoSrc} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  :  
                  <label htmlFor="upload-video" className="cursor-pointer w-full flex flex-col justify-center items-center gap-4">
                    <span className='text-[5rem]'>
                      <UploadIcon/>
                    </span>
                    {
                      !videoSrc && 
                      <h6 className="mb-2 font-semibold">
                      Select Video file to upload
                      </h6>
                    }
                  </label>  
                }
              </div>
              <div className='w-full grid grid-cols-6'>
                <Button 
                className='col-span-full sm:col-start-2 sm:col-span-4 md:col-start-3 md:col-span-2'
                >
                  <label
                  htmlFor="upload-video"
                  className="cursor-pointer w-full"
                  >
                    <Input 
                    type="file" 
                    accept="video/*"
                    id="upload-video" 
                    bgColor="bg-transparent"
                    className="sr-only" 
                    {...register("video",{
                      required:"Video is required",
                      onChange: handleVideoFileChange
                    })}
                    /> 
                    {videoSrc? 'Change File': 'Select File'} 
                  </label> 
                </Button>
              </div>
              {/* video validation error message */}
              {errors.video && (
                    <p className="text-red-500">{errors.video.message}</p>
              )}           
            </div>

            {/* thumbnail */}
            <div className='w-full flex flex-col gap-2'>
              <h2 className="text-left text-[1rem] font-medium leading-6">Thumbnail<sup>*</sup></h2>
              <div className={`flex  w-full aspect-[8/5] rounded-lg ${thumbnailSrc?'border-none':'border-2 border-dashed border-light-font_color_light dark:border-light-btn1_color bg-light-bg_dark dark:bg-dark-bg_light dark:bg-opacity-30'}`}>
                {
                  thumbnailSrc ? 
                  <img  
                  src={thumbnailSrc}
                  controls
                  className="w-full aspect-[8/5] rounded-lg"/>
                  :
                  <label htmlFor="thumbnail" className="cursor-pointer w-full flex flex-col justify-center items-center gap-4">
                    <span className='text-[5rem]'>
                      <UploadIcon/>
                    </span>
                    {
                      !thumbnailSrc && 
                      <h6 className="mb-2 font-semibold">
                        Select Thumbnail file to upload
                      </h6>
                    }
                  </label>   
                }
              </div> 
              <div className='w-full grid grid-cols-6'>
                <Button 
                className='col-span-full sm:col-start-2 sm:col-span-4 md:col-start-3 md:col-span-2'
                >
                  <label
                  htmlFor="thumbnail"
                  className="cursor-pointer w-full"
                  >
                    <Input 
                    type="file" 
                    accept="image/*"
                    id="thumbnail" 
                    bgColor="bg-transparent"
                    className="sr-only" 
                    {...register("thumbnail",{
                      required:"Thumbnail is required",
                      onChange: handleThumbnailFileChange
                    })}
                    /> 
                    {thumbnailSrc? 'Change File': 'Select File'} 
                  </label> 
                </Button>
              </div>
              {/* thumbnail validation error message */}
              {errors.thumbnail && (
                <p className="text-red-500">{errors.thumbnail.message}</p>
              )}           
            </div>

            <div className="w-full">
              <label htmlFor="title" className="mb-1 inline-block">
                Title
                <sup>*</sup>
              </label>
              <Input
                id="title"
                type="text"
                className="px-2 py-1"
                bgColor="bg-transparent"
                {...register("title",{
                  required:"Title is required"
                })}
              />
              {/*title validation error message */}
              {errors.title && (
                    <p className="text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="w-full">
              <label htmlFor="desc" className="mb-1 inline-block">
                Description
                <sup>*</sup>
              </label>
              <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextArea
                id="desc"
                className="h-80 px-2 py-1"
                bgColor="bg-transparent"
                value={field.value}
                setValue={field.onChange}
                limit={500}
                />
              )}
              />
              
              {/* description validation error message */}
              {errors.description && (
                    <p className="text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="flex justify-center gap-2">
                <Button 
                className="bg-light-bg_dark dark:bg-dark-font_color_light text-light-font_color_dark" 
                onClick={()=>setIsModalOpened(false)}
                >
                  Cancel
                </Button>
                <Button
                type="submit" 
                isEnabled={enableSubmitButton}
                >
                  Publish
                </Button>
            </div>
          </form>
        </Modal>
  );
};

export default UploadVideoModal;