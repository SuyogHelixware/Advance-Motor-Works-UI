import { Grid, Paper, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useCounterPolling } from "../../Hooks/useCounterPolling";
import useAuth from "../../Routing/AuthContext";
import TileComponent from "../Components/TileComponent";

export default function Inventory() {
  const {user}=useAuth()
     const location = useLocation();
     useCounterPolling("Inventory",location.key)
    const counters = useSelector((state) => state.counter.Counterdata);
    // const loading = useSelector((state) => state.counter.loading);
   

  const Cards_Inventory = [
    {
      id: "86",
      Name: "Goods Issue",
      Count:counters?.InvGoodsIss ?? 0,
      ReDirect: "goods-issue",
    },
    {
      id: "87",
      Name: "Goods Reciept",
      Count:counters?.InvGoodsRecei ?? 0,
      ReDirect: "goods-receipt",
    },
    {
      id: "88",
      Name: "Inventory Transfer",
      Count:counters?.InvTrans ?? 0,
      ReDirect: "inventory-transfer",
    },
    {
      id: "89",
      Name: "Inventory Opening Balance",
     Count:counters?.InvOpenBal ?? 0,
      ReDirect: "inventory-opening-balance",
    },
    {
      id: "90",
      Name: "Inventory Counting",
      Count:counters?.InvCount ?? 0,
      ReDirect: "stock-counting",
    },
    {
      id: "91",
      Name: "Inventory Posting",
     Count:counters?.InvPost ?? 0,
      ReDirect: "stock-posting",
    },
    {
      id: "92",
      Name: "Inventory Revaluation",
      Count:counters?.InvReval ?? 0,
      ReDirect: "inventory-revaluation",
    },
    {
      id: "93",
      Name: "Price List",
       Count:counters?.PriceList ?? 0,
      ReDirect: "inventory-price-list",
    },
  ];

  
const allowedMenuIds = user.SubMenus.flatMap(menu => menu.MenuId); 
const filteredCards = Cards_Inventory.filter(card => 
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
            Inventory
          </Typography>
        </Paper>
      </Grid>

      <Grid container spacing={2} padding={2} columnGap={5} rowGap={4}>
        {filteredCards.map((data, index) => (
          <Grid item key={index} xs={12} sm={4} md={3} lg={2}>
            {/* <Link
              style={{ textDecoration: "none", color: "black" }}
              to={data.ReDirect}
            > */}
              <TileComponent cardName={data.Name} cardCount={data.Count} to={data.ReDirect} />
            {/* </Link> */}
          </Grid>
        ))}
      </Grid>
    </>
  );
}
