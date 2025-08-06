import { useState } from "react";
import BasicProvider from "../services/basicProvider";
import { useSelector } from "react-redux";

const useApiRequest = () => {

  const [loading, setLoading] = useState(false);
  const auth_token = useSelector((state) => state.auth.auth_token); // adjust path based on your store
  const fetchData = async (
    url,
    navigate,
    method = "GET",
    data = null,

  ) => {
    setLoading(true);
    try {
      const provider = new BasicProvider(url, navigate, true,auth_token);
      const response =
        method === "GET"
          ? await provider.getRequest()
          : method === "POST"
            ? auth_token?await provider.getPostPutDelRequest(data):await provider.postRequest(data)
            :method === "PUT"
            ? auth_token?await provider.getPutDelRequest(data):await provider.postRequest(data)
            : method === "PATCH"
              ? await provider.patchRequest(data)
              : null;

      if (response?.status || response?.success) {
        return response;
      } else {
        return {response,message:"Email Or telegram Id already registered. Please try to login."};
      }
    } catch (err) {
      console.log(err)
      return err;
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  return { loading, setLoading, fetchData };
};

export default useApiRequest;
