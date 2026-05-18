import { useEffect, useState } from 'react'
import {Button, Input, Modal, TextArea} from "../"
import { Controller, useForm } from 'react-hook-form';
import { UploadIcon } from '../../assets/icons';

const EditVideoModal = ({
    setIsModalOpened,
    defaultData={
        thumbnailUrl:'',
        title:'',
        description:''
    },
    submitButtonText='Save',
    submitHandler=null,
    isSubmitButtonLoading = null
}) => {

    const {thumbnailUrl,title,description} = defaultData;
    const [thumbnailSrc, setThumbnailSrc] = useState(thumbnailUrl);
    const [enableSubmitButton,setEnableSubmitButton] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        watch
    } = useForm({ 
        mode: onchange,
        defaultValues: {
            title,
            description,
            thumbnail: null,
        }
    });
     const watchedValues = watch();

    useEffect(() => {
        const hasTitleChanged = watchedValues.title !== title;
        const hasDescChanged = watchedValues.description !== description;
        const hasThumbnailChanged = thumbnailSrc !== thumbnailUrl && watchedValues.thumbnail!==null; 

        const changed = hasTitleChanged || hasDescChanged || hasThumbnailChanged;
        const notEmpty = watchedValues.title!=='' && watchedValues.description!=='';
        setEnableSubmitButton(changed && notEmpty);
    }, [watchedValues, thumbnailSrc, defaultData]);

    const handleFileChange = (event) => {
        const file = event.target.files[0]; // Get the selected file
        if (file) {
        const newThumbnailURL = URL.createObjectURL(file); // Create temporary URL
        if (thumbnailSrc) 
        {
          URL.revokeObjectURL(thumbnailSrc); // Revoke the previous URL to prevent memory leaks
        }
        setThumbnailSrc(newThumbnailURL); // Set thumbnail source
        }
        // setThumbnail(file);
    };

    return (
        <Modal 
        className="w-[90%] max-w-3xl" 
        heading="Edit Video" 
        setIsModalOpened={setIsModalOpened}
        >
            {/* Content */}
            <form 
            onSubmit={handleSubmit(submitHandler)} 
            className="mx-auto flex w-full flex-col gap-y-4 p-4 max-h-[80vh] overflow-auto scrollbar-hide">

                {/* thumbnail */}
                <div className='flex flex-col gap-2'>
                    <h2 className="text-left text-[1rem] font-medium leading-6">Thumbnail</h2>
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
                                onChange: handleFileChange
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

                {/* title */}
                <div className="w-full">
                    <Input
                    id="title"
                    label="Title"
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

                {/* description */}
                <div className="w-full">
                    <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                        <TextArea
                        id="desc" 
                        label="Description"
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
                    isLoading={isSubmitButtonLoading}
                    isEnabled={enableSubmitButton}
                    >
                        {submitButtonText}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}

export default EditVideoModal