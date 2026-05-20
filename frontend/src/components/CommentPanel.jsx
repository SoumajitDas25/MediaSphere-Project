import { useRef, useState } from 'react'
import {commentAPI,replyAPI} from "../api"
import {TextArea,Button, ListContainer, CommentCard} from "../components"
import {CloseIcon, NoAvatarIcon} from "../assets/icons"
import { useSelector } from 'react-redux'
import { isArray } from 'lodash'

const CommentPanel = ({
    mediaType = 'Video',
    mediaId,
    isPanelExpanded,
    setIsPanelExpanded
}) => {

    const [isReplyPanelExpanded,setIsReplyPanelExpanded] = useState(false);
    const [loadRepliesForComment,setLoadRepliesForComment] = useState(null);
    const [isCommentButtonLoading,setIsCommentButtonLoading] = useState(false);
    const [isReplyButtonLoading,setIsReplyButtonLoading] = useState(false);
    const [newCommentText,setNewCommentText] = useState(''); 
    const [newReplyText,setNewReplyText] = useState(''); 
    const commentListRef = useRef(null);
    const replyListRef = useRef(null);
    const user = useSelector(state=>state.user?.user);

    const {getVideoComments,getTweetComments,addVideoComment,addTweetComment} = commentAPI;
    const {getCommentReplies,addVideoCommentReply,addTweetCommentReply} = replyAPI;

    const fetchComments = async (pageIndex = 1,limit = 6) => {
         try
        {   
            let response;

            switch(mediaType.toLowerCase())
            {
                case 'video':
                    response = await getVideoComments(mediaId,pageIndex,limit);
                    break;

                case 'tweet':
                    response = await getTweetComments(mediaId,pageIndex,limit);
                    break;

                default:
                    response=null;
            } 
            if(response)
            {
                // console.log(response.data.data);
                return response.data.data;
            }
            else
                return null;
        }
        catch(error)
        {
            //display an error message
            console.log(error);
            return null;
        }
    }

    const addComment = async () => {
        try
        {
            let response;
            setIsCommentButtonLoading(true);

            switch(mediaType.toLowerCase())
            {
                case 'video':
                    response = await addVideoComment(mediaId,newCommentText);
                    break;

                case 'tweet':
                    response = await addTweetComment(mediaId,newCommentText);
                    break;

                default: 
                    response=null;
            }  
            if(response)
            {
                console.log(response.data.data);
                setNewCommentText(''); //reset the comment textbox
                commentListRef.current.reload('insertOne');  
            }    
        }
        catch(error)
        {
            //display an error message
            console.log(error);
        }
        finally
        {
          setIsCommentButtonLoading(false);
        }
    }

    const fetchCommentReplies = async (pageIndex = 1,limit = 6) => {
        try
        {
            const response = await getCommentReplies(loadRepliesForComment._id,pageIndex,limit);
            console.log(response.data.data);

            //attach comment owner info as repliedTo field to each reply object
            if(response.data.data && response.data.data.paginatedContent && isArray(response.data.data.paginatedContent) && response.data.data.paginatedContent.length>0)
            {
                response.data.data.paginatedContent = response.data.data.paginatedContent.map(reply=>({...reply,repliedTo:loadRepliesForComment.owner}));
            }
            return response.data.data;
        }
        catch(error)
        {
            //display an error message
            console.log(error);
            return null;
        }
    }

    const addCommentReply = async () => {
        try
        {
            let response;
            setIsReplyButtonLoading(true);

            switch(mediaType.toLowerCase())
            {
                case 'video':
                    response = await addVideoCommentReply(loadRepliesForComment._id,loadRepliesForComment.owner._id,newReplyText);
                    break;

                case 'tweet':
                    response = await addTweetCommentReply(loadRepliesForComment._id,loadRepliesForComment.owner._id,newReplyText);
                    break;

                default: 
                    response=null;
            }
            
            if(response)
            {
                // console.log(response.data.data); 
                setNewReplyText(''); //reset the reply textbox
                replyListRef.current.reload('insertOne');
                setLoadRepliesForComment(state=>({...state,repliesCount:state.repliesCount+1}));
            }
        }
        catch(error)
        {
            //display an error message
            console.log(error);
        }
        finally
        {
          setIsReplyButtonLoading(false);
        }
    }

    return (
        <div className='relative h-full'>
            {/* comments panel */}
            <div className='h-full flex flex-col gap-2'>
                {/* Comment Header */}
                <div className='text-[1.5rem] flex flex-row justify-between items-center gap-4 py-2 px-4 font-semibold border-b border-b-light-font_color_dark dark:border-b-dark-font_color_light'>
                    {/* <h1>Comments</h1> */}
                    <div className='flex flex-row items-center gap-1 cursor-pointer'>
                        {/* Comment Icon */}
                            {/* <span className='text-[2rem] hidden md:inline-block'>
                                <CommentIcon/>
                            </span> */}
                        {/* CommentsCount */}
                        {/* <span className='hidden md:inline-block'>{data.commentsCount}</span> */}
                        <h1>Comments</h1>
                    </div>
                    {
                        isPanelExpanded && 
                        <span 
                        className='text-[3rem] md:hidden' 
                        onClick={()=>{
                            if(newCommentText)
                                setNewCommentText('')
                            setIsPanelExpanded(false)
                        }}>
                            <CloseIcon/>
                        </span>
                    }
                </div>
 
                {/* Comment List */}
                <div className={`mt-1 ${isPanelExpanded ? 'scrollbar-hide flex-1 overflow-y-scroll':'overflow-y-auto'}`}>

                    {/* Comment Option */}
                    <div className='flex flex-row p-4 gap-3'>
                        {/* avatar */}
                        <div className="overflow-hidden flex justify-center items-start cursor-pointer" 
                        onClick={(event)=>{
                            event.stopPropagation();
                            navigate(`/channel/@${user.username}`);
                        }}
                        >
                            {
                                user && user.avatar?
                                <img 
                                src={user.avatar} 
                                alt="Video Thumbnail" 
                                className="rounded-[50%] max-h-[12vw] sm:max-h-[3rem]"
                                />
                                :
                                <span className="text-[7vw] sm:text-[2.5rem] text-light-font_color_light dark:text-dark-font_color_light">
                                    <NoAvatarIcon/>
                                </span>    
                            }                 
                        </div>
                        <div className='flex-grow flex flex-col gap-2'>
                            <TextArea 
                            rows={3}
                            limit={300}
                            placeholder='Write a Comment'
                            value={newCommentText}
                            setValue={setNewCommentText} 
                            />
                            <div className='flex justify-end'>
                                <Button 
                                onClick={addComment}
                                isLoading={isCommentButtonLoading}
                                isEnabled={newCommentText!==''}
                                >
                                    Submit
                                </Button>
                            </div>
                        </div>
                    </div>

                    <ListContainer 
                    type='comment' 
                    isPaginationEnabled={true}  
                    fetchPaginatedData={fetchComments}
                    dataLimitPerPage={6}
                    viewType='List'
                    ref={commentListRef}
                    allowDelayLoad={true}
                    delayLoadDurationInMs={700}
                    onItemClick={(comment)=>{
                        setLoadRepliesForComment(comment);
                        if(setIsPanelExpanded)
                            setIsPanelExpanded(true);
                        setIsReplyPanelExpanded(true);
                    }}
                    />
                </div>
            </div>

            {/* Replies Panel */}
            {
                isReplyPanelExpanded && (
                <div className='absolute top-0 left-0 w-full h-full flex flex-col bg-light-bg_dark dark:bg-dark-bg_light'>
                    {/* Reply Header */}
                    <div className='text-[1.5rem] flex flex-row justify-between items-center gap-4 py-2 px-4 font-semibold border-b border-b-light-font_color_dark dark:border-b-dark-font_color_light'>
                        <div className='flex flex-row items-center gap-1 cursor-pointer'>
                            {/* RepliesCount */}
                            <span className='hidden md:inline-block'>{loadRepliesForComment.repliesCount}</span>
                            <h1>Replies</h1>
                        </div>
                        <span 
                        className='text-[3rem] cursor-pointer' 
                        onClick={()=>{
                            if(newReplyText)
                                setNewReplyText('');
                            setIsReplyPanelExpanded(false)
                            setLoadRepliesForComment(null)
                        }}><CloseIcon/></span>
                    </div>
                          
                    {/* Replies List */}
                    <div className={`mt-1 ${isReplyPanelExpanded ? 'scrollbar-hide flex-1 overflow-y-scroll':'overflow-y-auto'}`}>
                        {/* Comment */}
                        <CommentCard
                        data={loadRepliesForComment}
                        hideRepliesCount={true}
                        />
                        {/* Reply Option */}
                        <div className='flex flex-row p-4 gap-3'>
                            {/* avatar */}
                            <div className="overflow-hidden flex justify-center items-start cursor-pointer" 
                            onClick={(event)=>{
                                event.stopPropagation();
                                navigate(`/channel/@${user.username}`);
                            }}
                            >
                                {
                                    user && user.avatar?
                                    <img 
                                    src={user.avatar} 
                                    alt="Video Thumbnail" 
                                    className="rounded-[50%] max-h-[12vw] sm:max-h-[3rem]"
                                    />
                                    :
                                    <span className="text-[7vw] sm:text-[2.5rem] text-light-font_color_light dark:text-dark-font_color_light">
                                        <NoAvatarIcon/>
                                    </span>    
                                }                 
                            </div>
                            <div className='flex-grow flex flex-col gap-2'>
                                <TextArea 
                                rows={3}
                                limit={300}
                                placeholder='Leave a Reply'
                                value={newReplyText}
                                setValue={setNewReplyText}
                                />
                                <div className='flex justify-end'>
                                    <Button 
                                    onClick={addCommentReply} 
                                    isLoading={isReplyButtonLoading} 
                                    isEnabled={newReplyText!==''}
                                    >
                                        Submit
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <ListContainer 
                        type='reply' 
                        isPaginationEnabled={true}  
                        fetchPaginatedData={fetchCommentReplies}
                        dataLimitPerPage={6}
                        viewType='List'
                        ref={replyListRef}
                        allowDelayLoad={true}
                        delayLoadDurationInMs={700}
                        />
                    </div>
                </div>
                )
            }
        </div> 
    )
}

export default CommentPanel