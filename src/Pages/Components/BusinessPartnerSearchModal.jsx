import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Typography, useTheme } from "@mui/material";
import { BeatLoader } from "react-spinners";
import SearchModel from "./SearchModel"; // Assuming you have a base modal component
import CardComponent from "./CardComponent";

const BusinessPartnerSearchModal = ({
  open,
  onClose,
  onCancel,
  onChange,
  value,
  onClickClear,
  data = [],
  fetchMore,
  hasMore,
  onSelect,
}) => {
  const theme = useTheme();

  return (
    <SearchModel
      open={open}
      onClose={onClose}
      onCancel={onCancel}
      title="Select CUSTOMER/Supplier"
      onChange={onChange}
      value={value}
      onClickClear={onClickClear}
      cardData={
        <InfiniteScroll
          style={{ textAlign: "center", justifyContent: "center" }}
          dataLength={data.length}
          next={fetchMore}
          hasMore={hasMore}
          loader={
            <BeatLoader
              color={theme.palette.mode === "light" ? "black" : "white"}
            />
          }
          scrollableTarget="getListForCreateScroll"
          endMessage={<Typography textAlign="center">No More Records</Typography>}
        >
          {data.map((item) => (
            <CardComponent
              key={item.DocEntry}
              title={item.CardCode}
              subtitle={item.CardName}
              description={item.Cellular}
              searchResult={value}
              onClick={() => onSelect(item)}
            />
          ))}
        </InfiniteScroll>
      }
    />
  );
};

export default BusinessPartnerSearchModal;
