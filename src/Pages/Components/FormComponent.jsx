import React, { forwardRef } from 'react';
import { TextField as MuiTextField } from '@mui/material';

// Use React.forwardRef to forward refs properly
const FormComponent = forwardRef(({ label, type, error, helperText,value, ...props }, ref) => {
  return (
    <MuiTextField
      label={label}
      type={type}
      value={value}
      error={error}
      helperText={helperText}
      {...props}
      ref={ref}  // Forward the ref to the MUI TextField
      size="small"
      sx={{ width: "100%", maxWidth: 220 }}
    />
  );
});

// Display name for debugging purposes
FormComponent.displayName = 'FormComponent';

export default FormComponent;

;
