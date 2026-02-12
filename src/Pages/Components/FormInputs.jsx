import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import MicIcon from "@mui/icons-material/Mic";
import SearchIcon from "@mui/icons-material/Search";
import {
  Autocomplete,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputBase,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  DesktopTimePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import React from "react";

const MyTextField = styled(TextField)(({ theme }) => ({
  backgroundColor: theme.form.textFieldColor,
  "& .MuiInputLabel-root, .MuiInputBase-input ": {
    fontFamily: theme.fontFamily,
    textTransform: "uppercase",
    color: "#0A2351",
  },
  "& .MuiInputLabel-root": {
    // fontSize: 13
  },
}));
export default class InputTextField extends React.Component {
  render(props) {
    return (
      <>
        <MyTextField
          label={this.props.label}
          onChange={this.props.onChange}
          id={this.props.id}
          name={this.props.id}
          type="text"
          value={this.props.value}
          size="small"
          // tabIndex={this.props.tabIndex}
          //disabled={this.props.disabled}
          InputProps={{
            inputProps: {
              readOnly: this.props.disabled,
              tabIndex: this.props.tabIndex,
            },
          }}
          sx={{ minWidth: 190, maxWidth: 200 }}
        />
      </>
    );
  }
}

export class InputTextFieldRequired extends React.Component {
  render(props) {
    return (
      <>
        <MyTextField
          label={this.props.label}
          id={this.props.id}
          name={this.props.id}
          type="text"
          value={this.props.value}
          onChange={this.props.onChange}
          autoFocus={this.props.autoFocus}
          //disabled={this.props.disabled}
          InputProps={{
            inputProps: {
              readOnly: this.props.disabled,
            },
          }}
          size="small"
          sx={{
            minWidth: 190,
            maxWidth: 200,
            // "& .MuiInputBase-input.Mui-disabled": {
            //   color: "blue !important",

            // },
            // "& .MuiInputLabel-outlined.Mui-disabled": {
            //   color: "blue !important",
            //   // backgroundColor: "white",
            // },
          }}
          required
        />
      </>
    );
  }
}
export class LargeInputTextField extends React.Component {
  render(props) {
    return (
      <>
        <MyTextField
          label={this.props.label}
          onChange={this.props.onChange}
          id={this.props.id}
          name={this.props.id}
          type="text"
          value={this.props.value}
          size="small"
          // tabIndex={this.props.tabIndex}
          //disabled={this.props.disabled}
          InputProps={{
            inputProps: {
              readOnly: this.props.disabled,
              tabIndex: this.props.tabIndex,
            },
          }}
          sx={{ minWidth: "100%", maxWidth: "100%" }}
        />
      </>
    );
  }
}

export class PasswordTextFieldRequired extends React.Component {
  render(props) {
    return (
      <>
        <MyTextField
          label={this.props.label}
          id={this.props.id}
          name={this.props.id}
          type="text"
          value={this.props.value}
          onChange={this.props.onChange}
          autoFocus={this.props.autoFocus}
          //disabled={this.props.disabled}
          InputProps={{
            inputProps: {
              readOnly: this.props.disabled,
            },
          }}
          size="small"
          sx={{
            minWidth: 190,
            maxWidth: 200,
            "& .MuiInputBase-input": {
              textTransform: "unset !important",
            },
          }}
          required
        />
      </>
    );
  }
}

export class InputTextArea extends React.Component {
  render(props) {
    return (
      <>
        <Tooltip
          title={
            <>
              <Typography whiteSpace="pre-line" sx={{ fontSize: 15 }}>
                {this.props.value}
              </Typography>
            </>
          }
          sx={{}}
          arrow
          placement="bottom"
        >
          <MyTextField
            required={this.props.required}
            label={this.props.label}
            //disabled={this.props.disabled}
            id={this.props.id}
            name={this.props.id}
            type="text"
            value={this.props.value}
            size="small"
            onChange={this.props.onChange}
            multiline
            rows={this.props.rows || 2}
            InputProps={{
              sx: { minWidth: 190, maxWidth: 200 },
              inputProps: {
                style: { textTransform: "uppercase" },
                readOnly: this.props.disabled,
              },
            }}
          />
        </Tooltip>
      </>
    );
  }
}
export class LargeInputTextArea extends React.Component {
  render(props) {
    return (
      <>
        <Tooltip
          title={
            <>
              <Typography whiteSpace="pre-line" sx={{ fontSize: 15 }}>
                {this.props.value}
              </Typography>
            </>
          }
          sx={{}}
          arrow
          placement="bottom"
        >
          <MyTextField
            required={this.props.required}
            label={this.props.label}
            //disabled={this.props.disabled}
            id={this.props.id}
            name={this.props.id}
            type="text"
            value={this.props.value}
            size="small"
            onChange={this.props.onChange}
            multiline
            autoFocus={this.props.autoFocus}
            rows={this.props.rows || 2}
            InputProps={{
              sx: { minWidth: "100%", maxWidth: "100%" },
              inputProps: {
                style: { textTransform: "uppercase" },
                readOnly: this.props.disabled,
              },
            }}
          />
        </Tooltip>
      </>
    );
  }
}

export class InputTextAreaRequired extends React.Component {
  render(props) {
    return (
      <>
        <MyTextField
          // disabled={this.props.disabled}
          label={this.props.label}
          onChange={this.props.onChange}
          id={this.props.id}
          name={this.props.id}
          type="text"
          value={this.props.value}
          size="small"
          multiline
          rows={2}
          required
          InputProps={{
            sx: { minWidth: 190, maxWidth: 200 },
            inputProps: {
              style: { textTransform: "uppercase" },
              readOnly: this.props.disabled,
            },
          }}
        />
      </>
    );
  }
}

export class InputTextSearchButton extends React.Component {
  render(props) {
    return (
      <>
        <MyTextField
          required={this.props.required}
          size="small"
          onChange={this.props.onChange}
          id={this.props.id}
          name={this.props.id}
          value={this.props.value}
          label={this.props.label}
          //disabled={this.props.disabled}
          autoFocus
          placeholder="Search ..."
          InputProps={{
            sx: { minWidth: 190, maxWidth: 200 },
            inputProps: { readOnly: this.props.disabled },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton color="primary" onClick={this.props.onClick}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </>
    );
  }
}

export class InputNumberField extends React.Component {
  render(props) {
    return (
      <>
        <MyTextField
          label={this.props.label}
          id={this.props.id}
          name={this.props.id}
          //disabled={this.props.disabled}
          type="number"
          onChange={this.props.onChange}
          value={this.props.value}
          onWheel={(e) => e.target.blur()}
          size="small"
          InputProps={{
            inputProps: {
              min: 0,
              readOnly: this.props.disabled,
            },
          }}
          // inputProps={{ min: 0 }}
          sx={{
            minWidth: 190,
            maxWidth: 200,

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
          required={this.props.required}
        />
      </>
    );
  }
}
export class InputTextFieldAlignEnd extends React.Component {
  render(props) {
    return (
      <>
        <MyTextField
          label={this.props.label}
          id={this.props.id}
          name={this.props.id}
          //disabled={this.props.disabled}
          type="text"
          onChange={this.props.onChange}
          value={this.props.value}
          size="small"
          InputProps={{
            inputProps: {
              min: 0,
              readOnly: this.props.disabled,
            },
          }}
          // inputProps={{ min: 0 }}
          sx={{
            minWidth: 190,
            maxWidth: 200,

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
          required={this.props.required}
        />
      </>
    );
  }
}
export class MobileNumberField extends React.Component {
  render(props) {
    return (
      <>
        <MyTextField
          label={this.props.label}
          id={this.props.id}
          name={this.props.id}
          //disabled={this.props.disabled}
          type="tel"
          onChange={this.props.onChange}
          value={this.props.value}
          size="small"
          //inputProps={{ min: 0 }}
          InputProps={{
            inputProps: {
              min: 0,
              readOnly: this.props.disabled,
            },
          }}
          sx={{
            minWidth: 190,
            maxWidth: 200,
            "& .MuiInputBase-input,": {
              textAlign: "start",
            },
          }}
          required={this.props.required}
        />
      </>
    );
  }
}

export class MoNoCountryCodeField extends React.Component {
  render(props) {
    const CountryTelCodeList = [
      { key: "", value: "NO VALUE" },
      { key: "+973", value: "+973 BAHRAIN" },
      { key: "+964", value: "+964 IRAQ" },
      { key: "+962", value: "+962 JORDAN" },
      { key: "+965", value: "+965 KUWAIT" },
      { key: "+961", value: "+961 LEBANON" },
      { key: "+968", value: "+968 OMAN" },
      { key: "+974", value: "+974 QATAR" },
      { key: "+966", value: "+966 SAUDI ARABIA" },
      { key: "+963", value: "+963 SYRAI" },
      { key: "+971", value: "+971 UNITED ARAB EMIRATES" },
      { key: "+967", value: "+967 YEMEN" },
    ];
    return (
      <>
        <FormControl
          size="small"
          sx={{
            minWidth: 80,
            maxWidth: 90,

            fontFamily: (theme) => theme.fontFamily,
          }}
          readOnly={this.props.disabled}
        >
          <InputLabel
            sx={{ fontFamily: (theme) => theme.fontFamily, color: "#0A2351" }}
          >
            Country*
          </InputLabel>
          <MySelect
            id={this.props.CountryCodeId}
            name={this.props.CountryCodeId}
            label={this.props.CountryCodeLabel}
            onChange={this.props.onCountryTelCodeChange}
            value={this.props.CountryCode}
            required={this.props.requiredCountryCode}
            size="small"
            sx={{
              "& .MuiInputBase-input,": {
                fontSize: (theme) => theme.form.fontSize,
                lineHeight: "23px",
                // fontWeight: "bold",
              },
            }}
          >
            {CountryTelCodeList.map((option) => (
              <MenuItem
                key={option.key}
                sx={{
                  fontFamily: (theme) => theme.fontFamily,
                  fontSize: (theme) => theme.form.fontSize,
                  textTransform: "uppercase",
                }}
                value={option.key}
              >
                {option.value}
              </MenuItem>
            ))}
          </MySelect>
        </FormControl>

        <MyTextField
          label={this.props.label}
          id={this.props.id}
          name={this.props.id}
          type="tel"
          onChange={this.props.onChange}
          value={this.props.value}
          size="small"
          InputProps={{
            inputProps: {
              min: 0,
              readOnly: this.props.disabled,
            },
          }}
          sx={{
            "& .MuiInputBase-input,": {
              textAlign: "start",
              width: "100%",
            },
          }}
          required={this.props.required}
        />
      </>
    );
  }
}
export class MoNoMasterCountryCodeField extends React.Component {
  render(props) {
    const CountryTelCodeList = [
      { key: "", value: "NO VALUE" },
      { key: "+973", value: "+973 BAHRAIN" },
      { key: "+964", value: "+964 IRAQ" },
      { key: "+962", value: "+962 JORDAN" },
      { key: "+965", value: "+965 KUWAIT" },
      { key: "+961", value: "+961 LEBANON" },
      { key: "+968", value: "+968 OMAN" },
      { key: "+974", value: "+974 QATAR" },
      { key: "+966", value: "+966 SAUDI ARABIA" },
      { key: "+963", value: "+963 SYRAI" },
      { key: "+971", value: "+971 UNITED ARAB EMIRATES" },
      { key: "+967", value: "+967 YEMEN" },
    ];
    return (
      <>
        <FormControl
          size="small"
          sx={{
            minWidth: 80,
            maxWidth: 90,

            fontFamily: (theme) => theme.fontFamily,
          }}
          readOnly={this.props.disabled}
        >
          <InputLabel
            sx={{ fontFamily: (theme) => theme.fontFamily, color: "#0A2351" }}
          >
            Country*
          </InputLabel>
          <MySelect
            id={this.props.CountryCodeId}
            name={this.props.CountryCodeId}
            label={this.props.CountryCodeLabel}
            onChange={this.props.onCountryTelCodeChange}
            value={this.props.CountryCode}
            required={this.props.requiredCountryCode}
            size="small"
            sx={{
              "& .MuiInputBase-input,": {
                fontSize: (theme) => theme.form.fontSize,
                lineHeight: "23px",
                // fontWeight: "bold",
              },
            }}
          >
            {CountryTelCodeList.map((option) => (
              <MenuItem
                key={option.key}
                sx={{
                  fontFamily: (theme) => theme.fontFamily,
                  fontSize: (theme) => theme.form.fontSize,
                  textTransform: "uppercase",
                }}
                value={option.key}
              >
                {option.value}
              </MenuItem>
            ))}
          </MySelect>
        </FormControl>

        <MyTextField
          label={this.props.label}
          id={this.props.id}
          name={this.props.id}
          type="tel"
          onChange={this.props.onChange}
          value={this.props.value}
          size="small"
          InputProps={{
            inputProps: {
              min: 0,
              readOnly: this.props.disabled,
            },
          }}
          sx={{
            minWidth: 100,
            maxWidth: 150,
            "& .MuiInputBase-input,": {
              textAlign: "start",
            },
          }}
          required={this.props.required}
        />
      </>
    );
  }
}
export class InputSmallSelectField extends React.Component {
  render(props) {
    return (
      <>
        <FormControl
          size="small"
          sx={{
            minWidth: 123,
            maxWidth: 133,
            fontFamily: (theme) => theme.fontFamily,
          }}
          readOnly={this.props.disabled}
        >
          <InputLabel
            sx={{ fontFamily: (theme) => theme.fontFamily, color: "#0A2351" }}
          >
            {this.props.label}*
          </InputLabel>
          <MySelect
            id={this.props.id}
            name={this.props.id}
            label={this.props.label}
            onChange={this.props.onChange}
            value={this.props.value}
            readOnly={this.props.disabled}
            sx={{
              "& .MuiInputBase-input,": {
                fontSize: (theme) => theme.form.fontSize,
              },
            }}
            required={this.props.required}
          >
            {this.props.data.map((option) => (
              <MenuItem
                key={option.key}
                sx={{
                  fontFamily: (theme) => theme.fontFamily,
                  fontSize: (theme) => theme.form.fontSize,
                  textTransform: "uppercase",
                }}
                value={option.key}
              >
                {option.value}
              </MenuItem>
            ))}
          </MySelect>
        </FormControl>
      </>
    );
  }
}
export class InputAmountFieldRequired extends React.Component {
  render(props) {
    return (
      <>
        <MyTextField
          id={this.props.id}
          name={this.props.id}
          value={this.props.value}
          //disabled={this.props.disabled}
          onChange={this.props.onChange}
          label={this.props.label}
          size="small"
          type="number"
          onWheel={(e) => e.target.blur()}
          required={this.props.required}
          InputProps={{
            startAdornment:this.props.startAdornment,
            inputProps: {
              min: 0,
              step: 0.001,
              readOnly: this.props.disabled,
            },
          }}
          sx={{
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
}
export class InputSmallTextField extends React.Component {
  render(props) {
    return (
      <>
        <MyTextField
          id={this.props.id}
          name={this.props.id}
          value={this.props.value}
          //disabled={this.props.disabled}
          onChange={this.props.onChange}
          label={this.props.label}
          size="small"
          type="text"
          required={this.props.required}
          InputProps={{
            inputProps: {
              readOnly: this.props.disabled,
            },
          }}
          sx={{
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
}
export class InputAmountFieldRounding extends React.Component {
  render(props) {
    return (
      <>
        <MyTextField
          id={this.props.id}
          name={this.props.id}
          value={this.props.value}
          //disabled={this.props.disabled}
          onChange={this.props.onChange}
          label={this.props.label}
          size="small"
          type="number"
          onWheel={(e) => e.target.blur()}
          required={this.props.required}
          InputProps={{
            inputProps: {
              readOnly: this.props.disabled,
            },
          }}
          sx={{
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
}

const MyDatePicker = styled(DatePicker)(({ theme }) => ({
  backgroundColor: theme.form.textFieldColor,
  "& .MuiInputLabel-root, .MuiInputBase-input ": {
    fontFamily: theme.fontFamily,
    color: "#0A2351",
  },
}));

export class DatePickerField extends React.Component {
  render(props) {
    return (
      <>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MyDatePicker
            disablePast={this.props.disablePast}
            id={this.props.id}
            name={this.props.id}
            label={this.props.label}
            value={this.props.value}
            onChange={this.props.onChange}
            format="DD-MMM-YYYY"
            readOnly={this.props.disabled}
            slotProps={{
              textField: {
                size: "small",
                required: true,
                readOnly: this.props.readOnly,
              },
            }}
            sx={{ minWidth: 190, maxWidth: 200 }}
          ></MyDatePicker>
        </LocalizationProvider>
      </>
    );
  }
}

export class MonthPickerField extends React.Component {
  render(props) {
    return (
      <>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MyDatePicker
            disablePast={this.props.disablePast}
            id={this.props.id}
            name={this.props.id}
            label={this.props.label}
            views={
              this.props.views === undefined
                ? ["month", "year"]
                : this.props.views
            }
            value={this.props.value}
            onChange={this.props.onChange}
            format={
              this.props.format === undefined ? "MMM-YYYY" : this.props.format
            }
            readOnly={this.props.disabled}
            slotProps={{
              textField: {
                size: "small",
                required: true,
                readOnly: this.props.readOnly,
              },
            }}
            sx={{ minWidth: this.props.maxWidth ||190, maxWidth: this.props.maxWidth ||200 }}
          ></MyDatePicker>
        </LocalizationProvider>
      </>
    );
  }
}

export class SmallDatePickerField extends React.Component {
  render(props) {
    return (
      <>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MyDatePicker
            disablePast={this.props.disablePast}
            id={this.props.id}
            name={this.props.id}
            label={this.props.label}
            value={this.props.value}
            onChange={this.props.onChange}
            format="DD-MM-YYYY"
            readOnly={this.props.disabled}
            slotProps={{
              textField: {
                size: "small",
                required: true,
                readOnly: this.props.readOnly,
              },
            }}
            sx={{
              minWidth: 123,
              maxWidth: 133,
              "& .MuiIconButton-root": {
                display: "none",
              },
            }}
          ></MyDatePicker>
        </LocalizationProvider>
      </>
    );
  }
}
const MyTimePicker = styled(TimePicker)(({ theme }) => ({
  backgroundColor: theme.form.textFieldColor,
  "& .MuiInputLabel-root, .MuiInputBase-input ": {
    fontFamily: theme.fontFamily,
    color: "#0A2351",
  },
}));

export class TimePickerField extends React.Component {
  render(props) {
    return (
      <>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
          <MyTimePicker
            minTime={this.props.minTime}
            id={this.props.id}
            name={this.props.id}
            onChange={this.props.onChange}
            label={this.props.label}
            value={this.props.value}
            format="HH:mm"
            ampm={false}
            disablePast={this.props.disablePast}
            slotProps={{
              textField: {
                size: "small",
                required: this.props.required,
                readOnly: this.props.readOnly,
              },
            }}
            readOnly={this.props.disabled}
            sx={{ minWidth: 190, maxWidth: 200 }}
          />
        </LocalizationProvider>
      </>
    );
  }
}
export class DesktopTimePickerField extends React.Component {
  render(props) {
    return (
      <>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
          <DesktopTimePicker
            minTime={this.props.minTime}
            id={this.props.id}
            name={this.props.id}
            onChange={this.props.onChange}
            label={this.props.label}
            value={this.props.value}
            format="HH:mm"
            ampm={false}
            disablePast={this.props.disablePast}
            slotProps={{
              textField: {
                size: "small",
                required: this.props.required,
                readOnly: this.props.readOnly,
              },
            }}
            readOnly={this.props.disabled}
            sx={{ minWidth: 190, maxWidth: 200, backgroundColor: "white" }}
          />
        </LocalizationProvider>
      </>
    );
  }
}
export class SmallTimePickerField extends React.Component {
  render(props) {
    return (
      <>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
          <MyTimePicker
            minTime={this.props.minTime}
            id={this.props.id}
            name={this.props.id}
            onChange={this.props.onChange}
            label={this.props.label}
            value={this.props.value}
            format="HH:mm"
            ampm={false}
            disablePast={this.props.disablePast}
            slotProps={{
              textField: {
                size: "small",
                required: this.props.required,
                readOnly: this.props.readOnly,
              },
            }}
            readOnly={this.props.readOnly}
            sx={{ minWidth: 123, maxWidth: 133 }}
          />
        </LocalizationProvider>
      </>
    );
  }
}

const MySelect = styled(Select)(({ theme }) => ({
  backgroundColor: theme.form.textFieldColor,
  textAlign: "left",
  fontFamily: theme.fontFamily,
  color: "#0A2351",
}));

export class InputSelectField extends React.Component {
  render(props) {
    return (
      <>
        <FormControl
          size="small"
          sx={{
            minWidth: this.props.minWidth||195,
            maxWidth: 200,
            mt:1,
            fontFamily: (theme) => theme.fontFamily,
          }}
          readOnly={this.props.disabled}
        >
          <InputLabel
            sx={{ fontFamily: (theme) => theme.fontFamily, color: "#0A2351" }}
          >
            {this.props.label}*
          </InputLabel>
          <MySelect
            id={this.props.id}
            name={this.props.id}
            label={this.props.label}
            onChange={this.props.onChange}
            value={this.props.value}
            readOnly={this.props.disabled}
            sx={{
              "& .MuiInputBase-input,": {
                fontSize: (theme) => theme.form.fontSize,
              },
            }}
            required={this.props.required}
          >
            {this.props.data.map((option) => (
              <MenuItem
                key={option.key}
                sx={{
                  fontFamily: (theme) => theme.fontFamily,
                  fontSize: (theme) => theme.form.fontSize,
                  textTransform: "uppercase",
                }}
                value={option.key}
              >
                {option.value}
              </MenuItem>
            ))}
          </MySelect>
        </FormControl>
      </>
    );
  }
}
export class LargeInputSelectField extends React.Component {
  render(props) {
    return (
      <>
        <FormControl
          size="small"
          sx={{
            // minWidth: this.props.minWidth||195,
            // maxWidth: 200,
            width:"100%",
            fontFamily: (theme) => theme.fontFamily,
          }}
          readOnly={this.props.disabled}
        >
          <InputLabel
            sx={{ fontFamily: (theme) => theme.fontFamily, color: "#0A2351" }}
          >
            {this.props.label}*
          </InputLabel>
          <MySelect
            id={this.props.id}
            name={this.props.id}
            label={this.props.label}
            onChange={this.props.onChange}
            value={this.props.value}
            readOnly={this.props.disabled}
            sx={{
              "& .MuiInputBase-input,": {
                fontSize: (theme) => theme.form.fontSize,
                color:"red"
              },
            }}
            required={this.props.required}
          >
            {this.props.data.map((option) => (
              <MenuItem
                key={option.key}
                sx={{
                  fontFamily: (theme) => theme.fontFamily,
                  fontSize: (theme) => theme.form.fontSize,
                  textTransform: "uppercase",
                }}
                value={option.key}
              >
                {option.value}
              </MenuItem>
            ))}
          </MySelect>
        </FormControl>
      </>
    );
  }
}
export class LargeInputAutoComSelectField extends React.Component {
  render(props) {
    return (
      <>
        <Autocomplete
          componentsProps={{ paper: { sx: { fontSize: 13, minWidth: 300 } } }}
          sx={{
            minWidth: "100%",
            maxWidth: "100%",
            "& .MuiFormControl-root-MuiTextField-root": {
              fontFamily: (theme) => theme.fontFamily,
              fontSize: (theme) => theme.form.fontSize,
              color: "#0A2351",
            },
            backgroundColor: "white",
            "& .MuiFormLabel-root": {
              color: "#0A2351",
              fontFamily: (theme) => theme.fontFamily,
            },
            "& .MuiInputBase-input": {
              fontFamily: (theme) => theme.fontFamily,
              fontSize: (theme) => theme.form.fontSize,
              color: "#0A2351",
              textTransform: "uppercase",
            },
            "& .MuiAutocomplete-popper,.MuiAutocomplete-popperDisablePortal": {
              fontFamily: (theme) => theme.fontFamily,
              fontSize: (theme) => theme.form.fontSize,
            },
          }}
          size="small"
          id={this.props.id}
          value={this.props.value}
          readOnly={this.props.disabled}
          loading={this.props.options.length === 0}
          options={this.props.options}
          onChange={this.props.onChange}
          // getOptionLabel={this.props.getOptionLabel}
          isOptionEqualToValue={(option, value) => option === value}
          getOptionLabel={(option) => {
            const label = this.props.getOptionLabel(option);

            return typeof label === "string" ? label.toUpperCase() : "";
          }}
          filterOptions={(options, { inputValue }) => {
            const inputTerms = inputValue.trim().toLowerCase().split(" ");
            return options.filter((option) => {
              // Customize the condition based on your requirements
              const optionLabel = this.props
                .getOptionLabel(option)
                .toLowerCase();

              // Check if all search terms are present in the option label
              return inputTerms.every((term) => optionLabel.includes(term));
            });
          }}
          autoHighlight={true}
          renderInput={(params) => (
            <TextField
              sx={{
                display: "inline-block",
              }}
              {...params}
              label={this.props.label}
              required={this.props.required}
            />
          )}
        />
      </>
    );
  }
}
export class InputAutoComSelectField extends React.Component {
  render(props) {
    return (
      <>
        <Autocomplete
          componentsProps={{ paper: { sx: { width: 300, fontSize: 13 } } }}
          sx={{
            minWidth: 200,
            maxWidth: 220,
            "& .MuiFormControl-root-MuiTextField-root": {
              fontFamily: (theme) => theme.fontFamily,
              fontSize: (theme) => theme.form.fontSize,
              color: "#0A2351",
            },
            backgroundColor: "white",
            "& .MuiFormLabel-root": {
              color: "#0A2351",
              fontFamily: (theme) => theme.fontFamily,
            },
            "& .MuiInputBase-input": {
              fontFamily: (theme) => theme.fontFamily,
              fontSize: (theme) => theme.form.fontSize,
              color: "#0A2351",
              textTransform: "uppercase",
            },
            "& .MuiAutocomplete-popper,.MuiAutocomplete-popperDisablePortal": {
              fontFamily: (theme) => theme.fontFamily,
              fontSize: (theme) => theme.form.fontSize,
            },
          }}
          size="small"
          id={this.props.id}
          value={this.props.value}
          readOnly={this.props.disabled}
          loading={this.props.options.length === 0}
          options={this.props.options}
          onChange={this.props.onChange}
          onMouseEnter={this.props.onMouseEnter}
          // getOptionLabel={this.props.getOptionLabel}
          getOptionLabel={(option) => {
            const label = this.props.getOptionLabel(option);

            return typeof label === "string" ? label.toUpperCase() : "";
          }}
          filterOptions={(options, { inputValue }) => {
            const inputTerms = inputValue.trim().toLowerCase().split(" ");
            return options.filter((option) => {
              // Customize the condition based on your requirements
              const optionLabel = this.props
                .getOptionLabel(option)
                .toLowerCase();

              // Check if all search terms are present in the option label
              return inputTerms.every((term) => optionLabel.includes(term));
            });
          }}
          autoHighlight={true}
          renderInput={(params) => (
            <TextField
              sx={{
                display: "inline-block",
              }}
              {...params}
              label={this.props.label}
              required={this.props.required}
            />
          )}
        />
      </>
    );
  }
}
export class InputAutoComTableSelectField extends React.Component {
  render(props) {
    return (
      <>
        <Autocomplete
          componentsProps={{ paper: { sx: { width: 150, fontSize: 12 } } }}
          sx={{
            minWidth: 100,
            maxWidth: 150,
            "& .MuiFormControl-root-MuiTextField-root": {
              fontFamily: (theme) => theme.fontFamily,
              fontSize: (theme) => theme.form.fontSize,
              color: "#0A2351",
            },
            backgroundColor: "white",
            "& .MuiFormLabel-root": {
              color: "#0A2351",
              fontFamily: (theme) => theme.fontFamily,
            },
            "& .MuiInputBase-input": {
              fontFamily: (theme) => theme.fontFamily,
              fontSize: (theme) => theme.form.fontSize,
              color: "#0A2351",
              textTransform: "uppercase",
            },
            "& .MuiAutocomplete-popper,.MuiAutocomplete-popperDisablePortal": {
              fontFamily: (theme) => theme.fontFamily,
              fontSize: (theme) => theme.form.fontSize,
            },
          }}
          size="small"
          id={this.props.id}
          value={this.props.value}
          readOnly={this.props.disabled}
          loading={this.props.options.length === 0}
          options={this.props.options}
          onChange={this.props.onChange}
          // getOptionLabel={this.props.getOptionLabel}
          getOptionLabel={(option) => {
            const label = this.props.getOptionLabel(option);

            return typeof label === "string" ? label.toUpperCase() : "";
          }}
          filterOptions={(options, { inputValue }) => {
            const inputTerms = inputValue.trim().toLowerCase().split(" ");
            return options.filter((option) => {
              // Customize the condition based on your requirements
              const optionLabel = this.props
                .getOptionLabel(option)
                .toLowerCase();

              // Check if all search terms are present in the option label
              return inputTerms.every((term) => optionLabel.includes(term));
            });
          }}
          autoHighlight={true}
          renderInput={(params) => (
            <TextField
              sx={{
                display: "inline-block",
              }}
              {...params}
              label={this.props.label}
              required={this.props.required}
            />
          )}
        />
      </>
    );
  }
}

export class RadioButtonsField extends React.Component {
  render(props) {
    return (
      <>
        <FormControl>
          <FormLabel id="RDG1">{this.props.label}</FormLabel>
          <RadioGroup
            row
            aria-labelledby="RDG1"
            id={this.props.id}
            name={this.props.id}
            onChange={this.props.onChange}
            value={this.props.value}
          >
            {this.props.data.map((radio) => (
              <FormControlLabel
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontFamily: (theme) => theme.fontFamily,
                    fontSize: (theme) => theme.form.fontSize,
                  },
                }}
                key={radio.value}
                value={radio.value}
                control={<Radio size="small" />}
                label={radio.label}
                disabled={radio.disabled}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </>
    );
  }
}

const MyButton = styled(Button)(({ theme }) => ({
  fontFamily: theme.fontFamily,
}));

export class PrimaryButton extends React.Component {
  render(props) {
    return (
      <>
        <MyButton
          id={this.props.id}
          variant="contained"
          color="primary"
          disabled={this.props.disabled}
          onClick={this.props.onClick}
          startIcon={this.props.startIcon}
          endIcon={this.props.endIcon}
          style={this.props.style}
        >
          <Typography noWrap>  {this.props.name}</Typography>
        </MyButton>
      </>
    );
  }
}

export class DangerButton extends React.Component {
  render(props) {
    return (
      <>
        <MyButton
          variant="contained"
          color="error"
          onClick={this.props.onClick}
          disabled={this.props.disabled}
        >
          {this.props.name}
        </MyButton>
      </>
    );
  }
}

export class SuccessButton extends React.Component {
  render(props) {
    return (
      <>
        <MyButton
          variant="contained"
          color="success"
          type="submit"
          disabled={this.props.disabled}
          onClick={this.props.onClick}
          startIcon={this.props.startIcon}
          endIcon={this.props.endIcon}
        >
          {this.props.name}
        </MyButton>
      </>
    );
  }
}

export class ListSearch extends React.Component {
  render() {
    return (
      <>
        <Grid
          item
          style={{
            padding: "10px",
            height: "auto",
            position: "sticky",
            top: "0",
            backgroundColor: "silver",
          }}
        >
          <Paper
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: "auto",
              height: 35,
            }}
          >
            <InputBase
              className="col-md-1"
              sx={{ ml: 1, flex: 1, fontFamily: (theme) => theme.fontFamily }}
              placeholder="Search "
              onChange={this.props.onChange}
              value={this.props.value}
            />
            <IconButton
              type="button"
              sx={{ p: "10px" }}
              aria-label="search"
              onClick={this.props.onClickVoice}
            >
              <MicIcon />
            </IconButton>
            <IconButton
              type="button"
              sx={{ p: "10px" }}
              aria-label="search"
              onClick={this.props.onClickClear}
            >
              {!this.props.hidden ? <SearchIcon /> : <ClearIcon />}
            </IconButton>
          </Paper>
        </Grid>
      </>
    );
  }
}
export class ListSearchClosed extends React.Component {
  render() {
    return (
      <>
        <Grid
          item
          style={{
            padding: "10px",
            height: "auto",
            position: "sticky",
            // top: "0",
            top: "3em",
            backgroundColor: "silver",
          }}
        >
          <Paper
            component="form"
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: "auto",
              height: 35,
            }}
          >
            <InputBase
              className="col-md-1"
              sx={{ ml: 1, flex: 1, fontFamily: (theme) => theme.fontFamily }}
              placeholder="Search "
              onChange={this.props.onChange}
            />
            <IconButton
              type="button"
              sx={{ p: "10px" }}
              aria-label="search"
              onClick={this.props.onClick}
            >
              <SearchIcon />
            </IconButton>
          </Paper>
        </Grid>
      </>
    );
  }
}

export class SearchButton extends React.Component {
  render(props) {
    return (
      <>
        <MyButton
          variant="contained"
          onClick={this.props.onClick}
          disabled={this.props.disabled}
        >
          <SearchIcon />
          {this.props.name}
        </MyButton>
      </>
    );
  }
}

const MyIconButton = styled(IconButton)(({ theme }) => ({
  fontFamily: theme.fontFamily,
}));

export class AddClearIconButton extends React.Component {
  render() {
    return (
      <>
        <Toolbar style={{ justifyContent: "center", minHeight: "100%" }}>
          <MyIconButton
            size="small"
            sx={{ p: 0, color: "black" }}
            onClick={this.props.onClick}
          >
            <AddIcon />
          </MyIconButton>
        </Toolbar>
      </>
    );
  }
}

// Page Title
// const MyPageTitle = styled(Typography)(({ theme }) => ({
//   fontFamily: theme.fontFamily,
//   fontSize: theme.typography.pageTitle.title.fontSize,
//   fontWeight: "bold",
//   backgroundColor: "white",
//   textAlign: "center",

// }));

export class PageTitle extends React.Component {
  render(props) {
    return (
      <>
        {/* <h3
          style={{
            fontWeight: "bold",
            fontSize: 22,
            textTransform: "uppercase",
          }}
          className="text-secondary bg-white py-1 rounded"
        >
          {this.props.title}
        </h3> */}
        <h3
          style={{
            fontWeight: "bold",
            fontSize: 22,
            textTransform: "uppercase",
            color: "#333", // Adjust the color as needed
            backgroundColor: "#DFF2FF",
            padding: "8px 12px",
            borderRadius: "8px",
          }}
          className="text-secondary"
        >
          {this.props.title}
        </h3>
      </>
    );
  }
}

// Page Sub Title
const MyPageSubTitle = styled(Typography)(({ theme }) => ({
  fontFamily: theme.fontFamily,
  fontSize: theme.typography.pageTitle.subTitle.fontSize,
  fontWeight: "bold",
}));

export class PageSubTitle extends React.Component {
  render(props) {
    return (
      <>
        <Toolbar
          style={{
            justifyContent: "center",
            minHeight: "100%",
            // backgroundColor: "#e8e8f3",
            // zIndex: 10,
          }}
        >
          <MyPageSubTitle noWrap>{this.props.title}</MyPageSubTitle>
        </Toolbar>
      </>
    );
  }
}

// Title
const MyTitle = styled(Typography)(({ theme }) => ({
  fontFamily: theme.fontFamily,
  // fontSize: theme.typography.title.fontSize,
  fontWeight: "bold",
}));

export class Title extends React.Component {
  render(props) {
    return (
      <>
        <MyTitle noWrap>{this.props.title}</MyTitle>
      </>
    );
  }
}

// Sub Title
const MySubTitle = styled(Typography)(({ theme }) => ({
  fontFamily: theme.fontFamily,
  // fontSize: theme.typography.subTitle.fontSize,
  fontWeight: "bold",
}));

export class SubTitle extends React.Component {
  render(props) {
    return (
      <>
        <MySubTitle noWrap color={this.props.color}>
          {this.props.title}
        </MySubTitle>
      </>
    );
  }
}

// Caption
const MyCaption = styled(Typography)(({ theme }) => ({
  fontFamily: theme.fontFamily,
  fontSize: theme.typography.caption.fontSize,
}));

export class Caption extends React.Component {
  render(props) {
    return (
      <>
        <Tooltip title={this.props.title}>
          <MyCaption noWrap>{this.props.title}</MyCaption>
        </Tooltip>
      </>
    );
  }
}

export class TableTextField extends React.Component {
  render(props) {
    return (
      <>
        <MyTextField
          id={this.props.id}
          name={this.props.id}
          value={this.props.value}
          onChange={this.props.onChange}
          InputProps={{
            style: {
              height: "30px",
              margin: 0,
              minWidth: "100px",
              maxWidth: "100px",
            },
            inputProps: {
              maxLength: this.props.maxLength,
              readOnly: this.props.disabled,
            },
          }}
          sx={{
            backgroundColor: "unset",
            "& .MuiInputBase-root": {
              padding: 0,
              margin: 0,
            },
            "& .MuiInputBase-input,": {
              px: 1,
              py: 0,

              backgroundColor: "unset",
              fontSize: "13px",
              fontWeight: "bold",
            },
          }}
        />
      </>
    );
  }
}
export class TableTextAddressField extends React.Component {
  render(props) {
    return (
      <>
        <MyTextField
          id={this.props.id}
          name={this.props.id}
          value={this.props.value}
          onChange={this.props.onChange}
          InputProps={{
            style: {
              height: "30px",
              margin: 0,
              minWidth: "140px",
              maxWidth: "140px",
            },
            inputProps: {
              readOnly: this.props.disabled,
            },
          }}
          sx={{
            backgroundColor: "unset",
            "& .MuiInputBase-root": {
              padding: 0,
              margin: 0,
            },
            "& .MuiInputBase-input,": {
              px: 1,
              py: 0,

              backgroundColor: "unset",
              fontSize: "13px",
              fontWeight: "bold",
            },
          }}
        />
      </>
    );
  }
}

export class TableAmountField extends React.Component {
  render(props) {
    return (
      <>
        <MyTextField
          id={this.props.id}
          name={this.props.id}
          value={this.props.value}
          type="number"
          onWheel={(e) => e.target.blur()}
          onKeyUp={this.props.onKeyUp}
          onChange={this.props.onChange}
          //disabled={this.props.disabled}
          InputProps={{
            style: {
              height: "30px",
              margin: 0,
              minWidth: "60px",
              maxWidth: "70px",
            },
            inputProps: { readOnly: this.props.disabled },
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
              fontSize: "11px",
              fontWeight: "bold",
            },
          }}
        />
      </>
    );
  }
}
export class TableQuantityField extends React.Component {
  render(props) {
    return (
      <>
        <MyTextField
          id={this.props.id}
          name={this.props.id}
          value={this.props.value}
          type="number"
          onWheel={(e) => e.target.blur()}
          onKeyUp={this.props.onKeyUp}
          onChange={this.props.onChange}
          //disabled={this.props.disabled}
          InputProps={{
            style: {
              height: "30px",
              margin: 0,
              minWidth: "60px",
              maxWidth: "70px",
            },
            inputProps: {
              readOnly: this.props.disabled,
              min: this.props.min,
              tabIndex: this.props.tabIndex,
            },
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
}

export class TableQuantityFieldSmall extends React.Component {
  render(props) {
    return (
      <>
        <MyTextField
          id={this.props.id}
          name={this.props.id}
          value={this.props.value}
          type="number"
          onWheel={(e) => e.target.blur()}
          onKeyUp={this.props.onKeyUp}
          onChange={this.props.onChange}
          onBlur={this.props.onBlur}
          //disabled={this.props.disabled}
          InputProps={{
            style: {
              height: "30px",
              margin: 0,
              minWidth: "45px",
              maxWidth: "45px",
            },
            inputProps: {
              readOnly: this.props.disabled,
              min: this.props.min,
              tabIndex: this.props.tabIndex,
            },
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
}

export class TableSelectInputField extends React.Component {
  render(props) {
    return (
      <>
        <MySelect
          id={this.props.id}
          name={this.props.id}
          label={this.props.label}
          onChange={this.props.onChange}
          // value={this.props.value || (this.props.data.length > 0 ? this.props.data[0].key : null)}
          value={this.props.value}
          onClick={this.props.onClick}
          readOnly={this.props.disabled}
          size="small"
          sx={{
            height: "30px",
            minWidth: 120,
            maxWidth: 120,
            "& .MuiInputBase-input,": {
              fontSize:11,
              fontWeight: "bold",
              color: "#0A2351",
            },
          }}
        >
          {this.props.data.map((option) => (
            <MenuItem
              key={option.key}
              sx={{
                fontFamily: (theme) => theme.fontFamily,
                fontSize: (theme) => theme.form.fontSize,
                textTransform: "uppercase",
              }}
              value={option.key}
            >
              {option.value}
            </MenuItem>
          ))}
        </MySelect>
      </>
    );
  }
}

export class StatusCheckboxInputs extends React.Component {
  render(props) {
    return (
      <>
        <FormControlLabel
          sx={{
            "& .MuiTypography-root": {
              fontSize: "15px",
            },
          }}
          control={
            <Checkbox
              id={this.props.id}
              name={this.props.id}
              size="small"
              checked={this.props.checked}
              onChange={this.props.onChange}
              disabled={this.props.disabled}
              onClick={this.props.onClick}
              sx={{
                fontFamily: (theme) => theme.fontFamily,
                paddingRight: 1,
              }}
            />
          }
          label={this.props.label}
        />
      </>
    );
  }
}
