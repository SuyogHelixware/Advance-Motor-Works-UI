import {
    Autocomplete,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormHelperText,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    TextField,
  } from "@mui/material";
  import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
  import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
  
  import React, { forwardRef } from "react";
  import SearchIcon from "@mui/icons-material/Search";
  import { Controller } from "react-hook-form";
  // import { wait } from "@testing-library/user-event/dist/utils";
  
  export function InputFields(props) {
    return (
      <>
        <TextField
          // required
          id={props.id}
          name={props.name}
          label={props.label}
          value={props.value}
          onChange={props.onChange}
          size="small"
          sx={{ width: "100%", maxWidth: 220 }}
          InputProps={{ readOnly: props.readOnly }}
          disabled={props.disabled}
        />
      </>
    );
  }
  export function SmallInputFields(props) {
    return (
      <>
        <TextField
          // required
          id={props.name}
          name={props.name}
          label={props.label}
          onChange={props.onChange}
          value={props.value}
          size="small"
          type={props.type}
          multiline={props.multiline}
          rows={props.rows}
          onWheel={(e) => e.target.blur()}
          InputProps={{
            inputProps: {
              min: 0,
              step: 0.001,
              readOnly: props.disabled,
            },
          }}
          sx={{
            m: 1,
            minWidth: 123,
            maxWidth: 133,
            "& .MuiInputBase-root": {
              WebkitAppearance: "none",
            },
            "& .MuiInputBase-input,": {
              textAlign: "end",
  
              "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                WebkitAppearance: "none",
              },
            },
          }}
        />
      </>
    );
  }
  export function InputTextAreaFields(props) {
    return (
      <>
        <TextField
          // required
          id={props.id}
          name={props.id}
          label={props.label}
          value={props.value}
          onChange={props.onChange}
          size="small"
          multiline
          rows={props.rows || 2}
          sx={{ m: 1, width: "100%", maxWidth: 220 }}
        />
      </>
    );
  }
  
  export function InputNumberFields(props) {
    return (
      <>
        <TextField
          // required
          id={props.name}
          name={props.name}
          type="number"
          label={props.label}
          value={props.value}
          size="small"
          sx={{ m: 1, width: "100%", maxWidth: 220 }}
        />
      </>
    );
  }
  export function InputTableTextField(props) {
    return (
      <>
        <TextField
          id={props.id}
          name={props.id}
          value={props.value}
          type={"number"}
          onWheel={(e) => e.target.blur()}
          onKeyUp={props.onKeyUp}
          onChange={props.onChange}
          //disabled={props.disabled}
          InputProps={{
            style: {
              height: "30px",
              margin: 0,
              minWidth: "60px",
              maxWidth: "70px",
            },
            inputProps: {
              readOnly: props.disabled,
              min: props.min,
              tabIndex: props.tabIndex,
            },
            endAdornment: props.endAdornment,
          }}
          sx={{
            backgroundColor: "unset",
            "& .MuiInputBase-root": {
              padding: 0,
              margin: 0,
              WebkitAppearance: "none",
            },
            "& .MuiInputBase-input,": {
              px: 1,
              py: 0,
              textAlign: "end",
              backgroundColor: "unset",
              "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                WebkitAppearance: "none",
              },
              fontSize: "13px",
              fontWeight: "bold",
            },
          }}
        />
      </>
    );
  }
  export function InputSelectFields(props) {
    return (
      <>
        <FormControl sx={{ m: 1, width: "100%", maxWidth: 220 }} size="small">
          <InputLabel id="demo-select-small-label">{props.label}</InputLabel>
          <Select
            labelId="demo-select-small-label"
            id="demo-select-small"
            name={props.name}
            value={props.value}
            label={props.label}
            onChange={props.onChange}
            disabled={true}
            size="small"
            sx={{ width: "100%", maxWidth: 220 }}
          >
            {props.data.map((data) => (
              <MenuItem key={data.key} value={data.key}>
                {data.value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </>
    );
  }
  export function InputTableSelectField(props) {
    return (
      <>
        <FormControl
          sx={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            maxWidth: 220,
          }}
          size="small"
        >
          <InputLabel id="demo-select-small-label">{props.label}</InputLabel>
          <Select
            labelId="demo-select-small-label"
            id="demo-select-small"
            name={props.name}
            value={props.value}
            label={props.label}
            onChange={props.onChange}
            size="small"
            // sx={{ width: "100%", maxWidth: 220 }}
            sx={{
              height: "30px",
              minWidth: 120,
              maxWidth: 120,
              "& .MuiInputBase-input,": {
                fontSize: 11,
                fontWeight: "bold",
              },
            }}
          >
            {props.data.map((data) => (
              <MenuItem key={data.key} value={data.value}>
                {data.value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </>
    );
  }
  export function InputDatePickerFields(props) {
    return (
      <>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            disablePast={props.disablePast}
            id={props.name}
            name={props.name}
            label={props.label}
            value={props.value}
            onChange={props.onChange}
            format="DD-MM-YYYY"
            readOnly={props.disabled}
            sx={{ m: 0, width: "100%", maxWidth: 220 }}
            slotProps={{
              textField: {
                size: "small",
                required: true,
                readOnly: props.readOnly,
              },
            }}
          />
        </LocalizationProvider>
      </>
    );
  }
  
  export function StatusCheckboxInputs(props) {
    return (
      <>
        <FormControlLabel
          sx={{
            "& .MuiTypography-root": {
              // fontSize: "15px",
            },
          }}
          control={
            <Checkbox
              id={props.id}
              name={props.id}
              size="small"
              checked={props.checked}
              onChange={props.onChange}
              disabled={props.disabled}
              onClick={props.onClick}
              sx={
                {
                  // fontFamily: (theme) => theme.fontFamily,
                  // paddingRight: 1,
                  // m: 1,
                }
              }
            />
          }
          label={props.label}
        />
      </>
    );
  }
  
  export function InputTextSearchButton(props) {
    return (
      <TextField
        required={props.required}
        size="small"
        onChange={props.onChange}
        id={props.id}
        name={props.id}
        value={props.value}
        label={props.label}
        autoFocus
        placeholder="Search ..."
        sx={{ m: 1, width: "100%", maxWidth: 220 }}
        InputProps={{
          readOnly: props.disabled,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                color="primary"
                onClick={props.onClick}
                disabled={props.disabled}
              >
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    );
  }
  export function InputSearchButton(props) {
    return (
      <TextField
        size="small"
        id={props.id}
        value={props.value}
        placeholder="Search ..."
        sx={{ m: 1, width: "100%", maxWidth: 250 }}
        InputProps={{
          readOnly: props.disabled,
          endAdornment: (
            <InputAdornment sx={{ mr: "400px" }}>
              <IconButton
                color="default"
                onClick={props.onClick}
                disabled={props.disabled}
                sx={{ color: "black" }}
              >
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    );
  }
  
  export const InputTextSearchField = forwardRef(
    ({ label, type, error, onClick, helperText, value, ...props }, ref) => {
      return (
        <>
          <TextField
            label={label}
            type={type}
            value={value}
            size="small"
            error={error}
            helperText={helperText}
            {...props}
            autoFocus
            placeholder="Search ..."
            sx={{ m: 1, width: "100%", maxWidth: 220 }}
            InputProps={{
              readOnly: props.disabled,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    color="primary"
                    onClick={onClick}
                    disabled={props.disabled}
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </>
      );
    }
  );
  
  export const InputTextField = forwardRef(
    (
      { label, type, error, helperText, value, name, readOnly, ...props },
      ref
    ) => {
      return (
        <>
          <TextField
            label={label}
            type={type}
            value={value}
            name={name}
            size="small"
            error={error}
            readOnly={readOnly}
            helperText={helperText}
            {...props}
            sx={{ width: "100%", maxWidth: 220 ,...(props?.sx || {}) }}
          />
        </>
      );
    }
  );
  
  export const SmallInputTextField = forwardRef(
    ({ label, type, error, helperText, value, readOnly, ...props }, ref) => {
      return (
        <>
          <TextField
            label={label}
            type={type}
            value={value}
            size="small"
            error={error}
            readOnly={readOnly}
            helperText={helperText}
            {...props}
            // id={props.name}
            // name={props.name}
            // onChange={props.onChange}
            // multiline={props.multiline}
            // rows={props.rows}
            onWheel={(e) => e.target.blur()}
            InputProps={{
              inputProps: {
                min: 0,
                step: 0.001,
                readOnly: props.disabled,
              },
            }}
            sx={{
              m: 1,
              minWidth: 123,
              maxWidth: 133,
              "& .MuiInputBase-root": {
                WebkitAppearance: "none",
              },
              "& .MuiInputBase-input,": {
                textAlign: "end",
    
                "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                  WebkitAppearance: "none",
                },
              },
            }}
          />
        </>
      );
    }
  );
  
  export const InputTextArea = forwardRef(
    ({ label, type, error, helperText, value, ...props }, ref) => {
      return (
        <>
          <TextField
            size="small"
            multiline
            rows={props.rows || 2}
            sx={{ m: 1, width: "100%", maxWidth: 220 }}
            label={label}
            type={type}
            value={value}
            error={error}
            helperText={helperText}
            {...props}
          />
        </>
      );
    }
  );
  
  export const InputSelectTextField = forwardRef(
    ({ label, error, data, helperText, value, name, ...props }, ref) => {
      return (
        <FormControl
          sx={{ m: 1, width: "100%", maxWidth: 220 }}
          size="small"
          error={error}
          ref={ref}
          {...props}
        >
          <InputLabel id="demo-select-small-label">{label}</InputLabel>
          <Select
            label={label}
            name={name}
            value={value}
            size="small"
            error={error}
            {...props}
          >
            {data.map((item) => (
              <MenuItem key={item.key} value={item.key}>
                {item.value}
              </MenuItem>
            ))}
          </Select>
          {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      );
    }
  );
  export const InputDatePickerField = forwardRef(
    (
      { label, error, helperText, onChange, value, disabled, readOnly, ...props },
      ref
    ) => {
      return (
        <FormControl size="small" error={error} {...props}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              disablePast={props.disablePast}
              id={props.name}
              name={props.name}
              label={label}
              value={value}
              onChange={(newValue) => {
                onChange(newValue ? newValue.toISOString : undefined);
              }}
              format="DD-MM-YYYY"
              readOnly={disabled || readOnly}
              sx={{ m: 1, width: "100%", maxWidth: 220 }}
              slotProps={{
                textField: {
                  size: "small",
                  required: true,
                  readOnly: disabled || readOnly,
                  inputRef: ref,
                },
              }}
            />
          </LocalizationProvider>
          {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      );
    }
  );
  
  export const RadioButtonsField = forwardRef(
    ({ control, name, label, data }, ref) => {
      return (
        <FormControl component="fieldset">
          <Controller
            name={name}
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <RadioGroup
                row
                onChange={onChange}
                sx={{ m: 1 }}
                onBlur={onBlur}
                value={value}
                ref={ref}
              >
                {data.map((radio) => (
                  <FormControlLabel
                    key={radio.value}
                    value={radio.value}
                    control={<Radio size="small" />}
                    label={radio.label}
                  />
                ))}
              </RadioGroup>
            )}
          />
        </FormControl>
      );
    }
  );
  
export const AutomCompleteField = forwardRef(
  (
    {
      options = [],
      value,
      onChange,
      label,
      error,
      helperText,
      onInputChange,
      onScrollBottom,
    },
    ref
  ) => {
    const getOptionLabel = (option) => {
      if (typeof option === "string") return option;
      return option?.Location || option?.Name || "";
    };

    return (
      <Autocomplete
        ref={ref}
        options={options}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={(option, val) =>
          option?.DocEntry === val?.DocEntry
        }
        value={
          options.find((opt) => opt?.DocEntry === value?.DocEntry) || value || null
        }
        onChange={(_, newValue) => {
          onChange(newValue);
        }}
        onInputChange={(_, inputValue) => {
          onInputChange?.(inputValue);
        }}
        ListboxProps={{
          onScroll: (event) => {
            const listboxNode = event.currentTarget;
            if (
              listboxNode.scrollTop + listboxNode.clientHeight >=
              listboxNode.scrollHeight - 1
            ) {
              onScrollBottom?.();
            }
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            error={!!error}
            helperText={helperText}
            sx={{ m: 1, width: "100%", maxWidth: 220 }}
            size="small"
          />
        )}
      />
    );
  }
);







  export function InputSelect({ label, name, value, onChange, data, disabled }) {
    return (
      <FormControl   sx={{ m: 1, width: "100%", maxWidth: 220 }}
      size="small"
      >
        <Autocomplete
          id={name}
          options={data}
          getOptionLabel={(option) => option.value} // assuming 'value' is what you want to display
          value={data.find((option) => option.key === value) || null} // Find object by 'key'
          onChange={(event, newValue) => {
            // If a new option is selected, pass the 'key' of that option
            onChange(event, newValue ? newValue.key : '');
          }}
          disableClearable
          disablePortal
          isOptionEqualToValue={(option, value) => option.key === value} // Ensures equality check by 'key'
          renderInput={(params) => <TextField {...params} label={label} variant="outlined" />}
          disabled={disabled}
          size="small"
        />
      </FormControl>
    );
  }