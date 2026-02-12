import Swal from "sweetalert2";
import apiClient from "../../services/apiClient";
const mimeTypes = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  heic: "image/heic",
  webp: "image/webp",
  bmp: "image/bmp",
  svg: "image/svg+xml",
  pdf: "application/pdf",
  zip: "application/zip",
  rar: "application/x-rar-compressed",
  json: "application/json",
  xml: "application/xml",
  txt: "text/plain",
  doc: "application/msword",
  csv: "text/csv",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

const downloadFile = (fileUrl, fileName) => {
  const link = document.createElement("a");
  link.href = fileUrl;
  link.setAttribute("download", fileName || "file");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const Base64FileinNewTab = async (
  DocEntry,
  LineNum,
  FileExt,
  Description
) => {
  try {
    const res = await apiClient.get(
      `/Attachment/GetById/${DocEntry}/${LineNum}`
    );
    const response = res.data;
    if (response.success !== true) {
      Swal.fire({
        title: "Error!",
        text: response.message || "Failed to fetch attachment",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }
    const FileBase64 = response.values;
    if (!FileBase64) {
      console.error("No file content found in API response");
      return;
    }
    const fileType =
      mimeTypes[FileExt.replace(/^\./, "").toLowerCase()] ||
      "application/octet-stream";
    const fileUrl = `data:${fileType};base64,${FileBase64}`;
    const newTab = window.open();
    if (!newTab) return;
    switch (fileType) {
      // Images
      case "image/jpeg":
      case "image/png":
      case "image/gif":
      case "image/heic":
      case "image/webp":
      case "image/bmp":
      case "image/svg+xml":
        newTab.document.write(
          `<img src="${fileUrl}" style="max-width:100%;height:auto;" />`
        );
        break;

      // PDF
      case "application/pdf":
        newTab.document.write(
          `<embed src="${fileUrl}" type="application/pdf" width="100%" height="100%" />`
        );
        break;

      // TXT → decode base64 safely
      case "text/plain":
      case "application/json":
      case "application/xml":
      case "text/xml": {
        try {
          const decodedText = atob(FileBase64); // decode base64 → plain text
          newTab.document.write(
            `<pre style="white-space: pre-wrap; word-wrap: break-word; font-family: monospace; padding: 10px;">${decodedText
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")}</pre>`
          );
        } catch (e) {
          newTab.document.write("<p>Unable to display text file.</p>");
        }

        break;
      }

      case "application/msword":
      case "text/csv":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      case "application/vnd.ms-excel":
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      case "application/zip":
      case "application/x-rar-compressed":
      case "application/x-7z-compressed":
      case "application/octet-stream":
        downloadFile(fileUrl, Description);
        break;

      // Fallback
      default:
        downloadFile(fileUrl, Description);
    }
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: error.message || "Unexpected error occurred",
      icon: "error",
      confirmButtonText: "Ok",
    });
  }
};
