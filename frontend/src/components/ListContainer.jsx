import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {VideoCard,TweetCard,PlaylistCard,ChannelCard,CommentCard,ReplyCard,ContentLoader,Button} from '.';
import { uploadListeners,refreshListeners } from '../sockets/listeners';
// import { useSelector } from 'react-redux';

const ListContainer = forwardRef(({ //to expose its instance to its parent using a ref
    fetchData, //for non paginated data
    type ='Video',
    isPaginationEnabled = false,
    fetchPaginatedData, //for paginated data
    dataLimitPerPage = 6,
    viewType = 'Grid',
    minHeight,
    maxWidth,
    allowDelayLoad = false,
    delayLoadDurationInMs = 0,
    noDataDisplayMessage=null,
    renderCustomItem, //for rendering custom child
    onItemClick=null,
},ref) => {

    const [activeButtonIndex,setActiveButtonIndex] = useState(null);
    const [loading,setLoading] = useState(false); 
    const [data,setData] = useState(null);
    const [totalPaginationPages,setTotalPaginationPages] = useState(null);
    // const loggedUserId = useSelector(state=>state.user.user._id);
    const {listenToUploadComplete,stopListeningUploadComplete} = uploadListeners;
    const {listenToRefreshContentList,stopListeningRefreshContentList} = refreshListeners;
    const totalPagesRef = useRef(null);
    const currentPageRef = useRef(null);
    const dataRef = useRef(null);

    const renderDefaultItem = (item) => {
        switch (type.toLowerCase()) {
            
        case 'video':
            return (
                <div key={item._id} className={`col-span-full ${viewType==='Grid'?'sm:col-span-10 sm:col-start-2 md:col-span-6 lg:col-span-4 aspect-1 flex justify-center':''} shadow-custom shadow-light-btn1_color rounded-lg dark:shadow-none`}>
                    <VideoCard  
                    data={item} 
                    viewType={viewType}
                    />
                </div>
            );

        case 'tweet':
            return (
                <div key={item._id} className='col-span-full flex justify-center shadow-custom shadow-light-btn1_color rounded-lg dark:shadow-none'>
                    <TweetCard  
                    data={item}
                    />
                </div>
            );

        case 'playlist':
            return (
                <div key={item._id} className='col-span-full sm:col-span-10 sm:col-start-2 md:col-span-6 lg:col-span-4 aspect-w-5 aspect-h-[4.5] flex justify-center shadow-custom shadow-light-btn1_color rounded-lg dark:shadow-none'>
                    <PlaylistCard  
                    data={item}
                    viewType={viewType}
                    />
                </div>
            );

        case 'channel':
            return (
                <div key={item._id} className={`col-span-full ${viewType==='Grid'?'lg:col-span-4 xl:col-span-3 aspect-[4/5] flex justify-center':''} shadow-custom shadow-light-btn1_color rounded-lg dark:shadow-none`}>
                    <ChannelCard 
                    data={item.channelDetails}
                    connectionType={type}
                    reloadData={reload}    
                    viewType={viewType}
                    />
                </div>
            );

        case 'subscriber':
            return (
                <div key={item._id} className={`col-span-full ${viewType==='Grid'?'lg:col-span-4 xl:col-span-3 aspect-[4/5] flex justify-center':''} shadow-custom shadow-light-btn1_color rounded-lg dark:shadow-none`}>
                    <ChannelCard 
                    data={item.channelDetails}
                    connectionType={type}
                    reloadData={reload}    
                    viewType={viewType}
                    />
                </div>
            );

        case 'subscription':
            return (
                <div key={item._id} className={`col-span-full ${viewType==='Grid'?'lg:col-span-4 xl:col-span-3 aspect-[4/5] flex justify-center':''} shadow-custom shadow-light-btn1_color rounded-lg dark:shadow-none`}>
                    <ChannelCard 
                    data={item.channelDetails}
                    connectionType={type}
                    reloadData={reload}    
                    viewType={viewType}
                    />
                </div>
            );

        case 'comment':
            return (
                <div key={item._id} className='col-span-full flex justify-center shadow-custom shadow-light-btn1_color rounded-lg dark:shadow-none'>
                    <CommentCard  
                    data={item}
                    onClick={onItemClick}
                    listRef={ref}
                    />
                </div>
            );

        case 'reply':
            return (
                <div key={item._id} className='col-span-full flex justify-center shadow-custom shadow-light-btn1_color rounded-lg dark:shadow-none'>
                    <ReplyCard  
                    data={item}
                    listRef={ref}
                    />
                </div>
            );

        default:
            return null; // or throw error
        }
    };

    // Function to fetch data(paginated/non-paginated) based on its page index
    const loadData = async (pageIndex,isReload) => {

        let timeOut;
        setLoading(true); 
        try 
        {
            if(isPaginationEnabled)
            {
                //fetch paginated data
                setActiveButtonIndex(pageIndex-1);
                const response = await fetchPaginatedData(pageIndex,dataLimitPerPage);
                if(response && response.paginatedContent && Array.isArray(response.paginatedContent) && response.paginatedContent.length !== 0) 
                {
                    setData(response.paginatedContent);
                    if(isReload)
                    {
                        setTotalPaginationPages(response.totalPages);
                    }
                }
                else
                {
                    setData(null); //set data to null if there is no data at current index
                    if(response) //in case when response came but there is no data at the current index, then re-set the totalpages
                    {
                        setTotalPaginationPages(response.totalPages);
                    }
                    // if(pageIndex===1)
                    // { // if there is no data at page index 1, then it means there is no data at all,so set the totalpages to null
                    //     setTotalPaginationPages(null);
                    // }
                }
            }
            else
            {
                //fetch non-paginated data
                const response = await fetchData();
                if(response &&  Array.isArray(response) && response.length !== 0) 
                setData(response);
                else
                setData(null);
            }
            if(allowDelayLoad)
            {   // delay loading for smooth load
                await new Promise((resolve,reject)=>{
                    timeOut=setTimeout(()=>{
                        resolve();
                    },delayLoadDurationInMs);
                })
            }
        } 
        catch(error) 
        {
            clearTimeout(timeOut);
            console.error('Error fetching data:', error);
        } 
        finally 
        {
            setLoading(false);
        }
    };

    const handlePageButtonClick = async (pageIndex)=>{

        if(isPaginationEnabled)
        {
            loadData(pageIndex);
        }
        // setActiveButtonIndex(pageIndex-1);
    };

    // const reloadDataContentFromParent = ()=>{
    //     if(reloadData)
    //     {
    //         if(isPaginationEnabled)
    //             reloadData(loadData,dataRef.current,currentPageRef.current+1);
    //         else
    //             reloadData(loadData,dataRef.current);
    //     }
    //     else
    //     { //if reloadData is not supplied by the parent
    //         loadData(1); //it will reset the pagination states
    //     }   
    //     console.log('Content List Refreshed');
    // }

    const reload = (reloadType) =>{

        let targetPage = 1;
        if(reloadType)
        {
            switch(reloadType.toLowerCase())
            {
                case 'current': //for reloading current page
                    targetPage = activeButtonIndex + 1;
                    break;

                case 'reset': //for navigating to first page
                    targetPage = 1;
                    break;

                case 'insertone': //for safe reloading by checking overflow condition
                    if(dataRef.current)
                    {
                        if(dataRef.current.length<dataLimitPerPage)
                            targetPage = activeButtonIndex + 1; //current page
                        else
                            targetPage = activeButtonIndex + 2; //next page
                    }
                    else
                        targetPage=1;
                    break;

                case 'deleteone': //for safe reloading by checking underflow condition
                    if(dataRef.current.length<=1)
                    {
                        if(activeButtonIndex+1===1)
                            targetPage = 1;
                        else
                            targetPage = activeButtonIndex; //previous page
                    }
                    else
                        targetPage=activeButtonIndex+1; //current page
                    break;
            }
        }
        loadData(targetPage,true);
    }

    useImperativeHandle(ref,()=>({ //expose reload() to parent via ref
        reload: reload
    }))

    useEffect(()=>{

        //Fetch initial data when the component mounts or when the type changes
        (async ()=>{

            let timeOut;
            setLoading(true); 
            try 
            {
                if(isPaginationEnabled)
                {
                    setActiveButtonIndex(0);
                    //fetch paginated data
                    const response = await fetchPaginatedData(1,dataLimitPerPage); 
                    // console.log(response);
                    if(response && response.paginatedContent && Array.isArray(response.paginatedContent) && response.paginatedContent.length !== 0)
                    {
                        setData(response.paginatedContent);
                        setTotalPaginationPages(response.totalPages);
                    }
                    else
                    {
                        setData(null);
                        setTotalPaginationPages(0);
                    }
                }
                else
                {
                    //fetch non-paginated data
                    const response = await fetchData();
                    // console.log(response);
                    if(response && Array.isArray(response) && response.length !== 0) 
                    setData(response);
                    else
                    setData(null);
                }
                if(allowDelayLoad)
                {   // delay loading for smooth load
                    await new Promise((resolve,reject)=>{
                        timeOut=setTimeout(()=>{
                            resolve();
                        },delayLoadDurationInMs);
                    })
                }
            } 
            catch(error) 
            {
                clearTimeout(timeOut);
                console.error('Error fetching data:', error);
            } 
            finally 
            {
                setLoading(false);
            }
        })();

    },[type]);

    useEffect(()=>{
        totalPagesRef.current = totalPaginationPages; //store the current state upon updation
        // console.log(totalPagesRef.current);
    },[totalPaginationPages]);

    useEffect(()=>{
        dataRef.current = data; //store the current state upon updation
    },[data]);

    useEffect(()=>{
        currentPageRef.current = activeButtonIndex; //store the current state upon updation
    },[activeButtonIndex]);

    useEffect(()=>{
        listenToUploadComplete((uploaderId,mediaType)=>{
            // if(loggedUserId===uploaderId)
            const lastPageIndex = totalPagesRef.current;
            const currentData = dataRef.current;
            if (lastPageIndex && mediaType.toLowerCase()===type.toLowerCase())
            {
                console.log(currentData,lastPageIndex);
                if(currentData.length === dataLimitPerPage) 
                {
                    loadData(lastPageIndex+1) //navigate/load to next page to view the new content if current page is full
                    setTotalPaginationPages(state=>state+1); //increment totalpages by 1
                }
                else
                loadData(lastPageIndex); //refresh the current page to view the new content if current page is not full
            // console.log('Content List Refreshed');
            }
        }); 
        return ()=> stopListeningUploadComplete(); //clean up
    },[])

    useEffect(()=>{
        listenToRefreshContentList(()=>reload("current"));
        return ()=>stopListeningRefreshContentList(); //clean up
    },[])

    return (
        <div className={`flex flex-col justify-between items-center ${minHeight?minHeight:'min-h-[30rem]'}`}>
            {
                // Content Loader
                loading?
                <div className="flex-grow flex items-center">
                    <ContentLoader/>
                </div>
                :
                //Content Container
                <div className={`grid grid-cols-12 gap-[1rem] md:gap-[1.2vw] xl:gap-[1.5rem] p-4 w-full ${maxWidth?maxWidth:'max-w-[70rem]'}`}>
                {
                    data ?
                    (
                        data.map((item)=>(
                            renderCustomItem? renderCustomItem(item): renderDefaultItem(item)
                        ))
                        // (type.toLowerCase()==='video' &&
                        //     data.map((video)=>(
                        //         <div key={video._id} className={`col-span-full ${viewType==='Grid'?'sm:col-span-10 sm:col-start-2 md:col-span-6 lg:col-span-4 aspect-1 flex justify-center':''} shadow-custom shadow-light-btn1_color rounded-lg dark:shadow-none`}>
                        //             <VideoCard  
                        //             data={video} 
                        //             viewType={viewType}
                        //             extraElements={extraChildElements}
                        //             />
                        //         </div>
                        //     ))
                        // ) 
                        // ||
                        // (type.toLowerCase()==='tweet' &&
                        //     data.map((tweet)=>(
                        //         <div key={tweet._id} className='col-span-full flex justify-center shadow-custom shadow-light-btn1_color rounded-lg dark:shadow-none'>
                        //             <TweetCard  
                        //             data={tweet}
                        //             extraElements={extraChildElements}
                        //             />
                        //         </div>
                        //     ))
                        // ) 
                        // ||
                        // (type.toLowerCase()==='playlist' && 
                        //     data.map((playlist)=>(
                        //         <div key={playlist._id} className='col-span-full sm:col-span-10 sm:col-start-2 md:col-span-6 lg:col-span-4 aspect-w-5 aspect-h-[4.5] flex justify-center shadow-custom shadow-light-btn1_color rounded-lg dark:shadow-none'>
                        //             <PlaylistCard  
                        //             data={playlist}
                        //             viewType={viewType}
                        //             extraElements={extraChildElements}
                        //             />
                        //         </div>
                        //     ))
                        // )
                        // ||
                        // ((type.toLowerCase()==='channel' || type.toLowerCase()==='subscription'|| type.toLowerCase()==='subscriber') &&
                        //     data.map((channel)=>(
                        //         <div key={channel._id} className={`col-span-full ${viewType==='Grid'?'lg:col-span-4 xl:col-span-3 aspect-[4/5] flex justify-center':''} shadow-custom shadow-light-btn1_color rounded-lg dark:shadow-none`}>
                        //             <ChannelCard 
                        //             data={channel.channelDetails}
                        //             connectionType={type}
                        //             reloadData={reload}    
                        //             viewType={viewType}
                        //             extraElements={extraChildElements}
                        //             />
                        //         </div>
                        //     ))
                        // )
                        // ||
                        // (type.toLowerCase()==='comment' &&
                        //     data.map((comment)=>(
                        //         <div key={comment._id} className='col-span-full flex justify-center shadow-custom shadow-light-btn1_color rounded-lg dark:shadow-none'>
                        //             <CommentCard  
                        //             data={comment}
                        //             extraElements={extraChildElements}
                        //             />
                        //         </div>
                        //     ))
                        // )
                    )
                    :
                    <div className='col-span-full flex-1 flex justify-center items-center h-[10rem]'>
                        <h2 className="text-[6vw] sm:text-[1.5rem] font-semibold">{noDataDisplayMessage?noDataDisplayMessage:`No ${type} Available`}</h2>
                    </div>
                }
                </div>
            }
            {
                (isPaginationEnabled && totalPaginationPages && totalPaginationPages > 1)? (
                    <div className={`w-full`}>
                        {/* Horizontal line bar */}
                        <div className={`bg-light-font_color_dark dark:bg-dark-font_color_light h-[1px] w-full`}></div>
                        {/* Page Buttons - only for Paginated Data */}
                        <div className="flex flex-row justify-center items-center gap-2 py-4 px-2">
                        {
                            Array.from({length:totalPaginationPages},(_,index)=>(
                                <Button 
                                key={index+1}
                                className={`${activeButtonIndex===index?'bg-color-yellow text-light-font_color_dark':'bg-light-bg_light hover:bg-light-font_color_light text-light-font_color_dark hover:text-dark-font_color_light dark:bg-dark-btn1_color dark:hover:bg-light-bg_light hover:dark:text-light-font_color_dark dark:text-dark-font_color_light shadow-custom shadow-light-btn1_color rounded-lg dark:shadow-none'}`} 
                                onClick={()=>{handlePageButtonClick(index+1)}}
                                >{index+1}</Button>
                            ))
                        }
                        </div>
                    </div>
                ):''
            }
        </div>
    )
});

export default ListContainer