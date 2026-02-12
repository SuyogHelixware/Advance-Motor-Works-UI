import { Grid, Paper, Typography } from "@mui/material";
import React from "react";
import TileComponent from "../Components/TileComponent";
import useAuth from "../../Routing/AuthContext";

export default function HR() {
  const {user}=useAuth()
  const Cards_HR = [
    {
      id: "251",
      Name: "Employee Master",
      Count: 100,
      ReDirect: "EmployeeMaster",
    },
 
  ];

const allowedMenuIds = user.SubMenus.flatMap(menu => menu.MenuId); 
const filteredCards = Cards_HR.filter(card => 
  allowedMenuIds.includes(Number(card.id))
  
);
  return (
    <>
      <Grid
        container
        md={12}
        lg={12}
        sx={{
          width: "100%",

          mt: 2,

          mb: 2,
        }}
        elevation={4}
      >
        <Paper
          sx={{
            width: "100%",
          }}
        >
          <Typography
            width={"100%"}
            textAlign="center"
            textTransform="uppercase"
            fontWeight="bold"
            padding={1}
            noWrap
          >
            HR
          </Typography>
        </Paper>
      </Grid>

      <Grid container spacing={2} padding={2} columnGap={5} rowGap={4}>
        {filteredCards.map((data, index) => (
          <Grid item key={index} xs={12} sm={4} md={3} lg={2}>
            <TileComponent
              cardName={data.Name}
              cardCount={data.Count}
              to={data.ReDirect}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
