import React from 'react'
import {Button, Modal} from '../'

const ConfirmModel = ({
    setIsModalOpened=false,
    heading='Confirm',
    message='Sample Message',
    confirmHandler=null,
    isConfirmButtonLoading=false,
    className=''
}) => {

    return (
        <Modal 
        heading={heading}
        setIsModalOpened={setIsModalOpened}
        className={`w-[40%] max-w-3xl ${className}`}
        >
            <div className="mx-auto flex w-full flex-col gap-y-4 p-4 max-h-[80vh] overflow-auto scrollbar-hide">
                {/* Message */}
                <div className="text-center py-6">
                    {message}
                </div>

                <div className="flex justify-center gap-2">
                    <Button
                    className="bg-light-bg_dark dark:bg-dark-font_color_light text-light-font_color_dark" 
                    onClick={()=>{
                        setIsModalOpened(false)
                    }}
                    >
                        Cancel
                    </Button>
                    <Button 
                    onClick={confirmHandler}
                    isLoading={isConfirmButtonLoading}
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

export default ConfirmModel