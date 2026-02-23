import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import TableViewIcon from "@mui/icons-material/TableView";
import ViewListIcon from "@mui/icons-material/ViewList";
import {
  Autocomplete,
  Box,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemText,
  Menu,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TableCell,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  DatePicker,
  LocalizationProvider,
  TimePicker as MuiTimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "antd";
import React, { forwardRef, useEffect, useMemo, useState } from "react";

import SearchIcon from "@mui/icons-material/Search";
import dayjs from "dayjs";
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
        error={props.error}
        helperText={props.helperText}
        onChange={props.onChange}
        size="small"
        sx={{ width: "100%", maxWidth: 220 }}
        InputProps={{ readOnly: props.readOnly }}
        InputLabelProps={{ shrink: !!props.value }}
        disabled={props.disabled}
        placeholder={props.placeholder}
      />
    </>
  );
}
export const SmallInputSelectTextField = forwardRef(
  (
    {
      label,
      error,
      data,
      helperText,
      value,
      name,
      onChange,
      disabled,
      ...props
    },
    ref,
  ) => {
    const menuProps = {
      PaperProps: {
        sx: {
          maxWidth: 220, // dropdown width
        },
      },
      MenuListProps: {
        sx: {
          maxHeight: 200, // scroll height of menu list
        },
      },
    };
    return (
      <FormControl
        sx={{
          width: "100%",
          m: 1,

          minWidth: 130,

          maxWidth: 133,
        }}
        size="small"
        error={error}
        ref={ref}
        {...props}
        disabled={disabled}
      >
        <InputLabel id="demo-select-small-label">{label}</InputLabel>

        <Select
          label={label}
          name={name}
          value={value}
          onChange={onChange} // Ensure onChange is passed here
          size="small"
          error={error}
          {...props}
          disabled={disabled}
          MenuProps={menuProps}
        >
          {data.map((item) => (
            <MenuItem key={item.key} value={item.key} sx={{ minHeight: 200 }}>
              {item.value}
            </MenuItem>
          ))}
        </Select>

        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  },
);

// export const TableNumberInput = ({
//   value,
//   rowId,
//   onChange,
//   min = 0,
//   width = 200,
//   height = 100,
// }) => {
//   return (
//     <TableCell sx={{ width }}>
//       <TextField
//         type="number"
//         size="small"
//         value={value ?? ""}
//         onChange={(e) => onChange(rowId, Number(e.target.value))}
//         onWheel={(e) => e.target.blur()}
//         inputProps={{ min }}
//         sx={{
//           width: "100%",
//           "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
//             {
//               display: "none",
//             },
//           "& input[type=number]": {
//             MozAppearance: "textfield",
//           },
//         }}
//       />
//     </TableCell>
//   );
// };
export const TableNumberInput = ({ value, rowId, onChange, min = 0 }) => {
  return (
    <TextField
      type="number"
      size="small"
      value={value ?? ""}
      onChange={(e) => onChange(rowId, Number(e.target.value))}
      onWheel={(e) => e.target.blur()}
      inputProps={{ min }}
      sx={{
        width: "70px",
        "& input": {
          textAlign: "lef", // ✅ center number inside input
        },
        "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
          {
            display: "none",
          },
        "& input[type=number]": {
          MozAppearance: "textfield",
        },
      }}
    />
  );
};

// export const SmallInputFields = forwardRef((props, ref) => {
//   return (
//     <TextField
//       id={props.name}
//       name={props.name}
//       label={props.label}
//       onChange={props.onChange}
//       value={props.value}
//       size="small"
//       type={props.type}
//       multiline={props.multiline}
//       rows={props.rows}
//       inputRef={ref}
//       onWheel={(e) => e.target.blur()}
//       InputProps={{
//         inputProps: {
//           min: 0,
//           step: 0.001,
//           readOnly: props.disabled,
//         },
//       }}
//       sx={{
//         m: 1,
//         minWidth: 123,
//         maxWidth: 133,
//         "& .MuiInputBase-root": {
//           WebkitAppearance: "none",
//         },
//         "& .MuiInputBase-input": {
//           textAlign: "left",
//           "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
//             WebkitAppearance: "none",
//           },
//         },
//       }}
//     />
//   );
// });

// export const SmallInputFields = ({
//   name,
//   control,
//   label,
//   width = 150,
//   readOnly = false,
//   onChange,
// }) => {
//   if (!control) return null;

//   return (
//     <Controller
//       name={name}
//       defaultValue={0}
//       control={control}
//       render={({ field }) => (
//         <TextField
//           {...field}
//           label={label}
//           size="small"
//           InputProps={{ readOnly }}
//           InputLabelProps={{ shrink: true }}
//           sx={{ width }}
//         />
//       )}
//     />
//   );
// };

export const InputsmallFilds = forwardRef(
  (
    {
      label,
      type,
      error,
      helperText,
      readOnly,
      disabled,
      inputProps,
      sx,
      ...props
    },
    ref,
  ) => {
    return (
      <TextField
        id={props.name}
        name={props.name}
        label={label}
        type={type}
        error={!!error}
        helperText={helperText}
        onChange={props.onChange}
        value={props.value}
        size="small"
        multiline={props.multiline}
        rows={props.rows}
        inputRef={ref}
        onWheel={(e) => e.target.blur()}
        inputProps={{
          ...inputProps,
          readOnly,
          disabled,
        }}
        sx={{
          m: 1,
          minWidth: 123,
          maxWidth: 133,
          "& .MuiInputBase-root": {
            WebkitAppearance: "none",
          },
          "& .MuiInputBase-input": {
            textAlign: "left",
            "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
              WebkitAppearance: "none",
            },
          },
        }}
      />
    );
  },
);

export const SmallInputFields = ({
  name,
  control,
  label,
  width = 150,
  readOnly = false,
  onChange,
}) => {
  if (!control) return null;

  return (
    <Controller
      name={name}
      defaultValue={0}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          label={label}
          type="number"
          size="small"
          InputProps={{ readOnly }}
          onWheel={(e) => e.target.blur()}
          InputLabelProps={{ shrink: true }}
          onChange={(e) => {
            field.onChange(e);
            if (onChange) {
              onChange(e);
            }
          }}
          sx={{
            width,
            "& .MuiInputBase-root": {
              WebkitAppearance: "none",
            },
            "& .MuiInputBase-input": {
              textAlign: "left",
              "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                WebkitAppearance: "none",
              },
            },
          }}
        />
      )}
    />
  );
};

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
        error={props.error}
        helperText={props.helperText}
        inputProps={props.inputProps}
        InputProps={{ readOnly: props.readOnly }}
        // size="small"
        // multiline
        // rows={props.rows || 2}
        sx={{ width: "100%", maxWidth: 220 }}
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
    <FormControl
      sx={{ m: 1, width: "100%", maxWidth: 220 }}
      size="small"
      error={props.error}
      disabled={props.disabled}
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
        sx={{ width: "100%", maxWidth: 220 }}
      >
        {props.data.map((data) => (
          <MenuItem key={data.key} value={data.value}>
            {data.value}
          </MenuItem>
        ))}
      </Select>

      {/* 🟢 Show helper text if error exists */}
      {props.helperText && <FormHelperText>{props.helperText}</FormHelperText>}
    </FormControl>
  );
}
export function InputSelectdropDown(props) {
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
          noWrap={props.noWrap}
          // disabled={true}
          size="small"
          sx={{ width: "100%", maxWidth: 130 }}
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
  // const theme = useTheme();

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          disablePast={props.disablePast}
          id={props.name}
          name={props.name}
          label={props.label}
          value={props.value || null}
          onChange={props.onChange}
          format="DD-MM-YYYY"
          readOnly={props.disabled}
          sx={{
            width: "100%",
            maxWidth: 220,
            //         borderRadius: 10,
            // transition: "all 0.3s",
            //  backgroundColor: theme.palette.background.paper,
          }}
          minDate={props.minDate}
          slotProps={{
            textField: {
              size: "small",
              // required: true,
              readOnly: props.readOnly,
            },
          }}
        />
      </LocalizationProvider>
    </>
  );
}

export function InputDatePickermodelFields(props) {
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
          sx={{ width: "100%", maxWidth: 220 }}
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
      name={props.name || props.id} // Support both
      value={props.value}
      label={props.label}
      error={props.error}
      helperText={props.helperText}
      autoFocus
      placeholder="Search ..."
      sx={{ m: 1, width: "100%", maxWidth: 220 }}
      InputProps={{
        readOnly: props.readOnly,
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
      InputLabelProps={{
        shrink: !!props.value, // moved here
      }}
    />
  );
}

export function InputTextSearchButtonTable(props) {
  const isDisabled = props.disabled;

  return (
    <TextField
      required={props.required}
      size="small"
      onChange={props.onChange}
      id={props.id}
      name={props.id}
      value={props.value}
      label={props.label}
      error={props.error}
      helperText={props.helperText}
      // autoFocus
      // placeholder="Search ..."
      sx={{ m: 1, width: "100%", maxWidth: 220 }}
      InputProps={{
        readOnly: props.readOnly,
        shrink: !!props.value,
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              color="success"
              bgcolor="success"
              onClick={props.onClick}
              disabled={props.disabled}
              style={{
                backgroundColor: isDisabled ? "gray" : "green",
                borderRadius: "10%",
                color: "white",
                padding: 2,
              }}
            >
              <ViewListIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}

export function InputTextIconButton(props) {
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
              <TableViewIcon />
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
  },
);
export const InputTextFieldCell = React.memo(function InputTextFieldCell({
  field,
  row,
  onValueChange,
  inputProps,
  readOnly,
  disabled,
  ...props
}) {
  return (
    <InputTextField
      {...field}
      type="text"
      disabled={row.Status === "0"}
      onChange={(e) => {
        field.onChange(e.target.value); // instant UI update
        onValueChange(e, row); // debounced calculation
      }}
      onBlur={(e) => {
        const v = parseFloat(e.target.value || 0).toFixed(2);
        field.onChange(v);
      }}
      inputProps={{
        step: "0.01",
        ...inputProps,
        readOnly,
        disabled,
      }}
      {...props}
    />
  );
});
// export const InputTextFieldCell = React.memo(
//   function InputTextFieldCell({
//     field,
//     row,
//     onBlurCalc,
//     inputProps,
//     readOnly,
//     disabled,
//     ...props
//   }) {
//     return (
//       <InputTextField
//         {...field}
//         type="text"
//         disabled={row.Status === "0"}
//         onChange={(e) => {
//           field.onChange(e.target.value); // ✅ UI only
//         }}
//         onBlur={(e) => {
//           const v = parseFloat(e.target.value || 0).toFixed(2);

//           field.onChange(v);              // ✅ format
//           onBlurCalc(field.name, v, row); // ✅ heavy calc
//         }}
//         inputProps={{
//           step: "0.01",
//           readOnly,
//           disabled,
//           ...inputProps,
//         }}
//         {...props}
//       />
//     );
//   }
// );

// export const InputTextFieldCell = React.memo(function InputTextFieldCell({
//   value,
//   row,
//   name,
//   onValueChange,
//   inputProps,
//   readOnly,
//   disabled,
//   ...props
// }) {
//   const [localValue, setLocalValue] = React.useState(value ?? "");

//   // useEffect(() => {
//   //   setLocalValue(value ?? "");
//   // }, [value]);

//   return (
//     <InputTextField
//       value={localValue}
//       disabled={row.Status === "0" || disabled}
//       inputProps={{
//         step: "0.01",
//         readOnly,
//         ...inputProps,
//       }}
//       onChange={(e) => {
//         const v = e.target.value;
//         setLocalValue(v); // ⚡ instant typing
//         onValueChange(name, v, row); // call calculation
//       }}
//       onBlur={() => {
//         const fixed = formatForUI(localValue || 0.00,2);
//         setLocalValue(fixed);
//         onValueChange(name, fixed, row); // commit
//       }}
//       {...props}
//     />
//   );
// });

// export const InputTextFieldCell = React.memo(function InputTextFieldCell({
//   value,
//   row,
//   name,
//   onValueChange,
//   inputProps,
//   readOnly,
//   disabled,
//   ...props
// }) {
//   const [localValue, setLocalValue] = React.useState(value ?? "");

//   // useEffect(() => {
//   //   setLocalValue(value ?? "");
//   // }, [value]);

//   return (
//     <InputTextField
//       value={localValue}
//       disabled={row.Status === "0" || disabled}
//       inputProps={{
//         step: "0.01",
//         readOnly,
//         ...inputProps,
//       }}
//       onChange={(e) => {
//         const v = e.target.value;
//         setLocalValue(v); // ⚡ instant typing
//         onValueChange(name, v, row); // call calculation
//       }}
//       onBlur={() => {
//         const fixed = formatForUI(localValue || 0.00,2);
//         setLocalValue(fixed);
//         onValueChange(name, fixed, row); // commit
//       }}
//       {...props}
//     />
//   );
// });
export const InputTextField = forwardRef(
  (
    {
      label,
      type,
      error,
      helperText,
      readOnly,
      disabled,
      inputProps,
      sx,
      ...props
    },
    ref,
  ) => {
    return (
      <TextField
        label={label}
        type={type}
        size="small"
        error={!!error}
        helperText={helperText}
        inputRef={ref}
        inputProps={{
          ...inputProps,
          readOnly,
          disabled,
        }}
        InputLabelProps={{
          shrink: props.value !== undefined && props.value !== "",
        }}
        {...props}
        sx={{
          width: "100%",
          maxWidth: 220,
          ...sx,

          "& .Mui-error": {
            color: "red",
          },
        }}
      />
    );
  },
);
export const InputTextFieldLarge = forwardRef(
  (
    {
      label,
      type,
      error,
      helperText,
      readOnly,
      disabled,
      inputProps,
      sx = {}, // ✅ Accept sx from parent
      ...props
    },
    ref,
  ) => {
    return (
      <TextField
        label={label}
        type={type}
        size="small"
        error={!!error}
        helperText={helperText}
        inputRef={ref}
        inputProps={{
          ...inputProps,
          readOnly,
          disabled,
        }}
        InputLabelProps={{
          shrink: props.value !== undefined && props.value !== "",
        }}
        {...props}
        sx={{
          width: "100%",
          maxWidth: 420,

          "& .Mui-error": {
            color: "red",
          },
          ...sx,
        }}
      />
    );
  },
);

export const ModelInputText = forwardRef(
  (
    {
      label,
      type,
      error,
      helperText,
      value,
      name,
      readOnly,
      disabled,
      onBlur,
      inputProps,
      ...props
    },
    ref,
  ) => {
    return (
      <TextField
        label={label}
        type={type}
        value={value}
        name={name}
        size="small"
        readOnly={readOnly}
        error={error}
        helperText={helperText}
        onBlur={onBlur}
        InputProps={{
          readOnly,
          disabled,
          ...inputProps, // Spread inputProps here to ensure maxLength is included
        }}
        inputProps={{
          ...inputProps, // Ensure that the `maxLength` prop is passed to the `input` element
        }}
        InputLabelProps={{
          shrink: !!value, // Use value to control the label's shrink property
        }}
        {...props}
        sx={{
          width: "100%",
          maxWidth: 220,

          "& .Mui-error": {
            color: "red",
          },
        }}
      />
    );
  },
);

export const SmallInputTextField = forwardRef(
  (
    {
      label,
      type,
      error,
      helperText,
      value,
      readOnly,
      fullWidth,
      InputProps = {},
      ...props
    },
    ref,
  ) => {
    return (
      <TextField
        label={label}
        type={type}
        value={value}
        fullWidth={fullWidth}
        size="small"
        error={error}
        helperText={helperText}
        {...props}
        onWheel={(e) => e.target.blur()}
        InputProps={{
          readOnly,
          ...InputProps, // Merge external InputProps
        }}
        sx={{
          m: 1,
          minWidth: 135,
          maxWidth: 133,
          "& .MuiInputBase-root": {
            WebkitAppearance: "none",
          },
          "& .MuiInputBase-input": {
            // Fixed the extra comma
            // textAlign: "end",
            "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
              WebkitAppearance: "none",
            },
          },
        }}
      />
    );
  },
);

export const SmallInputSearchSelectTextField = forwardRef(
  (
    {
      label,
      error,
      data = [],
      helperText,
      value,
      name,
      onChange,
      disabled,
      readOnly,
      usedLevels = [],
      sx,
      ...props
    },
    ref,
  ) => {
    // 🔹 resolve selected option (NO null allowed)
    const selectedOption = useMemo(() => {
      return data.find((item) => String(item.key) === String(value)) ?? null;
    }, [data, value]);

    return (
      <Autocomplete
        ref={ref}
        options={data}
        value={selectedOption}
        disabled={disabled}
        disableClearable // 🚫 prevents deselect
        readOnly={readOnly}
        isOptionEqualToValue={(opt, val) => opt?.key === val?.key}
        getOptionLabel={(option) => option?.value || option?.label || ""}
        onChange={(e, newValue) => {
          if (!newValue) return;
          onChange({
            target: { name, value: newValue.key },
          });
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            size="small"
            error={error}
            helperText={helperText}
            sx={{
              m: 1,
              minWidth: 135,
              maxWidth: 133,
              "& .MuiInputBase-root": {
                WebkitAppearance: "none",
              },
              "& .MuiInputBase-input": {
                // Fixed the extra comma
                // textAlign: "end",
                "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                  WebkitAppearance: "none",
                },
              },
              ...sx,
            }}
          />
        )}
        renderOption={(props, option) => {
          const disabledOption = usedLevels.includes(option.key);

          return (
            <li
              {...props}
              key={option.key}
              // aria-disabled={disabledOption}
              style={{
                opacity: disabledOption ? 0.5 : 1,
                pointerEvents: disabledOption ? "none" : "auto",
              }}
            >
              {option.value?.length > 20 ? (
                <Tooltip title={option.value} arrow>
                  <span>{option.value}</span>
                </Tooltip>
              ) : (
                <span>{option.value}</span>
              )}
              &nbsp;&nbsp;{option.label}
            </li>
          );
        }}
        {...props}
      />
    );
  },
);

export const InputTextArea = forwardRef(
  (
    {
      label,
      type,
      error,
      helperText,
      value,
      readOnly,
      disabled,
      inputProps,
      ...props
    },
    ref,
  ) => {
    return (
      <>
        <TextField
          size="small"
          multiline
          rows={props.rows || 2}
          // sx={{ m: 1, width: "100%", maxWidth: 220 }}
          sx={{
            width: "100%",
            maxWidth: 220,
            m: 1,
            "& .Mui-error": {
              color: "red",
            },
          }}
          label={label}
          type={type}
          value={value}
          inputProps={{
            ...inputProps,
            readOnly,
            disabled,
          }}
          error={error}
          helperText={helperText}
          {...props}
        />
      </>
    );
  },
);
export const InputMultipleSelectTextField = forwardRef(
  (
    {
      label,
      error,
      data,
      helperText,
      value,
      name,
      onChange,
      multiple = false,
      ...props
    },
    ref,
  ) => {
    return (
      <FormControl
        sx={{ width: "100%", maxWidth: 220 }}
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
          onChange={onChange} // Ensure onChange is passed here
          multiple={multiple} // Enable multiple selection
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
  },
);

const RHFIdAutocomplete = ({
  name,
  control,
  label,
  defaultValue,
  options = [],
  disabled = false,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field }) => (
        <Autocomplete
          options={options}
          disabled={disabled}
          getOptionLabel={(option) => option?.label || ""}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={options.find((opt) => opt.id === field.value) || null}
          onChange={(_, value) => field.onChange(value?.id || null)}
          size="small"
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              sx={{ m: 1, width: "100%", maxWidth: 220 }}
              size="small"
            />
          )}
        />
      )}
    />
  );
};

export default RHFIdAutocomplete;
export const InputSelectTextField = forwardRef(
  (
    {
      label,
      error,
      data,
      helperText,
      value,
      name,
      onChange,
      disabled,
      readOnly,
      usedLevels = [],
      sx,
      ...props
    },
    ref,
  ) => {
    const menuProps = {
      PaperProps: {
        sx: {
          maxWidth: 220,
        },
      },
      MenuListProps: {
        sx: {
          maxHeight: 200,
        },
      },
    };

    return (
      <FormControl
        sx={{ width: "100%", maxWidth: 220, m: 1, ...sx }}
        size="small"
        error={error}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        <InputLabel>{label}</InputLabel>
        <Select
          label={label}
          name={name}
          value={value}
          onChange={onChange}
          size="small"
          error={error}
          disabled={disabled}
          readOnly={readOnly}
          MenuProps={menuProps}
        >
          {data.map((item) => (
            <MenuItem
              key={item.key}
              value={item.key}
              label={item.label}
              disabled={usedLevels.includes(item.key)}
            >
              <Tooltip title={item.value} placement="right" arrow>
                <span>{item.value}</span>
              </Tooltip>
              {item.label} &nbsp;&nbsp;&nbsp; {item.label}
            </MenuItem>
          ))}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  },
);

export const InputSearchSelectTextField = forwardRef(
  (
    {
      label,
      error,
      data = [],
      helperText,
      value,
      name,
      onChange,
      disabled,
      readOnly,
      usedLevels = [],
      sx,
      ...props
    },
    ref,
  ) => {
    // 🔹 resolve selected option (NO null allowed)
    const selectedOption = useMemo(() => {
      return data.find((item) => String(item.key) === String(value)) ?? null;
    }, [data, value]);

    return (
      <Autocomplete
        ref={ref}
        options={data}
        value={selectedOption}
        disabled={disabled}
        disableClearable // 🚫 prevents deselect
        readOnly={readOnly}
        isOptionEqualToValue={(opt, val) => opt?.key === val?.key}
        getOptionLabel={(option) => option?.value || option?.label || ""}
        onChange={(e, newValue) => {
          // 🚫 block null (Esc / Backspace clear)
          if (!newValue) return;
          onChange({
            target: { name, value: newValue.key },
          });
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            size="small"
            error={error}
            helperText={helperText}
            sx={{ width: "100%", maxWidth: 220, m: 1, ...sx }}
          />
        )}
        renderOption={(props, option) => {
          const disabledOption = usedLevels.includes(option.key);

          return (
            <li
              {...props}
              key={option.key}
              // aria-disabled={disabledOption}
              style={{
                opacity: disabledOption ? 0.5 : 1,
                pointerEvents: disabledOption ? "none" : "auto",
              }}
            >
              {option.value?.length > 20 ? (
                <Tooltip title={option.value} arrow>
                  <span>{option.value}</span>
                </Tooltip>
              ) : (
                <span>{option.value}</span>
              )}
              &nbsp;&nbsp;{option.label}
            </li>
          );
        }}
        slotProps={{
          popper: {
            sx: {
              "& .MuiAutocomplete-listbox": {
                maxHeight: 240,
                overflowY: "auto",
              },
              "& .MuiAutocomplete-paper": {
                overflow: "hidden", // safety
              },
            },
          },
        }}
        {...props}
      />
    );
  },
);
export const InputSearchableSelect = forwardRef(
  (
    {
      label,
      error,
      helperText,
      data = [],
      value,
      name,
      onChange,
      disabled,
      ...props
    },
    ref,
  ) => {
    const selectedOption = useMemo(() => {
      return data.find((item) => String(item.key) === String(value)) ?? null;
    }, [data, value]);

    return (
      <FormControl error={!!error} size="small" sx={{ width: 170 }}>
        <Autocomplete
          ref={ref}
          options={data}
          value={selectedOption}
          disabled={disabled}
          disableClearable
          /* 🔍 SEARCH LOGIC (EXPLICIT) */
          filterOptions={(options, { inputValue }) =>
            options.filter((option) =>
              option.value?.toLowerCase().includes(inputValue.toLowerCase()),
            )
          }
          isOptionEqualToValue={(opt, val) =>
            String(opt.key) === String(val.key)
          }
          getOptionLabel={(option) => option?.value || ""}
          onChange={(e, newValue) => {
            if (!newValue) return;
            onChange({
              target: { name, value: newValue.key },
            });
          }}
          renderInput={(params) => (
            <TextField {...params} label={label} size="small" error={!!error} />
          )}
          slotProps={{
            popper: {
              sx: {
                "& .MuiAutocomplete-listbox": {
                  maxHeight: 200,
                  overflowY: "auto",
                },
              },
            },
          }}
          {...props}
        />

        {error && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  },
);
export const MultiSelectTextField = forwardRef(
  ({ label, error, data, value = [], onChange, helperText, disabled }, ref) => {
    const menuProps = {
      PaperProps: { sx: { maxHeight: 250 } },
    };

    const allSelected = value.length === data.length;

    const handleChange = (selected) => {
      // Check if user clicked Select All
      if (selected.includes("ALL")) {
        if (allSelected) {
          onChange([]); // unselect all
        } else {
          onChange(data.map((item) => item.key)); // select all
        }
      } else {
        onChange(selected);
      }
    };

    return (
      <FormControl
        sx={{ width: "100%", maxWidth: 220, m: 1 }}
        size="small"
        error={error}
        ref={ref}
        disabled={disabled}
      >
        <InputLabel>{label}</InputLabel>
        <Select
          multiple
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          label={label}
          renderValue={(selected) =>
            selected.length === data.length
              ? "All Selected"
              : selected
                  .map((val) => data.find((d) => d.key === val)?.value)
                  .join(", ")
          }
          MenuProps={menuProps}
        >
          {/* Select All option */}
          <MenuItem value="ALL">
            <Checkbox checked={allSelected} />
            <ListItemText primary="Select All" />
          </MenuItem>

          {/* Individual options */}
          {data.map((item) => (
            <MenuItem key={item.key} value={item.key}>
              <Checkbox checked={value.includes(item.key)} />
              <ListItemText primary={item.value} />
            </MenuItem>
          ))}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  },
);
export const InputSelectTextField1 = forwardRef(
  (
    {
      label,
      error,
      data = [],
      helperText,
      value,
      name,
      onChange,
      disabled,
      readOnly,
      usedLevels = [],
      sx = {},
      ...props
    },
    ref,
  ) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [search, setSearch] = useState("");
    const [filteredData, setFilteredData] = useState(data);

    useEffect(() => {
      setFilteredData(
        data.filter((item) =>
          (item.label || item.value || "")
            .toLowerCase()
            .includes(search.toLowerCase()),
        ),
      );
    }, [search, data]);

    const handleClick = (event) => {
      if (!disabled && !readOnly) setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
      setSearch("");
    };

    const handleSelect = (key) => {
      onChange?.({ target: { name, value: key } });
      handleClose();
    };
    const selectedItem = data.find((item) => item.key === value);
    return (
      <Box sx={{ width: "100%", maxWidth: 240, m: 1, ...sx }}>
        <TextField
          ref={ref}
          label={label}
          value={selectedItem ? `${selectedItem.value}` : ""}
          onClick={handleClick}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <ArrowDropDownIcon />
              </InputAdornment>
            ),
          }}
          size="small"
          error={error}
          disabled={disabled}
          {...props}
        />
        {helperText && (
          <FormHelperText error={error}>{helperText}</FormHelperText>
        )}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{ style: { maxHeight: 300, width: 320 } }}
        >
          <Box
            sx={{
              p: 1,
              position: "sticky",
              top: 0,
              bgcolor: "#fff",
              zIndex: 1,
            }}
          >
            <TextField
              size="small"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              fullWidth
              onKeyDown={(e) => e.stopPropagation()}
              disabled={disabled}
            />
          </Box>
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <MenuItem
                key={item.key}
                disabled={usedLevels.includes(item.key)}
                onClick={() => handleSelect(item.key)}
              >
                <Typography>{item.value}</Typography>&nbsp;&nbsp;&nbsp;
                {/* <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography> */}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No results found</MenuItem>
          )}
        </Menu>
      </Box>
    );
  },
);
export const InputSelectTextFieldLarge = forwardRef(
  (
    {
      label,
      error,
      data,
      helperText,
      value,
      name,
      onChange,
      disabled,
      readOnly,
      usedLevels = [],
      sx = {},
      ...props
    },
    ref,
  ) => {
    const menuProps = {
      PaperProps: {
        sx: {
          maxWidth: 500,
        },
      },
      MenuListProps: {
        sx: {
          maxHeight: 200,
        },
      },
    };

    return (
      <FormControl
        sx={{ width: "100%", maxWidth: 500, m: 1, ...sx }} // <-- Merge custom sx
        size="small"
        error={error}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        <InputLabel>{label}</InputLabel>
        <Select
          label={label}
          name={name}
          value={value}
          onChange={onChange}
          size="small"
          error={error}
          disabled={disabled}
          readOnly={readOnly}
          MenuProps={menuProps}
        >
          {data.map((item) => (
            <MenuItem
              key={item.key}
              value={item.key}
              label={item.label}
              disabled={usedLevels.includes(item.key)}
            >
              {item.value} &nbsp;&nbsp;&nbsp; {item.label}
            </MenuItem>
          ))}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  },
);
export const InputDatePickerField = forwardRef(
  (
    {
      label,
      error,
      helperText,
      onChange,
      value,
      disabled,
      minDate,
      readOnly,
      ...props
    },
    ref,
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
            minDate={minDate}
            onChange={(newValue) =>
              onChange(newValue ? newValue.toDate().toISOString() : null)
            }
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
              InputProps: {
                readOnly: readOnly || disabled,
              },
            }}
          />
        </LocalizationProvider>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  },
);
export const InputTimePickerField = forwardRef(
  (
    { label, error, helperText, onChange, value, disabled, readOnly, ...props },
    ref,
  ) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    return (
      <FormControl
        size="small"
        error={error}
        sx={{ m: 1, width: "100%", maxWidth: 220 }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <TimePicker
            {...props}
            id={props.name}
            name={props.name}
            value={value ? dayjs(value) : null}
            onChange={(newValue) =>
              onChange(newValue ? newValue.toDate().toISOString() : null)
            }
            disabled={disabled || readOnly}
            className={`custom-antd-timepicker ${isDark ? "dark-mode" : ""}`}
          />
        </LocalizationProvider>

        {helperText && (
          <FormHelperText sx={{ ml: 1 }}>{helperText}</FormHelperText>
        )}
      </FormControl>
    );
  },
);

export const SelectedDatePickerField = forwardRef(
  (
    {
      label,
      error,
      helperText,
      onChange,
      value,
      maxDate,
      disabled,
      minDate,
      readOnly,
      shouldDisableDate,
      ...props
    },
    ref,
  ) => {
    // Ensure `value` is a valid `dayjs` object or `null`
    const parsedValue = value ? dayjs(value) : null;

    return (
      <FormControl size="small" error={error} {...props}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            disablePast={props.disablePast}
            id={props.name}
            error={error}
            name={props.name}
            label={label}
            shouldDisableDate={shouldDisableDate}
            value={parsedValue} // Use the parsed value
            minDate={minDate ? dayjs(minDate) : undefined} // Ensure `minDate` is a valid `dayjs` object
            maxDate={maxDate ? dayjs(maxDate) : undefined}
            onChange={(newValue) => {
              // Pass the ISO string or `undefined` to the `onChange` handler
              // onChange(newValue ? newValue.toISOString() : undefined);
              if (newValue && newValue.isValid()) {
                onChange(newValue.toISOString());
              } else {
                onChange(undefined);
              }
            }}
            format="DD-MM-YYYY"
            readOnly={disabled || readOnly}
            sx={{ width: "100%", maxWidth: 220 }}
            slotProps={{
              textField: {
                size: "small",
                required: false,
                readOnly: disabled || readOnly,
                inputRef: ref,
                error: !!error,
              },
            }}
          />
        </LocalizationProvider>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  },
);
export const ModelSelectedDatePickerField = forwardRef(
  (
    {
      label,
      error,
      helperText,
      onChange,
      value,
      disabled,
      minDate,
      readOnly,
      shouldDisableDate,
      ...props
    },
    ref,
  ) => {
    // Ensure `value` is a valid `dayjs` object or `null`
    const parsedValue = value ? dayjs(value) : null;

    return (
      <FormControl size="small" error={error} {...props}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            disablePast={props.disablePast}
            id={props.name}
            error={error}
            name={props.name}
            label={label}
            shouldDisableDate={shouldDisableDate}
            value={parsedValue} // Use the parsed value
            minDate={minDate ? dayjs(minDate) : undefined} // Ensure `minDate` is a valid `dayjs` object
            onChange={(newValue) => {
              // Pass the ISO string or `undefined` to the `onChange` handler
              onChange(newValue ? newValue.toISOString() : undefined);
            }}
            format="DD-MM-YYYY"
            readOnly={disabled || readOnly}
            sx={{ width: "100%", maxWidth: 220 }}
            slotProps={{
              textField: {
                size: "small",
                required: false,
                readOnly: disabled || readOnly,
                inputRef: ref,
                error: !!error,
              },
            }}
          />
        </LocalizationProvider>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  },
);
export const SelectedYearPickerField = forwardRef(
  (
    {
      label,
      error,
      helperText,
      onChange,
      value,
      disabled,
      minDate,
      readOnly,
      ...props
    },
    ref,
  ) => {
    // Ensure the value is treated as a valid year; if the year is invalid (e.g., 0), return null
    const parsedValue =
      value && value !== "0" && value !== 0 ? dayjs(`${value}-01-01`) : null;

    return (
      <FormControl size="small" error={error} {...props}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            views={["year"]} // Only year view
            id={props.name}
            name={props.name}
            label={label}
            value={parsedValue} // Correctly pass parsedValue as a dayjs object
            minDate={minDate ? dayjs(minDate) : undefined}
            onChange={(newValue) => {
              // Send back the selected year as ISO string or undefined
              onChange(newValue ? newValue.toISOString() : undefined);
            }}
            format="YYYY" // Display only the year
            readOnly={disabled || readOnly}
            sx={{ m: 1, width: "100%", maxWidth: 220 }}
            slotProps={{
              textField: {
                size: "small",
                required: false,
                readOnly: disabled || readOnly,
                inputRef: ref,
                error: !!error,
              },
            }}
          />
        </LocalizationProvider>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  },
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
  },
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
      loading,
      onScrollBottom,
      onInputChange,
    },
    ref,
  ) => {
    // Find the selected option based on the value (DocEntry)
    const selectedOption =
      options.find((option) => option.DocEntry === value) || null;

    return (
      <Autocomplete
        ref={ref}
        options={options}
        getOptionLabel={(option) => {
          if (typeof option === "string") return option;
          return option.Name || option.Location || option.Code || "";
        }}
        value={selectedOption} // Pass the actual option object
        onChange={(_, newValue) => {
          // Pass the full option object to parent
          onChange(newValue);
        }}
        onInputChange={(event, inputValue, reason) => {
          if (onInputChange) {
            onInputChange(event, inputValue, reason); // ✅ Fix here
          }
        }}
        loading={loading}
        ListboxProps={{
          onScroll: (event) => {
            const listboxNode = event.currentTarget;
            if (
              listboxNode.scrollTop + listboxNode.clientHeight >=
              listboxNode.scrollHeight - 1
            ) {
              if (onScrollBottom) {
                onScrollBottom();
              }
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
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        // renderOption={(props, option) => (
        //   <li {...props} key={option.DocEntry}>
        //     <Box>
        //       <Typography variant="body2">
        //         {option.Name || option.Location || option.Code}
        //       </Typography>
        //       {option.Street && (
        //         <Typography variant="caption" color="text.secondary">
        //           {option.Street}, {option.City}
        //         </Typography>
        //       )}
        //     </Box>
        //   </li>
        // )}
      />
    );
  },
);

export const InputLargeTextField = forwardRef(
  ({ label, type, error, helperText, value, ...props }, ref) => {
    return (
      <>
        <TextField
          size="small"
          multiline
          rows={props.rows || 2}
          // sx={{ m: 1, width: "100%", maxWidth: 220 }}
          sx={{
            width: "100%",
            maxWidth: 300,
            m: 1,
            "& .Mui-error": {
              color: "red",
            },
          }}
          label={label}
          type={type}
          value={value}
          error={error}
          helperText={helperText}
          {...props}
        />
      </>
    );
  },
);
export const ModelInputSelectTextField = forwardRef(
  ({ label, error, data, helperText, value, name, ...props }, ref) => {
    const menuProps = {
      PaperProps: {
        sx: {
          maxWidth: 220, // dropdown width
        },
      },
      MenuListProps: {
        sx: {
          maxHeight: 200, // scroll height of menu list
        },
      },
    };

    return (
      <FormControl
        sx={{ width: "100%", maxWidth: 220 }}
        size="small"
        error={error}
        ref={ref}
        {...props}
      >
        <InputLabel id={`${name}-label`}>{label}</InputLabel>
        <Select
          label={label}
          name={name}
          value={value}
          size="small"
          error={error}
          MenuProps={menuProps}
          labelId={`${name}-label`}
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
  },
);
export const ModelInputTextField = forwardRef(
  (
    {
      label,
      type,
      error,
      helperText,
      value,
      name,
      readOnly,
      disabled,
      inputProps,
      ...props
    },
    ref,
  ) => {
    return (
      <TextField
        label={label}
        type={type}
        value={value}
        name={name}
        size="small"
        error={error}
        inputProps={{
          ...inputProps,
          readOnly,
          disabled,
        }}
        InputLabelProps={{
          shrink: props.value !== undefined && props.value !== "",
        }}
        helperText={helperText}
        {...props}
        sx={{
          // m: 0.5,
          mb: 1,
          width: "100%",
          maxWidth: 220,
          "& .Mui-error": {
            color: "red",
          },
        }}
      />
    );
  },
);
export function InputTimePicker(props) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MuiTimePicker
        label={props.label}
        value={props.value}
        onChange={props.onChange}
        disabled={props.disabled}
        readOnly={props.readOnly}
        format="HH:mm"
        slotProps={{
          textField: {
            size: "small",
            error: props.error,
            helperText: props.helperText,
            sx: { width: "100%", maxWidth: 220 },
          },
        }}
      />
    </LocalizationProvider>
  );
}
