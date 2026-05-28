import {
  Home,
  Welcome,
  Login,
  Signup,
  Video,
  Tweet,
  PageNotFound,
  UserChannel,
  Playlist,
  MyPlaylist,
  WatchHistory,
  Connections,
  ManageContent
} from "../pages";
import {
  HomeIcon,
  SubscriptionIcon,
  DashboardIcon,
  ChannelIcon,
  HistoryIcon,
  PlaylistIcon,
  VideoIcon,
  TweetIcon,
  RegisterIcon,
  LoginIcon,
  ManageIcon,
} from "../assets/icons";
import { AuthLayout } from "../components";
import App from "../App";

const routeConfig = {
    path: "/",
    element: <App />,
    children: [
        {
            path: "/",
            element: (
                <AuthLayout authentication={true}>
                <Home />
                </AuthLayout>
            ),
            title: "Home",
            label: "Home", //text to be shown in sidebar
            auth: true, //only accessible to authenticated users
            showInSidebar: true,
            icon: <HomeIcon />, //icon to be shown in sidebar
        },
        {
            path: "/welcome",
            element: (
                <AuthLayout authentication={false}>
                    <Welcome />
                </AuthLayout>
            ),
            title: "Welcome",
            auth: false, //only accessible to unauthenticated users
            showInSidebar: false,
        },
        {
            path: "/login",
            element: (
                <AuthLayout authentication={false}>
                    <Login />
                </AuthLayout>
            ),
            title: "Login",
            label: "Login",
            auth: false,
            showInSidebar: true,
            icon: <LoginIcon />,
        },
        {
            path: "/signup",
            element: (
                <AuthLayout authentication={false}>
                    <Signup />
                </AuthLayout>
            ),
            title: "SignUp",
            label: "SignUp",
            auth: false,
            showInSidebar: true,
            icon: <RegisterIcon/>,
        },
        // {
        //     path: "/dashboard",
        //     // element: (
        //     //     <AuthLayout authentication={true}>
        //     //         <UserChannel/>
        //     //     </AuthLayout>
        //     // ),
        //     title: "Dashboard",
        //     label: "Dashbaord",
        //     auth: true,
        //     showInSidebar: true,
        //     icon: <DashboardIcon />,
        // },
        {
            path: "/connections",
            element: (
                <AuthLayout authentication={true}>
                    <Connections/>
                </AuthLayout>
            ),
            title: "Connections",
            label: "Connections",
            auth: true,
            showInSidebar: true,
            icon: <SubscriptionIcon />,
        },
        {
            path: "/channel/:username",
            element: (
                <AuthLayout authentication={true}>
                    <UserChannel/>
                </AuthLayout>
            ),
            title: "Channel",
            label: "My Channel",
            auth: true,
            showInSidebar: true,
            icon: <ChannelIcon />,
        },
        {
            path: "/watch-history",
            element: (
                <AuthLayout authentication={true}>
                    <WatchHistory />
                </AuthLayout>
            ),
            title: "WatchHistory",
            label: "Watch History",
            auth: true,
            showInSidebar: true,
            icon: <HistoryIcon />,
        },
        {
            path: "/playlist", //all playlists
            element: (
                <AuthLayout authentication={true}>
                    <MyPlaylist />
                </AuthLayout>
            ),
            title: "Playlists",
            label: "My Playlists",
            auth: true,
            showInSidebar: true,
            icon: <PlaylistIcon />,
        },
        {
            path: "/playlist/:playlistId", //specific playlist
            element: (
                <AuthLayout authentication={true}>
                    <Playlist />
                </AuthLayout>
            ),
            title: "Playlist",
            auth: true,
            showInSidebar: false,
        },
        // {
        //     path: "/video", //all videos
        //     element: (
        //         <AuthLayout authentication={true}>
        //             <Video />
        //         </AuthLayout>
        //     ),
        //     title: "Videos",
        //     label: "My Videos",
        //     auth: true,
        //     showInSidebar: true,
        //     icon: <VideoIcon />,
        // },
        {
            path: "/video/:videoId", //specific video
            element: (
                <AuthLayout authentication={true}>
                    <Video />
                </AuthLayout>
            ),
            title: "Video",
            auth: true,
            showInSidebar: false,
        },
        // {
        //     path: "/tweet", //all tweets
        //     // element: (

        //     // ),
        //     title: "Tweets",
        //     label: "My Tweets",
        //     auth: true,
        //     showInSidebar: true,
        //     icon: <TweetIcon />,
        // },
        {
            path: "/tweet/:tweetId", //specific tweet
            element: (
                <AuthLayout authentication={true}>
                    <Tweet />
                </AuthLayout>
            ),
            title: "Tweet",
            auth: true,
            showInSidebar: false,
        },
        {
            path: "/manage-content",
            element: (
                <AuthLayout authentication={true}>
                    <ManageContent />
                </AuthLayout>
            ),
            title: "Manage Content",
            label: "Manage Content",
            auth: true,
            showInSidebar: true,
            icon: <ManageIcon/>
        },
        {
            path: "/*",
            element: (
                <AuthLayout authentication={true}>
                    <PageNotFound />
                </AuthLayout>
            ),
            title: "PageNotFound",
            auth: true,
            showInSidebar: false,
        },
    ],
};

export default routeConfig;
