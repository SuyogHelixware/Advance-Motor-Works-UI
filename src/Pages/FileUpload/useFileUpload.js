import { useState } from "react";
import Swal from "sweetalert2";
import apiClient from "../../services/apiClient";
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const VALID_FILE_TYPES = [
  // MIME types
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/tiff",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/webp",
  "image/bmp",
  "image/gif",
  "image/svg+xml",
  "application/zip",
  "application/x-rar-compressed",
  "application/json",
  "application/xml",
  "text/xml",
  "image/vnd.dwg",
  "image/vnd.dxf",
];
const VALID_EXTENSIONS = [
  ".pdf",
  ".xls",
  ".xlsx",
  ".csv",
  ".doc",
  ".docx",
  ".txt",
  ".tiff",
  ".tif",
  ".jpg",
  ".jpeg",
  ".png",
  ".zip",
  ".rar",
  ".json",
  ".xml",
  ".dwg",
  ".dxf",
  ".heic",
  ".webp",
  ".bmp",
  ".gif",
  ".svg",
];

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
  });

export const useFileUpload = () => {
  const [fileData, setFileData] = useState([]);
  

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    
    console.log("Files", files);
    let invalidFiles = files.filter((file) => {
      const fileExt = "." + file.name.split(".").pop().toLowerCase();
      return (
        !VALID_FILE_TYPES.includes(file.type) &&
        !VALID_EXTENSIONS.includes(fileExt)
      );
    });

    if (invalidFiles.length > 0) {
      Swal.fire({
        position: "center",
        icon: "warning",
        showConfirmButton: false,
        timer: 4000,
        toast: true,
        title: `Invalid files: ${invalidFiles.map((f) => f.name).join(", ")}`,
        customClass: { popup: "custom-swal-popup" },
        showClass: {
          popup: `animate__animated animate__fadeInDown animate__faster`,
        },
        hideClass: {
          popup: `animate__animated animate__fadeOutUp animate__faster`,
        },
      });
      return;
    }
    console.log(invalidFiles)
    const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      Swal.fire({
        position: "center",
        icon: "warning",
        showConfirmButton: false,
        timer: 2000,
        toast: true,
        title: "File size must be less than 2 MB",
        customClass: { popup: "custom-swal-popup" },
        showClass: {
          popup: `animate__animated animate__fadeInDown animate__faster`,
        },
        hideClass: {
          popup: `animate__animated animate__fadeOutUp animate__faster`,
        },
      });
      return;
    }
    const updatedFileData = await Promise.all(
      files.map(async (file) => ({
        FileName: file.name,
        FileExt: file.name.split(".").pop(),
        Size: file.size,
        Type: file.type ,
        LastModified: file.lastModified,
        FileBase64: await toBase64(file),
        SrcPath: URL.createObjectURL(file),
        LineNum: "0",
        File: file,
      }))
    );
    setFileData((prev) => [...prev, ...updatedFileData]);
   event.target.value = null;
  };
  const setFilesFromApi = async (AttachEntry) => {
    try {
      const res = await apiClient.get(`/Attachment/GetById/${AttachEntry}`);
      const response = res.data;
      if (response.success === true) {
        const updatedLines = (response.values.AttachmentLines || []).map(
          (item) => {
            const FileName = item.Description;
            return {
              ...item,
              FileName: FileName,
              FileExt: item.FileExt,
              LineNum: item.LineNum,
              Size: item.size,
              Type: item.type,
              LastModified: item.lastModified,
              FileBase64: item.FileBase64,
              SrcPath: item.SrcPath,
              File: item.File,
            };
          }
        );
        setFileData(updatedLines);
      } else if (response.success === false) {
        setFileData([]);
        // Swal.fire({
        //   title: "Error!",
        //   text: response.message,
        //   icon: "warning",
        //   confirmButtonText: "Ok",
        // });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error,
        icon: "error",
        confirmButtonText: "Ok",
      });
    }

    // setFileData(formattedFiles);
  };

  const clearFiles = () => {
    setFileData([]);
  };

  const handleRemove = async (indexToRemove, LineNum, SaveUpdateName,setValue) => {
  // Show confirmation alert
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "Do you want to delete this attachment?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, cancel",
    reverseButtons: true,
  });

  
  if (result.isConfirmed) {
    try {
      setFileData((prev) => prev.filter((_, index) => index !== indexToRemove));
      if (SaveUpdateName === "UPDATE") {
        await apiClient.delete(`/Attachment/DeleteLineNum/${LineNum}`);
        // setValue("AttcEntry","0")
      }
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "The attachment has been deleted successfully.",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete the attachment.",
      });
      console.error("Delete error:", error);
    }
  } else {
    Swal.fire({
      icon: "info",
      title: "Cancelled",
      text: "Your attachment is safe.",
      timer: 1500,
      showConfirmButton: false,
      toast: true,
    });
  }
};

  return {
    fileData,
    handleFileChange,
    handleRemove,
    clearFiles,
    setFilesFromApi,
  };
};
