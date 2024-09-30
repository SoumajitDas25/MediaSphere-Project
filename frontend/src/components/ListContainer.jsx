import React from 'react'
import {VideoCard} from '.'

const ListContainer = ({
    data,
    type='Video'
}) => {
    return (
        <div className="grid grid-cols-12 gap-[1rem] md:gap-[1.2vw] xl:gap-[1.5rem] xxl:w-[100rem] mx-auto flex-1 p-4">
        {
            data?
            (
                (type==='Video' &&
                data.map((video)=>(
                    <div key={video._id} className='col-span-full sm:col-span-10 sm:col-start-2 md:col-span-6 lg:col-span-4 aspect-w-5 aspect-h-[4.5] flex justify-center' onClick={()=>navigate('/video')}>
                        <VideoCard  {...video}/>
                  </div>
                ))) 
                ||
                (type==='Tweet' &&
                // data.map((item)=>{}))
                    <h1>Tweets</h1>)
                ||
                (type==='Playlist' && 
                // data.map((item)=>{}))
                    <h1>Playlists</h1>)
            )
            :
            <div className='col-span-full flex-1 flex justify-center items-center h-[10rem]'>
                <h2 className="text-[6vw] sm:text-[1.5rem] font-semibold">{`No ${type} Available `}</h2>
            </div>
        }
        </div>
    )
}

export default ListContainer