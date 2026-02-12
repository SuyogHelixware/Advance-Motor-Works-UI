// src/components/DynamicLoader.jsx
import PropTypes from "prop-types";
import { lazy, Suspense } from "react";

const Loader = lazy(() => import("./Loader"));
const DynamicLoader = ({ open }) => {
  if (!open) return null;

  return (
    <Suspense
      fallback={
        <div
          style={{
            height: "100vh",
            width: "100vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            color: "#fff",
            fontSize: "18px",
            zIndex: 2000,
            position: "fixed",
            top: 0,
            left: 0,
          }}
        >
          Loading component...
        </div>
      }
    >
      <Loader open={open} />
    </Suspense>
  );
};


DynamicLoader.propTypes = {
  open: PropTypes.bool.isRequired,
};

export default DynamicLoader;
