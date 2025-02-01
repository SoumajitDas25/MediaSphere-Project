import axios from "axios";

axios.defaults.baseURL = 'http://localhost:3000/api/v1';
axios.defaults.withCredentials = true; //allow all credentials
axios.defaults.validateStatus = ()=>true; //allow all statusCode
  
export default axios; //returns the configured axios