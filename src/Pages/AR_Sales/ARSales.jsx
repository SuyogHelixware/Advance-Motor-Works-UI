import { Grid, Paper, Typography } from '@mui/material';
import React from 'react';
import TileComponent from '../Components/TileComponent';
export default function ARSales() {
   
    const Cards_sales=[
        // {
        //     id: "1",
        //     Name: "Item Search",
        //     Count:0,
        //     ReDirect: "dynamic-search",
        //   },
        //   {
        //     id: "2",
        //     Name: "Quotation / SO",
        //     Count: "0",
        //     ReDirect: "quotation",
        //   },
        //   {
        //     id: "3",
        //     Name: "Additional Payment",
        //     Count: 0,
        //     ReDirect: "Additional-Payment",
        //   },
          {
            id: "4",
            Name: "Book Appointment",
            Count: 0,
            ReDirect: "booking-appointment",
          },
        
          {
            id: "5",
            Name: "Material Request",
            Count: 0,
            ReDirect: "material-request",
          },
          // {
          //   id: "6",
          //   Name: "Invoice",
          //   Count:0,
          //   ReDirect: "cash-invoice",
          // },
          // {
          //   id: "8",
          //   Name: "Order Cancellation",
          //   Count: 0,
          //   ReDirect: "order-cancellation",
          // },
          // {
          //   id: "9", 
          //   Name: "Customer Sales History",
          //   Count: 0,
          //   ReDirect: "customer-sales-history",
          // },
        ];
          
  return (<>
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
        AR SALES
      </Typography>
    </Paper>
  </Grid>
   <Grid container spacing={2} padding={2} columnGap={5} rowGap={4} >
    {Cards_sales.map((data, index) => (
      <Grid item key={index} xs={12} sm={4} md={3} lg={2}>
                   <TileComponent cardName={data.Name} cardCount={data.Count} to={data.ReDirect} />

      </Grid>
    ))}
  </Grid>
  </>
   
  )
}
