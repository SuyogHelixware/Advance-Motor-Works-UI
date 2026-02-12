import Swal from "sweetalert2";

export async function fetchPriceListData(apiClient, itemCodes, priceList) {
  try {
    const response = await apiClient.post("/ItemsV2/GetPriceListByItemCode", {
      ItemCodes: itemCodes,
      PriceList: [priceList],
    });

    if (response.data.success) {
      return response.data.values || [];
    } else {
      Swal.fire({
        text: response.data.message,
        icon: "warning",
        confirmButtonText: "OK",
      });
      return [];
    }
  } catch (error) {
    console.error("Price API failed:", error);
    Swal.fire({
      title: "Error!",
      text: "Failed to fetch price list.",
      icon: "error",
      confirmButtonText: "OK",
    });
    return [];
  }
}
