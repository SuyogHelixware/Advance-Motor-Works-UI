import { Card, CardContent, Grid, Icon, Typography } from "@mui/material";
import React from "react";
import CountUp from "react-countup";
import "./TileComponent.css";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import { Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";


export default function TileComponent(props) {
  const theme = useTheme();

  return (
    <>
      <Card
        sx={{
          height: 150,
          padding: 1,
          width: 150,
          fontFamily: "montserrat-Regular",
        }}
        className="card-style"
      >
        <Link style={{ textDecoration: "none",
          
                  
          color:theme.palette.mode === "light" ? "black" : "white",    }} to={props.to}>
          <CardContent>
            <Grid>
              <Grid item sx={{ height: 80 }}>
                <Typography
                  variant="p"
                  sx={{ fontWeight: "700", textAlign: "center" }}
                  component="div"
                >
                  {props.cardName}
                </Typography>
              </Grid>
              <Grid item sx={{ height: 20 }}>
                <Typography
                  variant="h5"
                  component="div"
                  sx={{ fontWeight: "400", textAlign: "center" }}
                >
                  <Icon sx={{ p: 0.5 }}>
                    <PermIdentityOutlinedIcon />
                  </Icon>
                  <i className="bi bi-person"></i>
                  <CountUp end={props.cardCount} />
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Link>
      </Card>
    </>
  );
}
