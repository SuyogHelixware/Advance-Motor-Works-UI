import { Card, Grid, Toolbar } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import { Caption, SubTitle, Title } from "../Components/FormInputs";

// Styled component for the card
const MyCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme?.palette?.background?.paper || "#ffffff", // Default fallback
  color: theme?.palette?.text?.primary || "#000000", // Default fallback
  width: "auto",
  height: "60px",
  marginBottom: "7px",
}));


// Main CardComponentList class
export default class CardComponentList extends React.Component {
  render(props) {
    return (
      <MyCard className="card-list" onClick={this.props.onClick}>
        <Grid container width="100%" height="100%" sx={{ padding: "6px" }}>
          <Grid
            item
            width="100%"
            height="50%"
            sx={{
              paddingLeft: "6px",
              paddingRight: "6px",
              textAlign: "left",
            }}
          >
            <Title title={this.props.name} />
          </Grid>
          <Grid container item width="100%" height="50%">
            <Grid
              item
              sx={{
                width: "50%",
                height: "100%",
                textAlign: "left",
                paddingLeft: "6px",
                paddingRight: "4px",
              }}
            >
              <SubTitle title={this.props.number} />
            </Grid>
            <Grid
              item
              sx={{
                width: "50%",
                height: "100%",
                textAlign: "right",
                paddingLeft: "4px",
                paddingRight: "6px",
              }}
            >
              <Caption title={this.props.description} />
            </Grid>
          </Grid>
        </Grid>
      </MyCard>
    );
  }
}

// Single Card component
export class CardsComponentListSingle extends React.Component {
  render(props) {
    return (
      <MyCard
        className="card-list"
        onClick={this.props.onClick}
        sx={{ textAlign: "left" }}
      >
        <Toolbar>
          <Title title={this.props.title} />
        </Toolbar>
      </MyCard>
    );
  }
}

// Double Card component
export class CardComponentListDouble extends React.Component {
  render(props) {
    return (
      <MyCard className="card-list" onClick={this.props.onClick}>
        <Grid container width="100%" height="100%" sx={{ padding: "6px" }}>
          <Grid
            item
            width="100%"
            height="50%"
            sx={{
              paddingLeft: "6px",
              paddingRight: "6px",
              textAlign: "left",
            }}
          >
            <Title title={this.props.name} />
          </Grid>

          <Grid
            item
            width="100%"
            height="50%"
            sx={{
              paddingLeft: "6px",
              paddingRight: "6px",
              textAlign: "left",
            }}
          >
            <Caption title={this.props.description} />
          </Grid>
        </Grid>
      </MyCard>
    );
  }
}
