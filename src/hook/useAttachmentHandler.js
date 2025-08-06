import { useState } from "react";

const useAttachmentHandler = () => {
  const [showModal, setShowModal] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("");

  // Handle opening the modal
  const handleAttachmentClick = (url,isPreview = true) => {
    console.log(url)
    if(isPreview){
      const fileExtension = url.split(".").pop().toLowerCase();
      setFileType(fileExtension === "pdf" ? "pdf" : "image");
      setFileUrl(url);
      setShowModal(true);
    }else{

    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFileUrl("");
  };


  const downloadFile = (url) => {
    const a = document.createElement("a");
    a.href = url;
   
    a.download = url.split("/").pop() || "download";
  
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  

  return {
    showModal,
    fileUrl,
    fileType,
    handleAttachmentClick,
    handleCloseModal,
    downloadFile
  };
};

export default useAttachmentHandler;
