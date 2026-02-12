
const downloadFile = (fileUrl, fileName) => {
  const link = document.createElement("a");
  link.href = fileUrl;
  link.setAttribute("download", fileName || "file"); 
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
export const openFileinNewTab = (data) => {
  let fileUrl = null;
  console.log(data)
  if (data.FileBase64) {
    fileUrl = `data:${data.Type};base64,${data.FileBase64}`;
  } else if (data.SrcPath) {
    fileUrl = data.SrcPath;
  } else if (data.File instanceof File) {
    fileUrl = URL.createObjectURL(data.File);
  }
  if (!fileUrl) {
    console.error("No valid file URL found", data);
    return;
  }

  const newTab = window.open();
  if (!newTab) return;

  // Images
  if (data.Type.startsWith("image/")) {
    newTab.document.write(
      `<img src="${fileUrl}" style="max-width:100%;height:auto;" />`
    );
  }
  // PDF
  else if (data.Type === "application/pdf") {
    newTab.document.write(
      `<embed src="${fileUrl}" type="application/pdf" width="100%" height="100%" />`
    );
  }
  // TXT
  else if (
    data.Type === "text/plain" ||
    // data.Type === "text/csv" ||
    // data.Type === "application/csv" ||
    data.Type === "application/json" ||
    data.Type === "text/xml" ||
    data.Type === "application/xml"
  ) {
    fetch(fileUrl)
      .then((res) => res.text())
      .then((text) => {
        newTab.document.write(`<pre>${text}</pre>`);
      });
  }
  // Excel files (.xls, .xlsx)
  else if (
    data.Type === "application/vnd.ms-excel" ||
    data.Type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    newTab.document.write(`
    <iframe src="${fileUrl}" style="width:100%;height:100%;border:none;"></iframe>
  `);
  } else if (
    data.Type === "application/msword" ||
    data.Type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    newTab.document.write(`
    <iframe src="${fileUrl}" style="width:100%;height:100%;border:none;"></iframe>
  `);
  } else if (
    data.Type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const gviewUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
      fileUrl
    )}&embedded=true`;
    newTab.document.write(
      `<iframe src="${gviewUrl}" width="100%" height="100%" style="border:none;"></iframe>`
    );
  }
  // Other fallback
  else {
     downloadFile(fileUrl, data.FileName);
  }
};
