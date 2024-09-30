import React from "react";
import { Loader, LoginForm } from "../components";
import {  useSelector } from "react-redux";

const Login = () => {
  
  // const isloading = useSelector((state) => state.auth.loading);

  return (
    <div className="flex justify-center items-center flex-1">
      {/* {isloading ? <Loader /> : null} */}
      <LoginForm/> 
    </div>
  );
};

export default Login;
