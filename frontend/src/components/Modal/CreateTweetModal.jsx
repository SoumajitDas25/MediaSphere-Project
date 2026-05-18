import { useEffect, useRef, useState } from 'react';
import {InputModal} from "..";
import { tweetAPI } from '../../api';
import { useDispatch } from 'react-redux';
import { setSuccessMessage, setFailureMessage } from '../../slices/messageSlice';

const CreateTweetModal = ({setIsModalOpened}) => {

    const [isPublishButtonLoading,setIsPublishButtonLoading] = useState(false);
    const inputRef = useRef(null);
    const dispatch = useDispatch();

    const {createTweet} = tweetAPI;

    const publishTweet = async ()=>{
        try
        {
            setIsPublishButtonLoading(true);
            const tweetText = inputRef.current.getValue();
            if(tweetText)
            {
                const response = await createTweet(tweetText);
                console.log(response.data);
            }
            inputRef.current.reset();
            setIsModalOpened(false);
            dispatch(setSuccessMessage({ content: 'Tweet published' }));

        }
        catch(err)
        {
            console.log(err);
            dispatch(setFailureMessage({ content: 'Something went wrong while publishing Tweet' }));
        }
        finally
        {
            setIsPublishButtonLoading(false);
        }
    }

    return (
        // <Modal 
        // className="w-[90%] max-w-3xl"
        // heading="Create Tweet" 
        // setIsModalOpened={setIsModalOpened}
        // >
        //     {/* Content */}
        //     <div className="mx-auto flex w-full flex-col gap-y-4 p-4 max-h-[80vh] overflow-auto scrollbar-hide">
        //         <div className="w-full">
        //             <textarea
        //                 id="desc"
        //                 className="h-40 w-full resize-none border bg-transparent px-2 py-1 outline-none border-light-font_color_light dark:border-light-btn1_color rounded-lg"
        //                 placeholder='Write a Tweet'
        //             ></textarea>
        //         </div>
        //         <div className="flex justify-center gap-2">
        //             <Button 
        //             className="bg-light-bg_dark dark:bg-dark-font_color_light text-light-font_color_dark" 
        //             onClick={()=>setIsModalOpened(false)}
        //             >
        //                 Cancel
        //             </Button>
        //             <Button 
        //             >
        //                 Publish
        //             </Button>
        //         </div>
        //     </div>
        // </Modal>
        <InputModal 
        setIsModalOpened={setIsModalOpened} 
        heading='Create Tweet'
        placeholder='Write a Tweet'
        submitButtonText='Publish'
        submitHandler={publishTweet}
        isSubmitButtonLoading = {isPublishButtonLoading}
        ref={inputRef}
        />
    )
}

export default CreateTweetModal