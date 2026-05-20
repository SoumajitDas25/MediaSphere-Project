import { useRef } from 'react'
import { Heading, ListContainer } from '../components'
import { playlistAPI } from '../api' 
import { useSelector } from 'react-redux';
import { useSyncEvents } from '../events/hooks';

const MyPlaylist = () => {

  const {getAllUserPlaylists} = playlistAPI;
  const userId = useSelector(state=>state.user.user?._id);
  const listRef = useRef(null);

  //sync event for reloading playlist 
  useSyncEvents({
    domain:'user',
    id:userId?userId:null,
    publicHandlers:{
      onReload: ({source,value})=>{
        if(source === 'playlistlist')
        {
          console.log(value);
          listRef.current.reload(value);
        }
      }
    }
  });

  const fetchPlaylists = async (pageIndex = 1, limit = 6) =>{
    try
    {
      //get all user playlists
      const response = await getAllUserPlaylists(userId,pageIndex,limit);
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

  return (
    <div>
      <Heading className='py-2'>My Playlists</Heading>

      {/* Playlist List */}
      {
        userId && 
        <ListContainer 
        type="playlist" 
        isPaginationEnabled={true}  
        fetchPaginatedData={fetchPlaylists}
        dataLimitPerPage={6}
        ref={listRef}
        allowDelayLoad={true}
        delayLoadDurationInMs={700}
        />
      }
    </div> 
  )
}

export default MyPlaylist