import { Grid, Paper, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useCounterPolling } from "../../Hooks/useCounterPolling";
import useAuth from "../../Routing/AuthContext";
import TileComponent from "../Components/TileComponent";

export default function Banking() {
  const { user } = useAuth();
  const location = useLocation();
  useCounterPolling("Banking", location.key);
  const counters = useSelector((state) => state.counter.Counterdata);
  // const loading = useSelector((state) => state.counter.loading);

  const Cards_Banking = [
    {
      id: "76",
      Name: "Incoming Payments",
      Count: counters?.Incoming ?? 0,
      ReDirect: "incoming-payment",
    },
    {
      id: "77",
      Name: "Outgoing Payments",
      Count: counters?.Outgoing ?? 0,
      ReDirect: "outgoing-payment",
    },
  ];

  const allowedMenuIds = user.SubMenus.flatMap((menu) => menu.MenuId);
  const filteredCards = Cards_Banking.filter((card) =>
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
            Banking
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
