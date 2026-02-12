import { Grid, Paper, Typography } from "@mui/material";
import React from "react";
import TileComponent from "../Components/TileComponent";
import useAuth from "../../Routing/AuthContext";

export default function Admin() {
  const {user}=useAuth()

  const cardData = [
    {
      id: "11",
      Name: "Role Creation",
      Count: 100,
      ReDirect: "role-masterNew",
    },
    {
      id: "12",
      Name: "Role Mapping",
      Count: 100,
      ReDirect: "role-master",
    },
  
    {
      id: "13",
      Name: "User Creation",
      Count: 100,
      ReDirect: "user-creation",
    },
    {
      id: "14",
      Name: "Company Details",
      Count: 100,
      ReDirect: "company-details",
    },
     {
      id: "15",
      Name: "Email Setup",
      Count: 100,
      ReDirect: "Emailsetup",
    },
    // {
    //   id: "44",
    //   Name: "Integration Details",
    //   Count: 100,
    //   ReDirect: "inte-info-log",
    // },
    // {
    //   id: "45",
    //   Name: "Intergration Error Log",
    //   Count: 100,
    //   ReDirect: "inte-error-log",
    // },
  ];

const allowedMenuIds = user.SubMenus.flatMap(menu => menu.MenuId); 

const filteredCards = cardData.filter(card => 
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
            ADMIN
          </Typography>
        </Paper>
      </Grid>
      <Grid container spacing={2} padding={2} columnGap={5} rowGap={4}>
        {filteredCards.map((data, index) => (
          <Grid item key={index} xs={12} sm={4} md={3} lg={2} >
                     <TileComponent cardName={data.Name} cardCount={data.Count} to={data.ReDirect} />

          </Grid>
        ))}
      </Grid>
    </>
  );
}
