import { Card, Grid, Tooltip, Typography, useTheme } from "@mui/material";
import React, { useMemo } from "react";

const highlightMatch = (text = "", search = "", backgroundColor = "") => {
  if (!search || !text.toLowerCase().includes(search.toLowerCase())) {
    return text; // Return plain text if no match
  }

  const parts = text.split(new RegExp(`(${search})`, "i"));
  return parts.map((part, index) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <span key={index} style={{ backgroundColor, fontWeight: "bold" }}>
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    )
  );
};

export default function CardComponentTwo(props) {
  const theme = useTheme(); // Get the theme here

  const highlightColor =
    theme.palette.mode === "dark" ? "rgba(255, 255, 0, 0.7)" : "yellow";

  const highlightedTitle = useMemo(
    () => highlightMatch(props.title, props.searchResult, highlightColor),
    [props.title, props.searchResult, highlightColor]
  );

  const highlightedSubtitle = useMemo(
    () => highlightMatch(props.subtitle, props.searchResult, highlightColor),
    [props.subtitle, props.searchResult, highlightColor]
  );


  return (
    <Card
      className="card-list"
      onClick={props.onClick}
      elevation={5}
      width="auto"
      sx={{
        p: 1,
        mb: 0.7,
        cursor: "pointer",
        backgroundColor: props.isSelected
        ? theme.palette.mode === "dark"
          ? "#424242" // Dark mode selected card color
          : "#f0f0f0" // Light mode selected card color
        : theme.palette.background.paper, // Default background
      border: props.isSelected ? "2px solid #007bff" : "1px solid #ccc",
      }}    >
      <Grid container height="50px">
      <Grid container item xs={12}>
          <Grid item xs={6} sx={{ textAlign: "left", px: 1 }}>
            <Typography noWrap fontWeight={"bold"}>{highlightedTitle}</Typography>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: "right", px: 1 }}>
            <Typography noWrap>{highlightedSubtitle}</Typography>
          </Grid>
        </Grid>
      </Grid>
    </Card>
  );
}
