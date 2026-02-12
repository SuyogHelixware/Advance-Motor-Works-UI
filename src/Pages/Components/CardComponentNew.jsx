import { Card, Grid, Tooltip, Typography, useTheme } from "@mui/material";
import React, { useMemo } from "react";

const highlightMatch = (text = "", search = "", backgroundColor = "") => {
  if (!search || !String(text).toLowerCase().includes(String(search).toLowerCase())) {
    return text;
  }

  const parts = text.split(new RegExp(`(${search})`, "i"));
  return parts.map((part, index) =>
    String(part).toLowerCase() === String(search).toLowerCase() ? (
      <span key={index} style={{ backgroundColor, fontWeight: "bold" }}>
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    )
  );
};

export default function CardComponentNew(props) {
  const theme = useTheme();

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

  const highlightedDescription = useMemo(
    () => highlightMatch(props.description, props.searchResult, highlightColor),
    [props.description, props.searchResult, highlightColor]
  );

  return (
    <Card
      className="card-list"
      onClick={props.onClick}
      elevation={3}
      width="auto"
      sx={{
        width: "100%", // <-- added this line

        p: 1,
        mb: 0.7,
        cursor: "pointer",
        backgroundColor: props.isSelected
          ? theme.palette.mode === "dark"
            ? "#424242"
            : "#f0f0f0"
          : theme.palette.background.paper,
        border: props.isSelected ? "2px solid #007bff" : "1px solid #ccc",
        "&:hover": {
          backgroundColor:
            theme.palette.mode === "dark" ? "#333" : "#f5f5f5", // subtle hover effect
        },
      }}
    >
      <Grid container height="50px">
        <Grid item xs={12} sx={{ textAlign: "left", px: 1 }}>
          <Tooltip title={props.title}>
            <Typography noWrap fontWeight="bold">
              {highlightedTitle}
            </Typography>
          </Tooltip>
        </Grid>

        <Grid container item xs={12}>
          <Grid item xs={6} sx={{ textAlign: "left", px: 1 }}>
            <Tooltip title={props.subtitle}>
              <Typography noWrap>{highlightedSubtitle}</Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: "right", px: 1 }}>
            <Tooltip title={props.description}>
              <Typography noWrap>{highlightedDescription}</Typography>
            </Tooltip>
          </Grid>
        </Grid>
      </Grid>
    </Card>
  );
}
