import toast from "react-hot-toast";

// const importAll = (r) => {
//   let images = {};
//   r.keys().map((item) => {
//     return images[item.replace("./", "")] = r(item);
//   });
//   return images;
// };

// export const images = importAll(require.context("../assest/images", false));
// export const Icons = importAll(require.context("../assest/images/icons", false));
export const toastLoading = "Loading..."
export const resolveTime = 1000
const baseUrl = import.meta.env.VITE_BASE_URL;

export const getHeader = () => {

  const config = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
  };
  return config;
};



  
export const successMsgStyle = {
  id: "",
  position: "top-center",
  loading: true,
  style: {
    padding: "9px",
    background:
      "linear-gradient(321deg, rgb(73 223 13 / 86%) 34%, rgb(6, 217, 14) 68%, rgb(76, 217, 6) 82%)",
    color: "#fff",

    fontSize: "14px",
    fontWeight: "600",
    // width: "20%",
  },
  iconTheme: {
    primary: "#FFF",
    secondary: "#4a8d00",
  },
};

export const errorMsgStyle = {
  id: "",
  position: "top-center",
  loading: true,
  style: {
    padding: "9px",
    background:
      "linear-gradient(321deg, rgb(255 0 0 / 86%) 34%, rgb(255 0 0) 68%, rgb(255 0 0) 82%)",
    color: "#fff",

    fontSize: "14px",
    fontWeight: "600",
    width: "20%",
  },
  iconTheme: {
    primary: "#FFF",
    secondary: "#ff0101",
  },
};

export const warningMsgStyle = {
  id: "",
  position: "top-center",
  loading: true,
  style: {
    padding: "9px",
    background:
      "linear-gradient(321deg, rgb(255 141 0 / 86%) 34%, rgb(255 153 0) 68%, rgb(255 165 0) 82%)",
    color: "#fff",

    fontSize: "14px",
    fontWeight: "600",
    width: "20%",
  },
  iconTheme: {
    primary: "#FFF",
    secondary: "#ff8201",
  },
};


//   Show Success message
export const successMsg = async (msg) => {
  const loadingToast = toast.loading(toastLoading, successMsgStyle);
  successMsgStyle.id = loadingToast;
  await new Promise((resolve) => {
    setTimeout(resolve, resolveTime);
  });
  toast.success(msg, successMsgStyle);
};

// Show error message
export const errorMsg = async (msg) => {
  const loadingToast = toast.loading(toastLoading, errorMsgStyle);
  errorMsgStyle.id = loadingToast;
  await new Promise((resolve) => setTimeout(resolve, resolveTime));
  toast.error(msg, errorMsgStyle);
};

// Show Warning message
export const warningMsg = async (msg) => {
  toast.success(msg, warningMsgStyle);
};



export const handleCatchErrors = (error, navigate, rejectWithValue, path) => {

 
  if (error.code === "ERR_NETWORK") {
    // Handle network-related errors
    if (rejectWithValue) {
      navigate(`${baseUrl}`);
      return rejectWithValue(error.message);
    }
  } else {
    const { status, data } = error.response || {}; // Ensure the response is not undefined
  
    if (error.response !== undefined) {
      switch (status) {
        case 403:
          // Unauthorized - Remove access token and refresh token from sessionStorage
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("refreshToken");

          // Navigate to login or the path provided
          if (path === "inquiry") {
            navigate(`${baseUrl}`); // Redirect to home or login page
          } else {
            errorMsg("User Unauthorized");
            navigate(path || `${baseUrl}`);
          }
          break;

        case 402:
          // Payment Required (e.g., subscription issue)
          if (data.message) {
            errorMsg(data.message);
          }
          break;

        case 400:

        if (data.message) {
          errorMsg(data.message);
        }
        break;
          
        case 404:
          // Bad Request / Not Found
          if (data.message) {
            errorMsg(data.message);
          }
          break;
          case 422:
            // Bad Request / Not Found
            if (data.message) {
              errorMsg(data.message);
            }
            break;

        case 500:
          // Internal Server Error
          if (data.message) {
            errorMsg(data.message);
          }
          break;

        default:
          // Handle unknown error status
          navigate(`${baseUrl}`);
      }
    }
  }
};