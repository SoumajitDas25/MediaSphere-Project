import React from 'react';
import {Button,Modal} from "../";
import { tweetAPI } from '../../api';

const {createTweet} = tweetAPI;

const CreateTweetModal = ({setIsModalOpened}) => {

  return (
    <Modal 
    className="w-[90%] max-w-3xl"
    heading="Create Tweet" 
    setIsModalOpened={setIsModalOpened}
    >
        {/* Content */}
        <div className="mx-auto flex w-full flex-col gap-y-4 p-4 max-h-[80vh] overflow-auto scrollbar-hide">
            <div className="w-full">
                <textarea
                    id="desc"
                    className="h-40 w-full resize-none border bg-transparent px-2 py-1 outline-none border-light-font_color_light dark:border-light-btn1_color rounded-lg"
                    placeholder='Write a Tweet'
                ></textarea>
            </div>
            <div className="flex justify-center gap-2">
                <Button 
                className="bg-light-bg_dark dark:bg-dark-font_color_light text-light-font_color_dark" 
                onClick={()=>setIsModalOpened(false)}
                >
                    Cancel
                </Button>
                <Button 
                >
                    Publish
                </Button>
            </div>
        </div>
    </Modal>
  )
}

export default CreateTweetModal