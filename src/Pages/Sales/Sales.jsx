import { Grid, Paper, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useCounterPolling } from "../../Hooks/useCounterPolling";
import useAuth from "../../Routing/AuthContext";
import TileComponent from "../Components/TileComponent";

export default function Sales() {
  const { user } = useAuth();
  const location = useLocation();
  useCounterPolling("Sales", location.key);
  const counters = useSelector((state) => state.counter.Counterdata);
  // const loading = useSelector((state) => state.counter.loading);

  const Cards_Sales = [
    {
      id: "116",
      Name: "Sales Quotation",
      Count: counters?.SalesQuotation ?? 0,
      ReDirect: "Sales-quotation",
    },
    {
      id: "117",
      Name: (
        <span>
          Sales
          <br />
          Order
        </span>
      ),
      Count: counters?.SalesOrder ?? 0,
      ReDirect: "Sales-order",
    },

    {
      id: "118",
      Name: "Booking Appointment",
      Count: counters?.Delivery ?? 0,
      ReDirect: "booking-appointment",
    },
    {
      id: "118",
      Name: "Sales Delivery",
      Count: counters?.Delivery ?? 0,
      ReDirect: "Sales-delivery",
    },
    {
      id: "119",
      Name: "Sales Return",
      Count: counters?.SalesReturn ?? 0,
      ReDirect: "Sales-Return",
    },
    {
      id: "120",
      Name: "Sales Down Payment",
      Count: counters?.ARDownPayment ?? 0,
      ReDirect: "Sales-Down-Payment",
    },
    {
      id: "121",
      Name: "Sales Invoice",
      Count: counters?.ARInvoice ?? 0,
      ReDirect: "Sales-invoice",
    },
    {
      id: "122",
      Name: "Sales Credit Note",
      Count: counters?.ARCreditNote ?? 0,
      ReDirect: "Sales-credit-note",
    },
  ];
  const allowedMenuIds = user.SubMenus.flatMap((menu) => menu.MenuId);

  const PermissionCard = Cards_Sales.filter((card) =>
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
            Sales
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
