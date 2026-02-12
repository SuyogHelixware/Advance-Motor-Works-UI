import { Box, CircularProgress, Fade, Typography } from "@mui/material";
import PropTypes from "prop-types";

const Loader = ({ open }) => {
  if (!open) return null;

  return (
    <Fade in={open} timeout={500}>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        {/* Circular Progress */}
        <Box
          sx={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress
            size={100}
            thickness={4}
            sx={{
              color: "#270e45",
              animation: "spin 2s linear infinite",
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          />

          {/* Center Text */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              position: "absolute",
              fontWeight: 700,
              color: "#fff",
              animation: "pulse 1.5s ease-in-out infinite",
              letterSpacing: "1px",
              "@keyframes pulse": {
                "0%": { opacity: 0.6, transform: "scale(0.95)" },
                "50%": { opacity: 1, transform: "scale(1.05)" },
                "100%": { opacity: 0.6, transform: "scale(0.95)" },
              },
            }}
          >
            CELERIQ
          </Typography>
        </Box>

        {/* Subtext */}
        <Typography
          variant="body2"
          sx={{
            mt: 3,
            color: "#eee",
            letterSpacing: "0.5px",
            fontStyle: "italic",
          }}
        >
          Please wait, loading...
        </Typography>
      </Box>
    </Fade>
  );
};

Loader.propTypes = {
  open: PropTypes.bool.isRequired,
};

export default Loader;
