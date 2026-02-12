import SearchIcon from "@mui/icons-material/Search";
import { IconButton, InputBase, Paper } from "@mui/material";
import React from "react";
import ClearIcon from "@mui/icons-material/Clear";

export default function SearchInputField(props) {


  return (
    <>
      <Paper
        component="form"
        elevation={5}
        sx={{
          p: "0px 1px",
          display: "flex",
          alignItems: "center",
          height: 35,
          marginBottom:"6px"
        }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search ..."
          inputProps={{ "aria-label": "search ..." }}
          onChange={props.onChange}
          value={props.value}

        />
        <IconButton
          type="button"
          sx={{ p: "10px" }}
          aria-label="search"
          onClick={props.onClickClear}
        >
          {!props.value ? <SearchIcon /> : <ClearIcon />}
        </IconButton>
      </Paper>
    </>
  );
}
