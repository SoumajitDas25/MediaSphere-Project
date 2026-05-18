import { useEffect, useRef, useState } from "react";
import { UploadIcon } from "../../assets/icons";
import {Button,Input,Modal, TextArea} from "../";
import { useDispatch } from "react-redux";
import { startUpload } from '../../slices/uploadSlice';
import { useForm,Controller } from "react-hook-form";

const UploadVideoModal = ({setIsModalOpened}) => {

    const [videoSrc, setVideoSrc] = useState("");
    const videoRef = useRef(null); // Reference to the video element
    // const [video,setVideo]=useState(null);
    const dispatch = useDispatch();
    const {
        register,
        handleSubmit,
        formState: { errors },
        control
      } = useForm({ mode: onchange});

    const handleFileChange = (event) => {
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
            <div className={`flex flex-col justify-center items-center w-full border-2 ${videoSrc?'border-none':'border-dashed border-light-font_color_light dark:border-light-btn1_color'} py-12`}>
                {videoSrc && <h2 className="text-left">Video Preview</h2>}
                <div className="flex justify-center text-[5rem] py-4">
                    {
                        videoSrc ? 
                        <video ref={videoRef}
                         controls
                         className="w-full rounded-lg">
                            <source src={videoSrc} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                        :
                        <label htmlFor="upload-video" className="cursor-pointer">
                            <UploadIcon/>
                        </label>   
                    }
                </div>
              {
                !videoSrc && 
                <h6 className="mb-2 font-semibold">
                Select Video file to upload
                </h6>
              } 
              {/* <p className="text-gray-400">
                Your videos will be private untill you publish them.
              </p> */}
              <Button>
                <label
                    htmlFor="upload-video"
                    className="cursor-pointer"
                >
                    <Input type="file" 
                    accept="video/*"
                    id="upload-video" 
                    bgColor="bg-transparent"
                    className="sr-only" 
                    {...register("video",{
                      required:"Video is required",
                      onChange: handleFileChange
                    })}
                    /> 
                        {videoSrc? 'Change File': 'Select File'} 
                </label> 
              </Button>
              {/* video validation error message */}
              {errors.video && (
                    <p className="text-red-500">{errors.video.message}</p>
              )}           
            </div>

            <div className="w-full">
              <label htmlFor="thumbnail" className="mb-1 inline-block">
                Thumbnail
                <sup>*</sup>
              </label>
              <Input
                id="thumbnail"
                type="file" 
                accept="image/*"
                className="px-2 py-1 file:mr-4 file:border-none file:bg-color-yellow file:text-black file:font-semibold file:px-4 file:py-2 file:rounded-lg file:text-[4vw] file:sm:text-[1rem] file:cursor-pointer" 
                bgColor="bg-transparent"
                {...register("thumbnail",{
                  required:"Thumbnail is required"
                })}
              />
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
                >Publish</Button>
            </div>
          </form>
        </Modal>
  );
};

export default UploadVideoModal;