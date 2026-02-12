import { Backdrop, Skeleton } from "@mui/material";
import React from "react";
import "./Loader.css";

const Loader = ({ open }) => {
  return (
    <Backdrop sx={{ color: "#fff", zIndex: 9999 }} open={open}>
      {/* <HashLoader color="white" /> */}
      <div className="loader">
        <div className="outer"></div>
        <div className="middle"></div>
        <div className="inner"></div>
      </div>
        {/* <video
        src="/loader-transparent.webm"
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: "150px",
          height: "150px",
          objectFit: "contain",
        }}
      /> */}
    </Backdrop>
  );
};

const SkeletonLoader = (props) => {
  return (
    <Skeleton
      variant="rounded"
      sx={{ my: 2, height: 50 }}
      animation="pulse"
    />
  );
};

export { Loader, SkeletonLoader };
