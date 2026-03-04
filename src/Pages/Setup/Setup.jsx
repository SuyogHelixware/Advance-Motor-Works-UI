import { Grid, Paper, Typography } from "@mui/material";
import React from "react";
import TileComponent from "../Components/TileComponent";
import useAuth from "../../Routing/AuthContext";

export default function Setup() {
  const { user } = useAuth();
  const Cards_Setup = [
    {
      id: "51",
      Name: "Approval Stages AndTemplate",
      Count: 100,
      ReDirect: "ApprovalStageAndTemplate",
    },
    {
      id: "47",
      Name: "BarCodes",
      Count: 100,
      ReDirect: "BarCode",
    },
    {
      id: "53",
      Name: "Batch Management",
      Count: 100,
      ReDirect: "batch",
    },
    {
      id: "35",
      Name: "Banks",
      Count: 100,
      ReDirect: "banks",
    },
    {
      id: "21",
      Name: "BinLocation SubLevel",
      Count: 100,
      ReDirect: "binlocation-sublevel",
    },
    // {
    //   id: "45",
    //   Name: "BP Opening Balance",
    //   Count: 100,
    //   ReDirect: "business-partner-opening-balance",
    // },
    {
      id: "23",
      Name: "Business Partner Group",
      Count: 100,
      ReDirect: "BusinessPartnerGroup",
    },
    {
      id: "40",
      Name: "Country",
      Count: 100,
      ReDirect: "Country",
    },
    {
      id: "30",
      Name: "Credit Card",
      Count: 100,
      ReDirect: "credit-card",
    },
    {
      id: "24",
      Name: "Currencies",
      Count: 100,
      ReDirect: "Currencies",
    },
    //     {
    //   id: "43",
    //   Name: "Doc Series",
    //   Count: 100,
    //   ReDirect: "DocSeries",
    // },
    {
      id: "43",
      Name: "Document Series",
      Count: 100,
      ReDirect: "DocumentSeries",
    },

    {
      id: "54",
      Name: "Email Template",
      Count: 100,
      ReDirect: "EmailTemplate",
    },
    {
      id: "29",
      Name: "Freight",
      Count: 100,
      ReDirect: "freight",
    },
    {
      id: "46",
      Name: "General Setting",
      Count: 100,
      ReDirect: "general-setting",
    },
    //     {
    //   id: "44",
    //   Name: "Holiday Master",
    //   Count: 100,
    //   ReDirect: "holiday-master",
    // },
    {
      id: "32",
      Name: "HSN",
      Count: 100,
      ReDirect: "HSN",
    },
    {
      id: "34",
      Name: "Item Group",
      Count: 100,
      ReDirect: "item-group",
    },
    {
      id: "22",
      Name: "Landed cost",
      Count: 100,
      ReDirect: "Landed-cost-Setup",
    },
    {
      id: "38",
      Name: "Length And Width Setup",
      Count: 100,
      ReDirect: "LengthAndWidth",
    },
    {
      id: "37",
      Name: "Location",
      Count: 100,
      ReDirect: "Location",
    },
    {
      id: "25",
      Name: "Payment Term",
      Count: 100,
      ReDirect: "payment-term",
    },
    {
      id: "42",
      Name: "Posting Period",
      Count: 100,
      ReDirect: "PostingPeriod",
    },
    {
      id: "50",
      Name: "Report and Layout Manager",
      Count: 100,
      ReDirect: "ReportAndLayout",
    },
    {
      id: "31",
      Name: "SAC",
      Count: 100,
      ReDirect: "SAC",
    },
    {
      id: "49",
      Name: "Sales Employee",
      Count: 100,
      ReDirect: "SalesEmp",
    },
    {
      id: "52",
      Name: "Serial Number Management",
      Count: 100,
      ReDirect: "serial",
    },
    {
      id: "48",
      Name: "Service Category",
      Count: 100,
      ReDirect: "ServiceCategory",
    },

    {
      id: "33",
      Name: "Shipping Type",
      Count: 100,
      ReDirect: "ShipType",
    },
    {
      id: "41",
      Name: "State",
      Count: 100,
      ReDirect: "state",
    },

    {
      id: "26",
      Name: "Tax Category",
      Count: 10,
      ReDirect: "tax-Category",
    },
    {
      id: "28",
      Name: "Tax Code",
      Count: 100,
      ReDirect: "tax-Code",
    },
    {
      id: "27",
      Name: "Tax Type",
      Count: 10,
      ReDirect: "tax-Type",
    },

    {
      id: "36",
      Name: "Unit Of Measure Group",
      Count: 100,
      ReDirect: "unit-of-measure-group",
    },
    // {
    //   id: "7",
    //   Name: "House Banks",
    //   Count: 100,
    //   ReDirect: "house-banks",
    // },

    {
      id: "39",
      Name: "Weight Setup",
      Count: 100,
      ReDirect: "WeightSetup",
    },

    //  {
    //   id: "50",
    //   Name: "Document Series",
    //   Count: 100,
    //   ReDirect: "DocumentSeries",
    // },
    // {
    //   id: "13",
    //   Name: "Credit Card Payment Method",
    //   Count: 100,
    //   ReDirect: "credit-card-paymentmethod",
    // },

    // {
    //   id: "16",
    //   Name: "User Setup",
    //   Count: 100,
    //   ReDirect: "user-setup",
    // },
  ];
  const allowedMenuIds = user.SubMenus.flatMap((menu) => menu.MenuId);

  const filteredCards = Cards_Setup.filter((card) =>
    allowedMenuIds.includes(Number(card.id)),
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
            SETUP
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
