import { useState } from "react";

const useFileHandler = (initialFiles = []) => {
  const [files, setFiles] = useState(initialFiles);

  const handleFileChange = (e, field) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...uploadedFiles]);
  };

  const handleFileRemove = (index, field) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return { files, handleFileChange, handleFileRemove };
};

export default useFileHandler;
