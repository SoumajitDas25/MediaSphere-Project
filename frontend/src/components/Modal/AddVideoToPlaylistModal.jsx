import { Modal,Button,ListContainer,PlaylistCard2 } from "..";
import {PlusIcon} from "../../assets/icons";
import {playlistAPI} from "../../api"
import { useSelector } from "react-redux";

const AddVideoToPlaylistModal = ({
  videoId = null,
  setIsModalOpened = null,
  setIsCreatePlaylistModalOpened = null
}) => {

  const userId = useSelector(state=>state.user.user?._id);

  const {getAllUserPlaylists} = playlistAPI;

  const fetchUserPlaylists = async (page=1,limit=5) =>{
    try
    {
      const response = await getAllUserPlaylists(userId,page,limit,videoId);
      console.log(response.data.data);
      return response.data.data;
    }
    catch(err)
    {
      console.log(err);
      return null;
    }
  }
  
  return (
    <Modal 
    className="w-[90%] max-w-5xl" 
    heading="Add Video To Playlist" 
    setIsModalOpened={setIsModalOpened}
    >
      <div className="mx-auto flex w-full flex-col max-h-[80vh]">

        <div className="flex flex-col overflow-hidden">

          <div className="text-center text-[1rem] px-2 py-4">
          Add/Remove the video from playlist 
          </div>

          <div className="overflow-y-auto bg-light-bg_light dark:bg-dark-bg_light">
            <ListContainer 
            type='Playlist'
            isPaginationEnabled={true}
            fetchPaginatedData={fetchUserPlaylists}
            allowDelayLoad={true}
            delayLoadDurationInMs={700}
            viewType="Grid"
            renderCustomItem={(item)=>(
                <div key={item._id} className={`col-span-full md:col-span-6 lg:col-span-4 md:flex md:justify-center shadow-custom shadow-light-btn1_color rounded-lg`}>
                  <PlaylistCard2 
                  data={item}
                  viewType="Grid"
                  videoId={videoId} 
                  enableOptions={true}
                  enabledOptions={{
                    videoAdditionOrDeletionOption:true
                  }}
                  />
                </div>
              )}
            />
          </div>

          <div className="flex flex-row justify-center md:justify-end p-4">
            <Button 
            onClick={()=>{
              setIsCreatePlaylistModalOpened(true);
              setIsModalOpened(false);
            }}
            >
              <span className="flex flex-row gap-1 justify-center items-center">
                <span className='text-[1.5rem]'>
                  <PlusIcon/>
                </span>
                Create New Playlist
              </span>
            </Button>
          </div>

        </div>  

        <div className="flex justify-center gap-2 border-t border-dark-bg_light dark:border-light-bg_light p-4">

          <Button 
          onClick={()=>setIsModalOpened(false)}
          >
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddVideoToPlaylistModal;
