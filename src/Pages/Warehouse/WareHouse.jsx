import { Grid, Paper, Typography } from "@mui/material";
import TileComponent from "../Components/TileComponent";
export default function WareHouse() {
  const Cards_sales = [
    {
      id: "1",
      Name: "Issue Material",
      Count: 20,
      ReDirect: "issue-material",
    },
    {
      id: "2",
      Name: "Material Return",
      Count: 20,
      ReDirect: "material-return",
    },

    // {
    //   id: "3",
    //   Name: "BarCode Print",
    //   Count: 20,
    //   ReDirect: "BarCode",
    // },
  ];

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
        {Cards_sales.map((data, index) => (
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
