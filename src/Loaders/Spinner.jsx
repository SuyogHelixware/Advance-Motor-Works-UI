import React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import "./Spinner.css";


const Spinner = ({ open }) => {
  return (
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={open}
    >
      <Box className="spinner">
        {[...Array(12)].map((_, index) => (
          <div key={index} className={`spinner-segment segment-${index + 1}`} />
        ))}
        <div className="loading-text">Loading...</div>
      </Box>
    </Backdrop>
  );
};

export default Spinner;
