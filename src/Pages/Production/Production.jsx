 


import { Grid, Paper, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useCounterPolling } from '../../Hooks/useCounterPolling';
import useAuth from '../../Routing/AuthContext';
import TileComponent from '../Components/TileComponent';
export default function Production() {
   const {user}=useAuth()
       const location = useLocation();
       useCounterPolling("Production",location.key)
       const counters = useSelector((state) => state.counter.Counterdata);
  // const loading = useSelector((state) => state.counter.loading);


    const Cards_Pro=[
        {
            id: "101",
            Name: "Bill Of Material",
            Count: counters?.BillOfMat ?? 0,
            ReDirect: "BillOfMaterial",
          },
          {
            id: "102",
            Name: "Production Order",
            Count: counters?.ProducOrd ?? 0,
            ReDirect: "ProductionOrder",
          },
          {
            id: "103",
            Name: "Receipt for Production ",
            Count: counters?.ProducGoodsRecei ?? 0,
            ReDirect: "ReceiptProduction",
          },
          {
            id: "104",
            Name: "Issue for Production",
            Count: counters?.ProducGoodsIss ?? 0,
            ReDirect: "IssueProduction",
          },
          
        ];

        
const allowedMenuIds = user.SubMenus.flatMap(menu => menu.MenuId); 
const filteredCards = Cards_Pro.filter(card => 
  allowedMenuIds.includes(Number(card.id))
  
);
          
  return ( <> 
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
        PRODUCTION
      </Typography>
    </Paper>
  </Grid>
  
    <Grid container spacing={2} padding={2} columnGap={5} rowGap={4}>
    {filteredCards.map((data, index) => (
      <Grid item key={index} xs={12} sm={4} md={3} lg={2}>
                  <TileComponent cardName={data.Name} cardCount={data.Count} to={data.ReDirect} />

      </Grid>
    ))}
  </Grid>
  </>
  )
}
