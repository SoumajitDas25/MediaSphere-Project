import { useEffect, useState } from 'react'
import {Button, Input, Modal, TextArea} from ".."
import { Controller, useForm } from 'react-hook-form';

const EditPlaylistModal = ({
    setIsModalOpened,
    defaultData={
        name:'',
        description:''
    },
    submitButtonText='Save',
    submitHandler=null,
    isSubmitButtonLoading = null
}) => {

    const {name,description} = defaultData;
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
            name,
            description
        }
    });
     const watchedValues = watch();

    useEffect(() => {
        const hasNameChanged = watchedValues.name !== name;
        const hasDescChanged = watchedValues.description !== description; 

        const changed = hasNameChanged || hasDescChanged;
        const notEmpty = watchedValues.name!=='' && watchedValues.description!=='';
        setEnableSubmitButton(changed && notEmpty);
    }, [watchedValues, defaultData]);

    return (
        <Modal 
        className="w-[90%] max-w-3xl" 
        heading="Edit Playlist" 
        setIsModalOpened={setIsModalOpened}
        >
            {/* Content */}
            <form 
            onSubmit={handleSubmit(submitHandler)} 
            className="mx-auto flex w-full flex-col gap-y-4 p-4 max-h-[80vh] overflow-auto scrollbar-hide">

                {/* name */}
                <div className="w-full">
                    <Input
                    id="name"
                    label="Name"
                    type="text" 
                    className="px-2 py-1"
                    bgColor="bg-transparent"
                    {...register("name",{
                    required:"Name is required"
                    })}
                    />
                    {/*name validation error message */}
                    {errors.name && (
                        <p className="text-red-500">{errors.name.message}</p>
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

export default EditPlaylistModal