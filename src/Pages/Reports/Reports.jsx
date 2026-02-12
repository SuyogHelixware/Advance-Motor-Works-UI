import { Grid, Paper, Typography } from "@mui/material";
import React from "react";
import TileComponent from "../Components/TileComponent";

export default function Reports() {
  const card_reports = [
    // {
    //   id: 28,
    //   Name: "Daily Collection",
    //   Count: 20,
    //   ReDirect: "daily-collection",
    // },
    // {
    //   id: 47,
    //   Name: "BDM Sales Report",
    //   Count: 20,
    //   ReDirect: "BDM-Sales-Report",
    // },
    // {
    //   id: 48,
    //   Name: "Sales Analysis By Item Report",
    //   Count: 20,
    //   ReDirect: "sales-analysis-report",
    // },
    // {
    //   id: 49,
    //   Name: "Salesman sales Report",
    //   Count: 20,
    //   ReDirect: "salesman-sales-report",
    // },
    // {
    //   id: 29,
    //   Name: "Daily Appointment Sheet",
    //   Count: 20,
    //   ReDirect: "daily-appointment-sheet",
    // },
    // {
    //   id: 30,
    //   Name: "Daily Inward Sheet",
    //   Count: 20,
    //   ReDirect: "daily-inward-sheet",
    // },
    // {
    //   id: 31,
    //   Name: "Open Quotation Sheet",
    //   Count: 20,
    //   ReDirect: "open-quotation-sheet",
    // },
    // {
    //   id: 65,
    //   Name: "Open Quotation Summary",
    //   Count: 20,
    //   ReDirect: "open-quotation-summary",
    // },
    // {
    //   id: 32,
    //   Name: "Open SO Report",
    //   Count: 20,
    //   ReDirect: "open-so-report",
    // },
    // {
    //   id: 33,
    //   Name: "WMS Delivery Report",
    //   Count: 20,
    //   ReDirect: "wms-delivery-report",
    // },
    // {
    //   id: 34,
    //   Name: "Customer Feedback Report",
    //   Count: 20,
    //   ReDirect: "customer-feedback-report",
    // },
    // {
    //   id: 35,
    //   Name: "Open SO Update Report",
    //   Count: 20,
    //   ReDirect: "open-so-update-report",
    // },
    // {
    //   id: 36,
    //   Name: "Open SO By Salesman",
    //   Count: 20,
    //   ReDirect: "open-so-salesman",
    // },
    // {
    //   id: 37,
    //   Name: "Open SO With DP Summary",
    //   Count: 20,
    //   ReDirect: "open-so-with-dp",
    // },
    // {
    //   id: 38,
    //   Name: "Replenishment Report",
    //   Count: 20,
    //   ReDirect: "replenishment-report",
    // },
    // {
    //   id: 67,
    //   Name: "Vehicle Outward Sheet",
    //   Count: 20,
    //   ReDirect: "vehicle-outward-sheet",
    // },
     {
      id: "172",
      Name: "Query Generator",
      Count: 100,
      ReDirect: "QueryGenerator",
    },
     {
      id: "171",
      Name: "Preview Reports",
      Count: 100,
      ReDirect: "PreviewReport",
    },
  ];
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
        REPORTS
      </Typography>
    </Paper>
  </Grid>
    
    
      


    <Grid container spacing={2} padding={2} columnGap={5} rowGap={4}>
      {card_reports.map((data, index) => (
        <Grid item key={index} xs={12} sm={4} md={3} lg={2}>
                   <TileComponent cardName={data.Name} cardCount={data.Count} to={data.ReDirect} />

        </Grid>
      ))}
    </Grid>
    
    </>
  );
}
