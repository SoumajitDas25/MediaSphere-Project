import React, { useState, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import { useDispatch, useSelector } from "react-redux";
import { VideoThumbnail } from "../../assets/images";
import {Button,Modal,ContentLoader} from "../";
import {setIsCropperOpened,setCropComplete,setCropError,setCropReset} from '../../slices/cropSlice'

import "react-easy-crop/react-easy-crop.css";

const ImageCropper = ({ 
  heading = 'Crop Image',
  file, 
  aspect = 1, 
  setIsCropperOpened,
  cropSource,
  onComplete
}) =>{

  const dispatch = useDispatch();
  const {isLoading} = useSelector(state=>state.crop);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
  if (!file) return;

  if (typeof file === "string") {
    setImageSrc(file); // Already a URL or relative path
  } else {
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    return () => URL.revokeObjectURL(url);
  }
}, [file]);

  const onCropComplete = useCallback((_croppedArea, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener("load", () => resolve(img));
      img.addEventListener("error", (err) => reject(err));
      img.setAttribute("crossOrigin", "anonymous");
      img.src = url;
    });

  const getCroppedImg = async (src, pixels) => {
    const image = await createImage(src);
    const canvas = document.createElement("canvas");
    canvas.width = pixels.width;
    canvas.height = pixels.height;
    canvas.className='bg-red-500';

    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      image,
      pixels.x,
      pixels.y,
      pixels.width,
      pixels.height,
      0,
      0,
      pixels.width,
      pixels.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg", 0.95);
    });
  };

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;

    try 
    {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      // Derive a sensible filename
      const baseName = typeof file === "string"
        ? (file.split("/").pop()?.split("?")[0] || "image").replace(/\.[^/.]+$/, "")
        : file.name.replace(/\.[^/.]+$/, "");

      const croppedFile = new File([blob], `${baseName}_cropped.jpg`, {
        type: blob.type,
      });

      // console.log(croppedFile,croppedFile.name,croppedFile.type);
      
      dispatch(setCropComplete());
      onComplete && onComplete(croppedFile); //passing the cropped image to the parent
    } 
    catch (err) 
    {
      console.error("🛑 Failed to crop image", err);
      dispatch(setCropError());
    }
  };

  if (!imageSrc) return null;

  return (
    <Modal
    className="w-full h-screen sm:h-[90vh] sm:w-[90%]  lg:h-min max-w-4xl flex flex-col relative"
    heading={heading}
    setIsModalOpened={(isOpened)=>{
      if(isOpened)
      dispatch(setIsCropperOpened(isOpened));
      else
      dispatch(setCropReset());
    }}
    >
      {/* Loader */}
      {isLoading && (
        <div className="absolute h-full w-full z-[60]">
          <ContentLoader enableBackgroundBlur={true}/>
        </div>
      )}
      
      <div className="flex flex-col justify-between flex-1">

        {/* Cropper */}
          <div className="relative w-full aspect-1 sm:aspect-[16/9] inset-0 z-50 flex items-center justify-center flex-grow">

            <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            restrictPosition
            />

          </div>

        <div className="w-full flex flex-col justify-center gap-2 py-4">
          {/* Zoom Range */}
          <div className="flex justify-center items-center gap-4 px-6 py-2">
            <label htmlFor="zoom" className="text-sm font-medium">
              Zoom
            </label>
            <input
              id="zoom"
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full sm:w-[80%] max-w-2xl accent-color-yellow"
            />
          </div>
          {/* Button Ribbon */}
          <div className="flex justify-center gap-2">
            <Button 
              className="bg-light-bg_dark dark:bg-dark-font_color_light text-light-font_color_dark" 
              onClick={()=>dispatch(setCropReset())}
            >
              Cancel
            </Button>
            <Button
            onClick={handleConfirm}
            >
              Done
            </Button>
          </div>
          {/* <div className=" flex gap-4 justify-center ">
            <button
              className="rounded-xl bg-gray-200 px-6 py-2 text-sm font-medium hover:bg-gray-300"
              onClick={()=>setIsCropperOpened(false)}
            >
              Cancel
            </button>

            <button
              className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              onClick={handleConfirm}
            >
              Crop &amp; Upload
            </button>
          </div> */}
        </div>
      </div>
    </Modal>
  );
}

export default ImageCropper;