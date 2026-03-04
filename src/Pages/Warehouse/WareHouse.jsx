import { Grid, Paper, Typography } from "@mui/material";
import TileComponent from "../Components/TileComponent";
import useAuth from "../../Routing/AuthContext";
export default function WareHouse() {
  const Cards_warehouse = [
    {
      id: "367",
      Name: "Issue Material",
      Count: 20,
      ReDirect: "issue-material",
    },
    {
      id: "368",
      Name: "Material Return",
      Count: 20,
      ReDirect: "material-return",
    },

    {
      id: "369",
      Name: "BarCode Print",
      Count: 20,
      ReDirect: "BarCode",
    },
  ];

  const { user } = useAuth();
  const allowedMenuIds = user.SubMenus.flatMap((menu) => menu.MenuId);

  const PermissionCard = Cards_warehouse.filter((card) =>
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
            WAREHOUSE
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
