import React, { useState } from "react";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
import { useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";

const PhoneNumberInput = ({
  defaultCountry = "KW",
  onChange,
  value,
  onBlur,
  label = "Phone Number",
  error = false,
  helperText = "",
  resetFlag, // Add this prop (passed as DocEntry)
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const backgroundColor = isDarkMode ? "#262A45" : "#F5F6FA";
  const textColor = isDarkMode ? "#f0f0f0" : "#000";
  const borderColor = isDarkMode ? "#555" : "#c4c4c4";

  const [focused, setFocused] = useState(false);

  return (
    <Box
      sx={{
        width: "220px",
        position: "relative",
        margin: 1,
      }}
    >
      {isDarkMode && (
        <style>
          {`
            .country-list .country {
              background-color: #262A45 !important;
              color: #f0f0f0 !important;
            }
            .country-list .country:hover,
            .country-list .country:focus {
              background-color: transparent !important;
              border: 1px solid #ffffff !important;
              color: #f0f0f0 !important;
              box-sizing: border-box;
            }
            .country-list .country.highlight {
              background-color: transparent !important;
              border: 1px solid #ffffff !important;
              color: #f0f0f0 !important;
            }
          `}
        </style>
      )}
      <Typography
        sx={{
          position: "absolute",
          left: "12px",
          top: "-8px",
          fontSize: "12px",
          color: error
            ? theme.palette.error.main
            : focused
              ? theme.palette.primary.main
              : isDarkMode
                ? "#ccc"
                : "#555",
          backgroundColor: backgroundColor,
          px: "4px",
          transition: "all 0.2s",
          pointerEvents: "none",
        }}
      >
        {label}
      </Typography>

      <Box
        sx={{
          border: `1px solid ${
            error
              ? theme.palette.error.main
              : focused
                ? theme.palette.primary.main
                : borderColor
          }`,
          borderRadius: "4px",
          backgroundColor: backgroundColor,
          height: "40px",
          display: "flex",
          alignItems: "center",
          paddingLeft: "0px",
          paddingRight: "0px",
        }}
      >
        <PhoneInput
          key={resetFlag || "default"} // ⚡ Remount only on resetFlag change (e.g., new DocEntry/load). Stable during typing!
          country={defaultCountry} // defaultCountry like "in"
          value={value || ""}
          onChange={onChange}
          onBlur={onBlur}
          enableSearch={true}
          error={error}
          countryCodeEditable={false}
          containerStyle={{
            width: "100%",
            backgroundColor: "transparent",
            display: "flex",
            alignItems: "center",
          }}
          inputStyle={{
            width: "100%",
            height: "36px",
            fontSize: "14px",
            border: "none",
            backgroundColor: "transparent",
            color: textColor,
            outline: "none",
          }}
          buttonStyle={{
            border: "none",
            backgroundColor: "transparent",
            width: "50px",
            height: "40px",
            padding: 0,
          }}
          dropdownStyle={{
            textAlign: "left",
            fontSize: "14px",
            backgroundColor: backgroundColor,
            color: textColor,
            border: `1px solid ${borderColor}`,
          }}
          inputProps={{
            name: "phone",
            required: false,
            onFocus: () => setFocused(true),
            onBlur: () => setFocused(false),
            autoComplete: "off",
            placeholder: "",
          }}
        />
      </Box>
      {error && (
        <Typography variant="caption" color="error" sx={{ ml: 1 }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default PhoneNumberInput;
