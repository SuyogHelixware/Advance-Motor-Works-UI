import { Grid, Paper, Typography } from "@mui/material";
import TileComponent from "../Components/TileComponent";
import useAuth from "../../Routing/AuthContext";

export default function Master() {
  const { user } = useAuth();
  const MasterCard = [
    {
      id: "61",
      Name: "Item Master",
      Count: 10,
      ReDirect: "item-master",
    },
    {
      id: "351",
      Name: "Technician Master",
      Count: 100,
      ReDirect: "technician-master",
    },
    {
      id: "352",
      Name: "Sales Target",
      Count: 100,
      ReDirect: "salesTarget",
    },
    {
      id: "353",
      Name: "QC Master",
      Count: 100,
      ReDirect: "qc-master",
    },
    {
      id: "354",
      Name: "Jack Master",
      Count: 100,
      ReDirect: "jack-master",
    },
    {
      id: "62",
      Name: "UoM Master",
      Count: 10,
      ReDirect: "uom-master",
    },
    {
      id: "63",
      Name: "Business Partner",
      Count: 10,
      ReDirect: "business-partner",
    },
    {
      id: "64",
      Name: "BinLocation Master",
      Count: 10,
      ReDirect: "bin-location-master",
    },
    {
      id: "65",
      Name: "Warehouse Master",
      Count: 10,
      ReDirect: "werehouse-master",
    },
  ];

  const allowedMenuIds = user.SubMenus.flatMap((menu) => menu.MenuId);
  const filteredCards = MasterCard.filter((card) =>
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
            Master Data
          </Typography>
        </Paper>
      </Grid>

      {/* <Grid container spacing={2} padding={2} columnGap={5} rowGap={4}>
        {card_master.map((data, index) => (
          <Grid item key={index} xs={12} sm={4} md={3} lg={2}>
            <TileComponent
              cardName={data.Name}
              cardCount={data.Count}
              to={data.ReDirect}
            />
          </Grid>
        ))}
      </Grid> */}
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
