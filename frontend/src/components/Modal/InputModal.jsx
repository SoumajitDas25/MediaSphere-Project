import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {Modal,TextArea,Button} from "../"

const InputModal = forwardRef(({
    setIsModalOpened = false,
    heading='Input',
    defaultValue = '',
    placeholder = '',
    rows = 3,
    limit =300,
    submitButtonText = 'Submit',
    submitHandler = null,
    isSubmitButtonLoading = false,
    className=''
},ref) => {

    const [inputText,setInputText]=useState(defaultValue);
    const inputRef = useRef(null);

    useImperativeHandle(ref,()=>({ //expose these to parent via ref
        getValue: ()=>inputRef.current.value,
        reset: ()=>{
            inputRef.current.reset();
        }
    }));

    return (
        <Modal 
        className={`w-[90%] max-w-3xl ${className}`} 
        heading={heading}
        setIsModalOpened={setIsModalOpened} 
        >
            {/* Content */}
            <div className="mx-auto flex w-full flex-col gap-y-4 p-4 max-h-[80vh] overflow-auto scrollbar-hide">
                <div className="w-full">
                    <TextArea
                    className="h-40 px-2 py-1"
                    bgColor="bg-transparent"
                    rows={rows}
                    limit={limit}
                    placeholder={placeholder} 
                    ref={inputRef} 
                    value={inputText}
                    setValue={setInputText}
                    />
                </div>
                <div className="flex justify-center gap-2">
                    <Button 
                    className="bg-light-bg_dark dark:bg-dark-font_color_light text-light-font_color_dark" 
                    onClick={()=>{
                        inputRef.current.reset();
                        setIsModalOpened(false);
                    }}
                    >
                        Cancel
                    </Button>
                    <Button 
                    onClick={submitHandler}
                    isLoading={isSubmitButtonLoading}
                    isEnabled={inputText!=='' && inputText!==defaultValue}
                    >
                        {submitButtonText}
                    </Button>
                </div>
            </div>
        </Modal>
    )
});

export default InputModal