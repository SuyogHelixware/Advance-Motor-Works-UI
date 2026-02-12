import { Grid, Paper, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useCounterPolling } from "../../Hooks/useCounterPolling";
import useAuth from "../../Routing/AuthContext";
import TileComponent from "../Components/TileComponent";

export default function APPurchese() {
  const { user } = useAuth();
  //  const dispatch = useDispatch();
  const location = useLocation();
  // useCounterPolling("Purchase")
  useCounterPolling("Purchase", location.key);
  const counters = useSelector((state) => state.counter.Counterdata);

  // useEffect(() => {
  //   dispatch(fetchCounter("Purchase"));
  // }, [dispatch, location.key])
  const Cards_purchase = [
    {
      id: "131",
      Name: "Purchase Request ",
      Count: counters?.APRequest ?? 0,
      ReDirect: "purchase-request",
    },
    {
      id: "132",
      Name: "Purchase Quotation",
      Count: counters?.APQuotation ?? 0,
      ReDirect: "purchase-quotation",
    },
    {
      id: "133",
      Name: "Purchase Order ",
      Count: counters?.PurchaseOrder ?? 0,
      ReDirect: "purchase-order",
    },

    {
      id: "134",
      Name: "Goods Receipt PO",
      Count: counters?.GRPO ?? 0,
      ReDirect: "goods-receipt-note",
    },
    {
      id: "135",
      Name: "Goods Return ",
      Count: counters?.GoodReturn ?? 0,
      ReDirect: "purchase-goodsReturn",
    },
    {
      id: "136",
      Name: "Purchase Down Payment  ",
      Count: counters?.APDownPayment ?? 0,
      ReDirect: "APDown-Payment-Invoice",
    },
    {
      id: "137",
      Name: "Purchase Invoice",
      Count: counters?.APInvoice ?? 0,
      ReDirect: "purchase-invoice",
    },
    {
      id: "138",
      Name: "Purchase Credit Note",
      Count: counters?.APCreditNote ?? 0,
      ReDirect: "purchase-credit-note",
    },

    {
      id: "139",
      Name: "Landed Cost ",
      Count: 0,
      ReDirect: "landed-cost",
    },
    {
      id: "140",
      Name: "Procurement ETA",
      Count: 0,
      ReDirect: "procurement-eta",
    },
    {
      id: "141",
      Name: "Quotation Comparison",
      Count: 0,
      ReDirect: "purchase-comparison",
    },
  ];

  const allowedMenuIds = user.SubMenus.flatMap((menu) => menu.MenuId);

  const PermissionCard = Cards_purchase.filter((card) =>
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
            Purchase
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
