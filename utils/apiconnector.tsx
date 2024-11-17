import axios from 'axios';

const axiosInstance = axios.create({
  baseURL:  'http://localhost:3000', 
  withCredentials: true,// Use your app's base URL
});
export const apiConnector = async (method: string, url: string, bodyData?: any, headers?: any, params?: any) => {
  try {
    const response = await axiosInstance({
      method,
      url,
      data: bodyData || null,
      headers: headers || null,
      params: params || null,
    });
    return response; // Ensure the full response is returned
  } catch (error:any) {
    if (error.response) {
      return error.response; // Return error response if available
    }
    throw error; // Throw if there's no response property
  }
};
