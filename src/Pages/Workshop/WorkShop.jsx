import { Grid, Paper, Typography } from "@mui/material";
import useAuth from "../../Routing/AuthContext";
import TileComponent from "../Components/TileComponent";
export default function WorkShop() {
  const { user } = useAuth();
  const Cards_workshop = [
    {
      id: "363",
      Name: "Inward Vehicle",
      Count: 20,
      ReDirect: "inward-vehicle",
    },
    {
      id: "364",
      Name: "Job Card",
      Count: 20,
      ReDirect: "job-card",
    },
    {
      id: "365",
      Name: "OutWard Vehicle",
      Count: 20,
      ReDirect: "outward-vehicle",
    },
    {
      id: "366",
      Name: "Appointment Screen",
      Count: 20,
      ReDirect: "/daily-appointments",
    },
  ];

  const allowedMenuIds = user.SubMenus.flatMap((menu) => menu.MenuId);

  const PermissionCard = Cards_workshop.filter((card) =>
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
            WORKSHOP
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
