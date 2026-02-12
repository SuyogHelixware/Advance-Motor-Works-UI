import { Grid, Paper, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useCounterPolling } from "../../Hooks/useCounterPolling";
import useAuth from "../../Routing/AuthContext";
import TileComponent from "../Components/TileComponent";

export default function Finance() {
  const { user } = useAuth();
        const location = useLocation();
        useCounterPolling("Finance",location.key)
      const counters = useSelector((state) => state.counter.Counterdata);
      // const loading = useSelector((state) => state.counter.loading);
     

  const Cards_Finance = [
    {
      id: "161",
      Name: "Chart of Accounts",
      Count:  counters?.ChartOfAcc ?? 0,
      ReDirect: "ChartOfAccount",
    },
    {
      id: "162",
      Name: "Journal Entry",
      Count: counters?.JournalEnt ?? 0,
      ReDirect: "JournalEntry",
    },
    {
      id: "163",
      Name: "G/L Account Determination",
      Count:counters?.GLAccDeter ?? 0,
      ReDirect: "GLAcctDetermination",
    },
    {
      id: "164",
      Name: "Exchange Rates and Indexes",
      Count: 0,
      ReDirect: "ExchangeRatesAndIndexes",
    },
    {
      id: "166",
      Name: "BP Opening Balance",
      Count: 0,
      ReDirect: "BPOpeningBalance",
    },
     {
      id: "165",
      Name: "GL Opening Balance",
      Count: 0,
      ReDirect: "GLOpeningBalance",
    },
  ];

  const allowedMenuIds = user.SubMenus.flatMap((menu) => menu.MenuId);
  console.log("fgfgd",allowedMenuIds)
  const PermissionCard = Cards_Finance.filter((card) =>
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
            Finance
          </Typography>
        </Paper>
      </Grid>

      <Grid container spacing={2} padding={2} columnGap={5} rowGap={4}>
        {PermissionCard.map((data, index) => (
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
