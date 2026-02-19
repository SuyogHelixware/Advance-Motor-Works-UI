import { Box, TextField, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { BeatLoader } from "react-spinners";

const AutoCompleteDropdown = ({
  value,
  options,
  onSelect,
  placeholder,
  field,
  control,
  rules = {},
  errors = {},
  name,
  require,
  itemTemplate,
  label,
  onInputChange,
  readOnly = false,
  onScrollEnd,
  loading = false,
  dropdownWidth,
  filterOptionsOverride = false,
  disableTyping = false,
  style = {},
}) => {
  const [inputValue, setInputValue] = useState("");

  const renderOption = (props, option, { index }) => {
    if (index === options.length - 1 && loading) {
      return (
        <li {...props} key={"loader"} style={{ justifyContent: "center" }}>
          <BeatLoader size={8} color="#555" />
        </li>
      );
    }

    return (
      <li {...props} key={option[field]}>
        {itemTemplate ? itemTemplate(option) : option[field]}
      </li>
    );
  };

  return (
    <Box style={{ width: "100%", ...style }}>
      {label && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Typography
            className="FieldLabel"
            style={{
              fontSize: 10,
              letterSpacing: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginBottom: 5,
            }}
          >
            {label}
          </Typography>
          {rules?.required && (
            <span
              style={{
                color: "red",
                fontSize: "1.1rem",
                lineHeight: 1,
                verticalAlign: "baseline",
                marginTop: "2px",
              }}
            >
              *
            </span>
          )}
        </div>
      )}
      <Controller
        rules={rules}
        require={require}
        name={name}
        control={control}
        render={({ field: controllerField }) => (
          <Autocomplete
            freeSolo={true}
            loadingText={<BeatLoader size={8} color="#555" />}
            forcePopupIcon={true}
            openOnFocus={false}
            loading={loading}
            className="form-control digits small-input"
            value={value}
            options={options}
            onChange={(event, newValue, reason) => {
              controllerField.onChange(newValue);
              onSelect?.(newValue);

              if (reason === "clear") {
                onSelect?.(null);
              }
            }}
            // sx={{
            //   "&.form-control": {
            //     padding: "0px !important",
            //   },
            //   "& .MuiOutlinedInput-root": {
            //     paddingRight: "8px",
            //     "& .MuiOutlinedInput-notchedOutline": {
            //       borderColor: "#ccc",
            //     },
            //     "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            //       borderColor: "#4b9eff",
            //       boxShadow: "0 0 0 4px #c2dbfe",
            //       borderWidth: "2px",
            //     },
            //   },
            //   "& .MuiInputBase-root": {
            //     height: 35,
            //     paddingLeft: 2,
            //   },
            // }}
            inputValue={inputValue}
            onInputChange={(event, newInputValue, reason) => {
              setInputValue(newInputValue);

              if (reason === "input") {
                onInputChange?.(event, newInputValue);
              }

              if (reason === "clear") {
                onInputChange?.(event, "");
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                if (!value || !value[field]) {
                  setInputValue("");
                  onInputChange?.(null, "");
                }
              }

              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
            getOptionLabel={(option) => option?.[field] || ""}
            isOptionEqualToValue={(option, val) =>
              option?.[field] === val?.[field]
            }
            renderOption={renderOption}
            renderInput={(params) => (
              <div className="autocomplete-wrapper">
                <TextField
                  {...params}
                  placeholder={placeholder || "Select"}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      display: "flex",
                      alignItems: "center",
                    },
                    "& input::placeholder": {
                      color: "#708090",
                      opacity: 1,
                      fontSize: 12,
                    },
                  }}
                  inputProps={{
                    ...params.inputProps,
                    readOnly: readOnly || disableTyping,
                  }}
                />
              </div>
            )}
            autoHighlight
            clearOnEscape
            readOnly={readOnly}
            disableClearable={readOnly || disableTyping}
            filterOptions={(options, { inputValue }) => {
              if (filterOptionsOverride) {
                return options;
              }

              return options.filter((option) =>
                Object.values(option)
                  .join(" ")
                  .toLowerCase()
                  .includes(inputValue.toLowerCase()),
              );
            }}
            slots={{
              paper: "div",
            }}
            slotProps={{
              paper: {
                style: {
                  width: dropdownWidth,
                  borderRadius: "7px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  marginTop: 5,
                  zIndex: 999,
                  maxWidth: "none",
                  overflowX: "visible",
                },
              },
            }}
            ListboxProps={{
              onScroll: (e) =>
                e.currentTarget.scrollTop + e.currentTarget.clientHeight >=
                  e.currentTarget.scrollHeight - 10 && onScrollEnd?.(),
            }}
          />
        )}
      />
      {errors?.[name] && (
        <small className="text-danger" style={{ fontSize: 12 }}>
          {errors[name]?.message}
        </small>
      )}
    </Box>
  );
};

export default AutoCompleteDropdown;

