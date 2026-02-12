// status.js
export function getStatus(statusCode) {
    switch (statusCode) {
      case "1":
        return "Open";
      case "0":
        return "Closed";
      case "3":
        return "Cancelled";
      default:
        return "Unknown";
    }
  }
  