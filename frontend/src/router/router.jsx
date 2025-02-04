import { createBrowserRouter } from "react-router-dom";
import {
    Home,
    Welcome,
    Login,
    Signup,
    Video,
    PageNotFound,
    UserChannel,
    Playlist
} from '../pages';
import { AuthLayout, Loader } from '../components'
import App from "../App";

const router = createBrowserRouter([
    {
      path: "/",
      element: <App/>,
      children: [
        {
          path: "/", //only accessible to authenticated users
          element: (
          <AuthLayout authentication={true}> 
            <Home/>    
          </AuthLayout>
        )
        },
        {
          path: "/welcome", //only accessible to unauthenticated users
          element: (
          <AuthLayout authentication={false}> 
            <Welcome/>  
          </AuthLayout>
          )
        },
        {
          path: "/login", //only accessible to unauthenticated users
          element: (
            <AuthLayout authentication={false}> 
              <Login/>    
            </AuthLayout>
          )
        },
        {
          path: "/signup",
          element: (
            <AuthLayout authentication={false}> 
              <Signup/>    
            </AuthLayout>
          )
        },
        {
          path: "/channel/:username",
          element: (
            <AuthLayout authentication={true}> 
              <UserChannel/>    
            </AuthLayout>
          )
        },
        {
          path: "/video",
          element: (
            <AuthLayout authentication={true}> 
              <Video/>    
            </AuthLayout>
          )
        },
        {
          path: "/playlist/:playlistId",
          element: (
            <AuthLayout authentication={true}> 
              <Playlist/>    
            </AuthLayout>
          )
        },
        {
          path: "/*",
          element: (
            <AuthLayout authentication={true}> 
              <PageNotFound/> 
            </AuthLayout>
          )
        }
      ]
    },
])

export default router;
  