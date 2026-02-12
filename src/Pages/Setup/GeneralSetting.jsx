import React, { useState } from "react";

import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";

import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Radio,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";

import { Controller, useForm } from "react-hook-form";
import {
  InputSelectTextField,
  InputTextField,
} from "../Components/formComponents";
import usePermissions from "../Components/usePermissions";

export default function CompanyDetails() {
  // const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tabvalue, settabvalue] = useState(0);
  const [subtab, settab] = useState("0");
 const perms = usePermissions(46);

  const handletab = (event, tab) => {
    settab(tab);
  };
  // const toggleSidebar = () => {
  //   setSidebarOpen(!sidebarOpen);
  // };

  // const [checked, setChecked] = React.useState(false);

  // const handleCheckboxChange = (event) => {
  //   setChecked(event.target.checked);
  // };
  const handleTabChange = (event, newtab) => {
    settabvalue(newtab);
  };
  const { control, handleSubmit } = useForm({
    mode: "onChange",
  });

  const onsubmit = (data) => {
    console.log(data);
  };

  const [logo, setLogo] = useState(null);

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
  };

  return (
    <>
      <Grid
        container
        width="100%"
        height="calc(100vh - 110px)"
        position="relative"
        component={"form"}
        onSubmit={handleSubmit(onsubmit)}
      >
        {/* Sidebar for larger screens */}

        {/* User Creation Form Grid */}

        <Grid
          container
          item
          width="100%"
          height="100%"
          sm={12}
          md={12}
          lg={12}
          // component="form"
          position="relative"
        >
          {/* Hamburger Menu for smaller screens */}

          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            // onClick={ClearFormData}
            sx={{
              display: {}, // Show only on smaller screens

              position: "absolute",

              // top: "10px",

              right: "10px",
            }}
          >
            <RefreshIcon />
          </IconButton>

          <Grid
            item
            width={"100%"}
            py={0.5}
            alignItems={"center"}
            border={"1px solid silver"}
            borderBottom={"none"}
          >
            <Typography
              textAlign={"center"}
              alignContent={"center"}
              height={"100%"}
            >
              General Setting
            </Typography>
          </Grid>

          <Grid
            container
            item
            width={"100%"}
            height={"100%"}
            border={"1px silver solid"}
          >
            <Grid
              container
              item
              padding={1}
              md={12}
              sm={12}
              height="calc(100% - 40px)"
              overflow={"scroll"}
              sx={{ overflowX: "hidden" }}
              position={"relative"}
            >
              <Box
                component="form"
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                  width: "100%",
                }}
                noValidate
                autoComplete="off"
              >
                <Grid container>
                  <Grid container item>
                    <Grid
                      item
                      width="100%"
                      m={1}
                      gap={5}
                      border="1px solid grey"
                    >
                      <Tabs
                        value={tabvalue}
                        onChange={handleTabChange}
                        aria-label="disabled tabs example"
                        variant="scrollable" // Allows horizontal scrolling if needed
                        scrollButtons="auto"
                      >
                        <Tab value={0} label="Business partner(BP)" />
                        <Tab value={1} label="Mailer  Services" />
                        <Tab value={2} label="Path Select" />
                        <Tab value={3} label="Inventory" />
                        <Tab value={4} label="Print Peference" />
                        <Tab value={5} label=" Pricing" />

                        {/* <Tab value={2} label="Display" /> */}
                      </Tabs>
                      <Divider />
                      {tabvalue === 0 && (
                        <>
                          <Grid container>
                            <Grid container item md={4}>
                              <Grid
                                item
                                xs={12}
                                md={12}
                                lg={12}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="Credit Limit"
                                  control={control}
                                  defaultValue={false}
                                  rules={{
                                    required: "Please select Vehicle Type",
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap={true}
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Credit Limit 
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={12}
                                lg={12}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="Commitment Limit"
                                  control={control}
                                  defaultValue={false}
                                  rules={{
                                    required: "Please select Vehicle Type",
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap={true}
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Commitment Limit
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  )}
                                />
                              </Grid>
                            </Grid>
                            <Grid container item md={4}>
                              <Grid
                                item
                                xs={12}
                                md={12}
                                lg={12}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="A/R Invoice"
                                  control={control}
                                  defaultValue={false}
                                  rules={{
                                    required: "Please select Vehicle Type",
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap={true}
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          A/R Invoice
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={12}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="Delivery"
                                  control={control}
                                  defaultValue={false}
                                  rules={{
                                    required: "Please select Vehicle Type",
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap={true}
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Delivery
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={12}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="Sales Order"
                                  control={control}
                                  defaultValue={false}
                                  rules={{
                                    required: "Please select Vehicle Type",
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap={true}
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Sales Order
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  )}
                                />
                              </Grid>
                            </Grid>

                            <Grid container item md={4}>
                              <Typography
                                variant="span"
                                textAlign={"center"}
                                mr={6}
                                width={"100%"}
                              >
                                Set Commission by
                              </Typography>
                              <Grid
                                item
                                xs={12}
                                md={12}
                                lg={12}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="Sales Employees"
                                  control={control}
                                  defaultValue={false}
                                  rules={{
                                    required: "Please select Vehicle Type",
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap={true}
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Sales Employees
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={12}
                                lg={12}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="Items"
                                  control={control}
                                  defaultValue={false}
                                  rules={{
                                    required: "Please select Vehicle Type",
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap={true}
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Items
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={12}
                                lg={12}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="Customers"
                                  control={control}
                                  defaultValue={false}
                                  rules={{
                                    required: "Please select Vehicle Type",
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap={true}
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Customers
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  )}
                                />
                              </Grid>
                            </Grid>

                            <Grid container item md={12}>
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={4}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="Default Payt Method for Cust."
                                  rules={{
                                    required:
                                      "Please select Item Groups Valuation Method",
                                  }}
                                  control={control}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputSelectTextField
                                      label="Default Payt Method for Cust."
                                      data={[
                                        { key: "1", value: "K" },
                                        { key: "2", value: "U" },
                                      ]}
                                      {...field}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={4}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="Default Payt Method for Vendor"
                                  rules={{
                                    required:
                                      "Please select Item Groups Valuation Method",
                                  }}
                                  control={control}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputSelectTextField
                                      label="Default Payt Method for Vendor"
                                      data={[
                                        { key: "1", value: "Kt" },
                                        { key: "2", value: "S" },
                                      ]}
                                      {...field}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={4}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="Submit Credit Vouchers"
                                  rules={{
                                    required:
                                      "Please select Item Groups Valuation Method",
                                  }}
                                  control={control}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputSelectTextField
                                      label="Submit Credit Vouchers"
                                      data={[
                                        { key: "1", value: "Kuit" },
                                        { key: "2", value: "USa" },
                                      ]}
                                      {...field}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={4}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="Default Payment Term for Customer"
                                  rules={{
                                    required:
                                      "Please select Item Groups Valuation Method",
                                  }}
                                  control={control}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputSelectTextField
                                      label="Default Payment Term for Customer"
                                      data={[
                                        { key: "1", value: "cash bic" },
                                        { key: "2", value: "U" },
                                      ]}
                                      {...field}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={4}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="Default Payment Term for Vendor"
                                  rules={{
                                    required:
                                      "Please select Item Groups Valuation Method",
                                  }}
                                  control={control}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputSelectTextField
                                      label="Default Payment Term for Vendor"
                                      data={[
                                        { key: "1", value: "cash bic" },
                                        { key: "2", value: "U" },
                                      ]}
                                      {...field}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={4}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="Set Default Price List in General Settings Instead of in Payment Terms"
                                  control={control}
                                  defaultValue={false}
                                  rules={{
                                    required: "Please select Vehicle Type",
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap={true}
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Set Default Price List in General
                                          Settings Instead of in Payment Terms
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={4}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="Verify VAT Numbers for Business Partners and Documents"
                                  control={control}
                                  defaultValue={false}
                                  rules={{
                                    required: "Please select Vehicle Type",
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap={true}
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Verify VAT Numbers for Business
                                          Partners and Documents
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={4}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="Use Shipped Goods Account for Customer"
                                  control={control}
                                  defaultValue={false}
                                  rules={{
                                    required: "Please select Vehicle Type",
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap={true}
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Use Shipped Goods Account for Customer
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={4}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="Display Inactive Business Partners in Reports"
                                  control={control}
                                  defaultValue={false}
                                  rules={{
                                    required: "Please select Vehicle Type",
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap={true}
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Display Inactive Business Partners in
                                          Reports
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={4}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="Display Inactive Marketing Documents Business Partners in "
                                  control={control}
                                  defaultValue={false}
                                  rules={{
                                    required: "Please select Vehicle Type",
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap={true}
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Display Inactive Marketing Documents
                                          Business Partners in
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={4}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="Apply IBAN Validation to Bank Accounts"
                                  control={control}
                                  defaultValue={false}
                                  rules={{
                                    required: "Please select Vehicle Type",
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap={true}
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Apply IBAN Validation to Bank Accounts
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  )}
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                        </>
                      )}
                      {tabvalue === 1 && (
                        <>
                          <Grid container>
                            <Grid
                              item
                              xs={12}
                              md={12}
                              lg={12}
                              sm={6}
                              ml={2}
                              width={220}
                            >
                              <Controller
                                name="Enable Transaction Notification"
                                control={control}
                                defaultValue={false}
                                rules={{
                                  required: "Please select Vehicle Type",
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <Tooltip
                                    title="Enable notifications for transactions"
                                    arrow
                                  >
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Enable Transaction Notification
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={12}
                              lg={12}
                              sm={6}
                              ml={2}
                              width={220}
                            >
                              <Controller
                                name="Enable Mailer Service"
                                control={control}
                                defaultValue={false}
                                rules={{
                                  required: "Please select Vehicle Type",
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <Tooltip title="Enable Mailer Service" arrow>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Enable Mailer Service
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={12}
                              lg={12}
                              sm={6}
                              ml={2}
                              width={220}
                            >
                              <Controller
                                name="Enable Company Specific Mailer Configuration"
                                control={control}
                                defaultValue={false}
                                rules={{
                                  required: "Please select Vehicle Type",
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <Tooltip
                                    title="Enable Company Specific Mailer Configuration"
                                    arrow
                                    placement="bottom"
                                  >
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Enable Company Specific Mailer
                                          Configuration
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="SMTP Server"
                                rules={{ required: "this field is required" }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="SMTP Server"
                                    type="text"
                                    {...field}
                                    error={!!error} // Pass error state to the FormComponent if needed
                                    helperText={error ? error.message : null} // Show the validation message
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="SMTP Port"
                                rules={{ required: "this field is required" }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="SMTP Port"
                                    type="text"
                                    {...field}
                                    error={!!error} // Pass error state to the FormComponent if needed
                                    helperText={error ? error.message : null} // Show the validation message
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                              width={220}
                            >
                              <Controller
                                name="Authentication"
                                rules={{
                                  required:
                                    "Please select Item Groups Valuation Method",
                                }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputSelectTextField
                                    label="Authentication"
                                    data={[
                                      { key: "1", value: "user" },
                                      { key: "2", value: "admin" },
                                    ]}
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="User Name"
                                rules={{ required: "this field is required" }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="User Name"
                                    type="text"
                                    {...field}
                                    error={!!error} // Pass error state to the FormComponent if needed
                                    helperText={error ? error.message : null} // Show the validation message
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                              width={220}
                            >
                              <Controller
                                name="Password"
                                rules={{
                                  required:
                                    "Please select Item Groups Valuation Method",
                                }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Password"
                                    type="text"
                                    {...field}
                                    error={!!error} // Pass error state to the FormComponent if needed
                                    helperText={error ? error.message : null} // Show the validation message
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Encoding"
                                rules={{
                                  required:
                                    "Please select Item Groups Valuation Method",
                                }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputSelectTextField
                                    label="Encoding"
                                    data={[
                                      { key: "1", value: "user" },
                                      { key: "2", value: "admin" },
                                    ]}
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Use TLS Encryption"
                                control={control}
                                defaultValue={false}
                                rules={{
                                  required: "Please select Vehicle Type",
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <Tooltip title="Use TLS Encryption" arrow>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Use TLS Encryption
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="HTML Direction Right to Left"
                                control={control}
                                defaultValue={false}
                                rules={{
                                  required: "Please select Vehicle Type",
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <Tooltip
                                    title="HTML Direction Right to Left"
                                    arrow
                                  >
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          HTML Direction Right to Left
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Include Subject in Message Body"
                                control={control}
                                defaultValue={false}
                                rules={{
                                  required: "Please select Vehicle Type",
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <Tooltip
                                    title="Include Subject in Message Body"
                                    arrow
                                  >
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Include Subject in Message Body
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Update Messages (Min.)"
                                rules={{
                                  required:
                                    "Please select Item Groups Valuation Method",
                                }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Update Messages (Min.)"
                                    type="text"
                                    {...field}
                                    error={!!error} // Pass error state to the FormComponent if needed
                                    helperText={error ? error.message : null} // Show the validation message
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                              width={220}
                            >
                              <Controller
                                name="Screen Locking Time (Min.)"
                                rules={{
                                  required:
                                    "Please select Item Groups Valuation Method",
                                }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Screen Locking Time (Min.)"
                                    type="text"
                                    {...field}
                                    error={!!error} // Pass error state to the FormComponent if needed
                                    helperText={error ? error.message : null} // Show the validation message
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                              width={220}
                            >
                              <Controller
                                name="Use Numeric Keypad ENTER Key as TAB Key"
                                rules={{
                                  required:
                                    "Please select Item Groups Valuation Method",
                                }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputSelectTextField
                                    label="Use Numeric Keypad ENTER Key as TAB Key"
                                    data={[
                                      { key: "1", value: "no" },
                                      { key: "2", value: "yes" },
                                    ]}
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Use Numeric Keypad ENTER Key as TAB Key"
                                control={control}
                                defaultValue={false}
                                rules={{
                                  required: "Please select Vehicle Type",
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <Tooltip
                                    title="Use Numeric Keypad ENTER Key as TAB Key"
                                    arrow
                                    placement="bottom"
                                  >
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Use Numeric Keypad ENTER Key as TAB
                                          Key
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Use Numeric Keypad Period Key as Separator on Display Tab"
                                control={control}
                                defaultValue={false}
                                rules={{
                                  required: "Please select Vehicle Type",
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <Tooltip
                                    title="Use Numeric Keypad Period Key as Separator on Display Tab"
                                    arrow
                                    placement="bottom"
                                  >
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Use Numeric Keypad Period Key as
                                          Separator on Display Tab
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Enable Document Operations by Mouse Only (Such as Add, Update, OK)"
                                control={control}
                                defaultValue={false}
                                rules={{
                                  required: "Please select Vehicle Type",
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <Tooltip
                                    title="Enable Document Operations by Mouse Only (Such as Add, Update, OK)"
                                    arrow
                                    placement="bottom"
                                  >
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Enable Document Operations by Mouse
                                          Only (Such as Add, Update, OK)
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              />
                            </Grid>
                          </Grid>
                        </>
                      )}
                      {tabvalue === 2 && (
                        <>
                          <Grid container>
                            <Grid
                              container
                              item
                              sx={{
                                fontSize: 15,
                                justifyContent: "center",
                                mt: 1,
                              }}
                            >
                              <SystemUpdateAltIcon
                                sx={{ fontSize: 20, textAlign: "center" }}
                              />
                              Export Word and Excel File To
                            </Grid>
                            <Grid
                              item
                              md={6}
                              xs={12}
                              sm={6}
                              textAlign={"center"}
                            >
                              <FormControlLabel
                                value="pay-after"
                                control={<Radio />}
                                label="Local Folder"
                              />
                            </Grid>
                            <Grid
                              item
                              md={6}
                              xs={12}
                              sm={6}
                              textAlign={"center"}
                            >
                              <FormControlLabel
                                value="pay-after"
                                control={<Radio />}
                                label="OneDrive"
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={6}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Name"
                                control={control}
                                rules={{ required: "this field is required" }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Microsoft Word Templates Folder"
                                    type="text"
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={6}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Name"
                                control={control}
                                rules={{ required: "this field is required" }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Microsoft Excel Folder"
                                    type="text"
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={6}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Name"
                                control={control}
                                rules={{ required: "this field is required" }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Pictures Folder "
                                    type="text"
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              md={6}
                              sm={6}
                              lg={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Name"
                                control={control}
                                rules={{ required: "this field is required" }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Attachments Folder"
                                    type="text"
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              md={6}
                              sm={6}
                              lg={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Name"
                                control={control}
                                rules={{ required: "this field is required" }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Extensions Folder"
                                    type="text"
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              md={6}
                              sm={6}
                              lg={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Name"
                                control={control}
                                rules={{ required: "this field is required" }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="XML File Folder"
                                    type="text"
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              md={6}
                              sm={6}
                              lg={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Name"
                                control={control}
                                rules={{ required: "this field is required" }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Current Scanner"
                                    type="text"
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                        </>
                      )}

                      {tabvalue === 3 && (
                        <>
                          <Grid container>
                            <Grid
                              item
                              width="100%"
                              m={1}
                              gap={5}
                              border="1px solid grey"
                            >
                              <Tabs
                                value={subtab}
                                onChange={handletab}
                                aria-label="disabled tabs example"
                                variant="scrollable"
                                scrollButtons="auto"
                              >
                                <Tab value={"0"} label="Items" />
                                <Tab value={"1"} label="Planning" />
                              </Tabs>
                              <Divider />
                              {subtab === "0" && (
                                <>
                                  <Grid container>
                                    <Typography variant="subtitle1" ml={2}>
                                      {" "}
                                      Display Inactive Items In{" "}
                                    </Typography>
                                    <Grid
                                      item
                                      xs={12}
                                      md={12}
                                      lg={12}
                                      sm={12}
                                      ml={3}
                                    >
                                      <Controller
                                        name="Reports"
                                        control={control}
                                        defaultValue={false}
                                        rules={{
                                          required:
                                            "Please select Vehicle Type",
                                        }}
                                        render={({
                                          field,
                                          fieldState: { error },
                                        }) => (
                                          <Tooltip
                                            title="Reports"
                                            arrow
                                            placement="bottom"
                                          >
                                            <FormControlLabel
                                              control={
                                                <Checkbox
                                                  sx={{
                                                    textAlign: "center",
                                                    width: 20,
                                                    mr: 1,
                                                  }}
                                                  {...field}
                                                  checked={field.value}
                                                />
                                              }
                                              label={
                                                <Typography
                                                  variant="body2"
                                                  noWrap
                                                  sx={{
                                                    fontFamily:
                                                      "'Open Sans', sans-serif", // Apply font family here
                                                  }}
                                                >
                                                  Reports
                                                </Typography>
                                              }
                                              sx={{
                                                textAlign: "center",
                                                width: 200,
                                                whiteSpace: "normal", // Allow the label to wrap
                                                fontFamily:
                                                  "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                              }}
                                            />
                                          </Tooltip>
                                        )}
                                      />
                                    </Grid>
                                    <Grid
                                      item
                                      xs={12}
                                      md={12}
                                      lg={12}
                                      sm={12}
                                      ml={3}
                                    >
                                      <Controller
                                        name="Marketing Documents"
                                        control={control}
                                        defaultValue={false}
                                        rules={{
                                          required:
                                            "Please select Vehicle Type",
                                        }}
                                        render={({
                                          field,
                                          fieldState: { error },
                                        }) => (
                                          <Tooltip
                                            title="Marketing Documents"
                                            arrow
                                            placement="bottom"
                                          >
                                            <FormControlLabel
                                              control={
                                                <Checkbox
                                                  sx={{
                                                    textAlign: "center",
                                                    width: 20,
                                                    mr: 1,
                                                  }}
                                                  {...field}
                                                  checked={field.value}
                                                />
                                              }
                                              label={
                                                <Typography
                                                  variant="body2"
                                                  noWrap
                                                  sx={{
                                                    fontFamily:
                                                      "'Open Sans', sans-serif", // Apply font family here
                                                  }}
                                                >
                                                  Marketing Documents
                                                </Typography>
                                              }
                                              sx={{
                                                textAlign: "center",
                                                width: 200,
                                                whiteSpace: "normal", // Allow the label to wrap
                                                fontFamily:
                                                  "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                              }}
                                            />
                                          </Tooltip>
                                        )}
                                      />
                                    </Grid>
                                    <Grid container item>
                                      <Typography
                                        variant="subtitle1"
                                        width={"100%"}
                                        m={2}
                                      >
                                        Display Batch Quantities By
                                      </Typography>
                                      <Grid
                                        item
                                        xs={12}
                                        md={12}
                                        lg={12}
                                        sm={12}
                                        // textAlign={"center"}
                                        ml={3}
                                      >
                                        <Controller
                                          name="Document Row UoM"
                                          control={control}
                                          defaultValue={false}
                                          rules={{
                                            required:
                                              "Please select Vehicle Type",
                                          }}
                                          render={({
                                            field,
                                            fieldState: { error },
                                          }) => (
                                            <Tooltip
                                              title="Document Row UoM"
                                              arrow
                                              placement="bottom"
                                            >
                                              <FormControlLabel
                                                control={
                                                  <Checkbox
                                                    sx={{
                                                      textAlign: "center",
                                                      width: 20,
                                                      mr: 1,
                                                    }}
                                                    {...field}
                                                    checked={field.value}
                                                  />
                                                }
                                                label={
                                                  <Typography
                                                    variant="body2"
                                                    noWrap
                                                    sx={{
                                                      fontFamily:
                                                        "'Open Sans', sans-serif", // Apply font family here
                                                    }}
                                                  >
                                                    Document Row UoM
                                                  </Typography>
                                                }
                                                sx={{
                                                  textAlign: "center",
                                                  width: 200,
                                                  whiteSpace: "normal", // Allow the label to wrap
                                                  fontFamily:
                                                    "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                                }}
                                              />
                                            </Tooltip>
                                          )}
                                        />
                                        <Controller
                                          name="Inventory UoM"
                                          control={control}
                                          defaultValue={false}
                                          rules={{
                                            required:
                                              "Please select Vehicle Type",
                                          }}
                                          render={({
                                            field,
                                            fieldState: { error },
                                          }) => (
                                            <Tooltip
                                              title="Inventory UoM"
                                              arrow
                                              placement="bottom"
                                            >
                                              <FormControlLabel
                                                control={
                                                  <Checkbox
                                                    sx={{
                                                      textAlign: "center",
                                                      width: 20,
                                                      mr: 1,
                                                    }}
                                                    {...field}
                                                    checked={field.value}
                                                  />
                                                }
                                                label={
                                                  <Typography
                                                    variant="body2"
                                                    noWrap
                                                    sx={{
                                                      fontFamily:
                                                        "'Open Sans', sans-serif", // Apply font family here
                                                    }}
                                                  >
                                                    Inventory UoM
                                                  </Typography>
                                                }
                                                sx={{
                                                  textAlign: "center",
                                                  width: 200,
                                                  whiteSpace: "normal", // Allow the label to wrap
                                                  fontFamily:
                                                    "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                                }}
                                              />
                                            </Tooltip>
                                          )}
                                        />
                                      </Grid>
                                    </Grid>
                                    <Grid container item>
                                      <Typography
                                        variant="subtitle1"
                                        width={"100%"}
                                        m={2}
                                      >
                                        Item Defaults
                                      </Typography>
                                      <Grid
                                        item
                                        xs={12}
                                        md={6}
                                        lg={4}
                                        sm={6}
                                        textAlign={"center"}
                                        width={220}
                                      >
                                        <Controller
                                          name="Default Warehouse"
                                          rules={{
                                            required:
                                              "Please select Item Groups Valuation Method",
                                          }}
                                          control={control}
                                          render={({
                                            field,
                                            fieldState: { error },
                                          }) => (
                                            <InputSelectTextField
                                              label="Default Warehouse"
                                              data={[
                                                { key: "1", value: "no" },
                                                { key: "2", value: "yes" },
                                              ]}
                                              {...field}
                                              error={!!error}
                                              helperText={
                                                error ? error.message : null
                                              }
                                            />
                                          )}
                                        />
                                      </Grid>
                                      <Grid
                                        item
                                        xs={12}
                                        md={6}
                                        lg={4}
                                        sm={6}
                                        textAlign={"center"}
                                        width={220}
                                      >
                                        <Controller
                                          name="Set Inventory Method By"
                                          rules={{
                                            required:
                                              "Please select Item Set Inventory Method By",
                                          }}
                                          control={control}
                                          render={({
                                            field,
                                            fieldState: { error },
                                          }) => (
                                            <InputSelectTextField
                                              label="Set Inventory Method By"
                                              data={[
                                                { key: "1", value: "no" },
                                                { key: "2", value: "yes" },
                                              ]}
                                              {...field}
                                              error={!!error}
                                              helperText={
                                                error ? error.message : null
                                              }
                                            />
                                          )}
                                        />
                                      </Grid>
                                      <Grid
                                        item
                                        xs={12}
                                        md={6}
                                        mt={1}
                                        lg={4}
                                        sm={6}
                                        textAlign={"center"}
                                        width={220}
                                      >
                                        <Controller
                                          name="Auto. Add All Warehouses to New and Existing Items"
                                          control={control}
                                          defaultValue={false}
                                          rules={{
                                            required:
                                              "Please select Vehicle Type",
                                          }}
                                          render={({
                                            field,
                                            fieldState: { error },
                                          }) => (
                                            <Tooltip
                                              title="Auto. Add All Warehouses to New and Existing Items"
                                              arrow
                                              placement="bottom"
                                            >
                                              <FormControlLabel
                                                control={
                                                  <Checkbox
                                                    sx={{
                                                      textAlign: "center",
                                                      width: 20,
                                                      mr: 1,
                                                    }}
                                                    {...field}
                                                    checked={field.value}
                                                  />
                                                }
                                                label={
                                                  <Typography
                                                    variant="body2"
                                                    noWrap
                                                    sx={{
                                                      fontFamily:
                                                        "'Open Sans', sans-serif", // Apply font family here
                                                    }}
                                                  >
                                                    Auto. Add All Warehouses to
                                                    New and Existing Items
                                                  </Typography>
                                                }
                                                sx={{
                                                  textAlign: "center",
                                                  width: 200,
                                                  whiteSpace: "normal", // Allow the label to wrap
                                                  fontFamily:
                                                    "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                                }}
                                              />
                                            </Tooltip>
                                          )}
                                        />
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </>
                              )}

                              {subtab === "1" && (
                                <>
                                  <Grid container></Grid>
                                  <Grid
                                    item
                                    xs={12}
                                    md={12}
                                    lg={12}
                                    sm={12}
                                    ml={5}
                                  >
                                    <Controller
                                      name="Consume Forecast"
                                      control={control}
                                      defaultValue={false}
                                      rules={{
                                        required: "Please select Vehicle Type",
                                      }}
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <Tooltip
                                          title="Consume Forecast"
                                          arrow
                                          placement="bottom"
                                        >
                                          <FormControlLabel
                                            control={
                                              <Checkbox
                                                sx={{
                                                  textAlign: "center",
                                                  width: 20,
                                                  mr: 1,
                                                }}
                                                {...field}
                                                checked={field.value}
                                              />
                                            }
                                            label={
                                              <Typography
                                                variant="body2"
                                                noWrap
                                                sx={{
                                                  fontFamily:
                                                    "'Open Sans', sans-serif", // Apply font family here
                                                }}
                                              >
                                                Consume Forecast
                                              </Typography>
                                            }
                                            sx={{
                                              textAlign: "center",
                                              width: 200,
                                              whiteSpace: "normal", // Allow the label to wrap
                                              fontFamily:
                                                "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                            }}
                                          />
                                        </Tooltip>
                                      )}
                                    />
                                  </Grid>
                                  <Grid
                                    item
                                    xs={12}
                                    md={12}
                                    lg={12}
                                    sm={12}
                                    ml={3}
                                  >
                                    <Controller
                                      name="Consumption Method"
                                      rules={{
                                        required:
                                          "Please select Item Groups Valuation Method",
                                      }}
                                      control={control}
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputSelectTextField
                                          label="Consumption Method"
                                          data={[
                                            { key: "1", value: "back-forward" },
                                            { key: "2", value: "forward" },
                                          ]}
                                          {...field}
                                          error={!!error}
                                          helperText={
                                            error ? error.message : null
                                          }
                                        />
                                      )}
                                    />
                                  </Grid>
                                  <Grid
                                    item
                                    xs={12}
                                    md={12}
                                    lg={12}
                                    sm={12}
                                    ml={3}
                                  >
                                    <Controller
                                      name="Days Backward"
                                      control={control}
                                      rules={{
                                        required: "this field is required",
                                      }}
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputTextField
                                          label="Days Backward"
                                          type="text"
                                          {...field}
                                          error={!!error}
                                          helperText={
                                            error ? error.message : null
                                          }
                                        />
                                      )}
                                    />
                                  </Grid>

                                  <Grid
                                    item
                                    xs={12}
                                    md={12}
                                    lg={12}
                                    sm={12}
                                    ml={3}
                                  >
                                    <Controller
                                      name="Days Forward"
                                      control={control}
                                      rules={{
                                        required: "this field is required",
                                      }}
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputTextField
                                          label="Days Forward"
                                          type="text"
                                          {...field}
                                          error={!!error}
                                          helperText={
                                            error ? error.message : null
                                          }
                                        />
                                      )}
                                    />
                                  </Grid>
                                </>
                              )}
                            </Grid>
                          </Grid>
                        </>
                      )}
                      {tabvalue === 4 && (
                        <>
                          <Grid container>
                            <Grid container item>
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={4}
                                sm={6}
                                textAlign={"center"}
                              >
                                <Controller
                                  name="Max. Rows per Page"
                                  rules={{ required: "this field is required" }}
                                  control={control}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      label="Max. Rows per Page"
                                      type="text"
                                      {...field}
                                      error={!!error} // Pass error state to the FormComponent if needed
                                      helperText={error ? error.message : null} // Show the validation message
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={4}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="Print With Vertical Compression"
                                  rules={{
                                    required:
                                      "Please select Item Groups Valuation Method",
                                  }}
                                  control={control}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputSelectTextField
                                      label="Print With Vertical Compression"
                                      data={[
                                        { key: "1", value: "cash bic" },
                                        { key: "2", value: "U" },
                                      ]}
                                      {...field}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={4}
                                sm={6}
                                textAlign={"center"}
                              >
                                <Controller
                                  name="Top Margin (cm)"
                                  rules={{ required: "this field is required" }}
                                  control={control}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      label="Top Margin (cm)"
                                      type="text"
                                      {...field}
                                      error={!!error} // Pass error state to the FormComponent if needed
                                      helperText={error ? error.message : null} // Show the validation message
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={4}
                                sm={6}
                                textAlign={"center"}
                              >
                                <Controller
                                  name="Bottom Margin (cm)"
                                  rules={{ required: "this field is required" }}
                                  control={control}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      label="Bottom Margin (cm)"
                                      type="text"
                                      {...field}
                                      error={!!error} // Pass error state to the FormComponent if needed
                                      helperText={error ? error.message : null} // Show the validation message
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={4}
                                sm={6}
                                textAlign={"center"}
                              >
                                <Controller
                                  name="Max. Rows per Page in Export"
                                  rules={{ required: "this field is required" }}
                                  control={control}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      label="Max. Rows per Page in Export"
                                      type="text"
                                      {...field}
                                      error={!!error} // Pass error state to the FormComponent if needed
                                      helperText={error ? error.message : null} // Show the validation message
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={4}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="When Printing Layout Including SN, Print"
                                  rules={{
                                    required:
                                      "Please select Item Groups Valuation Method",
                                  }}
                                  control={control}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputSelectTextField
                                      label="When Printing Layout Including SN, Print"
                                      data={[
                                        { key: "1", value: "serail no" },
                                        { key: "2", value: "U" },
                                      ]}
                                      {...field}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={4}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="Print Text as Picture"
                                  control={control}
                                  defaultValue={false}
                                  rules={{
                                    required: "Please select Vehicle Type",
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap={true}
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Print Text as Picture
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={4}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="Print SAP Business One Generation Message"
                                  control={control}
                                  defaultValue={false}
                                  rules={{
                                    required: "Please select Vehicle Type",
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap={true}
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Print SAP Business One Generation
                                          Message
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={4}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="Print Draft Watermark on Draft Documents"
                                  control={control}
                                  defaultValue={false}
                                  rules={{
                                    required: "Please select Vehicle Type",
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap={true}
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Print Draft Watermark on Draft
                                          Documents
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={4}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="Generate PDF When Printing"
                                  control={control}
                                  defaultValue={false}
                                  rules={{
                                    required: "Please select Vehicle Type",
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap={true}
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Generate PDF When Printing
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={4}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="Print Canceled or Cancelation Watermark on Applicable Documents"
                                  control={control}
                                  defaultValue={false}
                                  rules={{
                                    required: "Please select Vehicle Type",
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap={true}
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Print Canceled or Cancelation
                                          Watermark on Applicable Documents
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  )}
                                />
                              </Grid>

                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={12}
                                sm={6}
                                textAlign={"center"}
                                width={220}
                              >
                                <Box
                                  onDrop={handleDrop}
                                  onDragOver={handleDragOver}
                                  sx={{
                                    border: "2px dashed #ccc",
                                    borderRadius: "4px",
                                    padding: "20px",
                                    textAlign: "center",
                                    cursor: "pointer",
                                  }}
                                >
                                  <input
                                    accept="image/*"
                                    type="file"
                                    onChange={handleLogoChange}
                                    style={{ display: "none" }}
                                    id="logo-upload"
                                  />
                                  <label htmlFor="logo-upload">
                                    <Typography variant="body1">
                                      Drag and drop your Co. Logo here, or click
                                      to select a file.
                                    </Typography>
                                  </label>
                                  {logo && (
                                    <Box mt={2}>
                                      <Typography variant="h6">
                                        Preview:
                                      </Typography>
                                      <img
                                        src={logo}
                                        alt="Logo Preview"
                                        style={{
                                          maxWidth: "100%",
                                          height: "auto",
                                        }}
                                      />
                                      <Box mt={1}>
                                        <Button
                                          variant="outlined"
                                          color="error"
                                          onClick={handleRemoveLogo}
                                        >
                                          Remove Logo
                                        </Button>
                                      </Box>
                                    </Box>
                                  )}
                                </Box>
                              </Grid>
                            </Grid>
                          </Grid>
                        </>
                      )}
                      {tabvalue === 5 && (
                        <>
                          {" "}
                          <Grid container>
                            <Grid item xs={12} md={12} lg={6} sm={12} ml={3}>
                              <Controller
                                name="Remove or Update UoM Prices Based on Last Purchase or Evaluated Price Lists"
                                control={control}
                                defaultValue={false}
                                rules={{
                                  required: "Please select Vehicle Type",
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <Tooltip
                                    title="Remove or Update UoM Prices Based on Last Purchase or Evaluated Price Lists"
                                    arrow
                                    placement="bottom"
                                  >
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Remove or Update UoM Prices Based on
                                          Last Purchase or Evaluated Price Lists
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              />
                            </Grid>
                            <Grid item xs={12} md={12} lg={6} sm={12} ml={3}>
                              <Controller
                                name="Effective Price Considers All Price Sources"
                                control={control}
                                defaultValue={false}
                                rules={{
                                  required: "Please select Vehicle Type",
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <Tooltip
                                    title="Effective Price Considers All Price Sources"
                                    arrow
                                    placement="bottom"
                                  >
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Effective Price Considers All Price
                                          Sources
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              />
                            </Grid>
                            <Typography
                              variant="subtitle1"
                              width={"100%"}
                              m={2}
                            >
                              Display Inactive Price Lists In
                            </Typography>
                            <Grid item xs={12} md={12} lg={12} sm={12} ml={3}>
                              <Controller
                                name="Reports"
                                control={control}
                                defaultValue={false}
                                rules={{
                                  required: "Please select Vehicle Type",
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <Tooltip
                                    title="Reports"
                                    arrow
                                    placement="bottom"
                                  >
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Reports
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              />
                            </Grid>
                            <Grid item xs={12} md={12} lg={12} sm={12} ml={3}>
                              <Controller
                                name="Sales, Purchasing and Inventor&y Documents"
                                control={control}
                                defaultValue={false}
                                rules={{
                                  required: "Please select Vehicle Type",
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <Tooltip
                                    title="Sales, Purchasing and Inventor&y Documents"
                                    arrow
                                    placement="bottom"
                                  >
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Sales, Purchasing and Inventor&y
                                          Documents
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              />
                            </Grid>
                            <Grid item xs={12} md={12} lg={12} sm={12} ml={3}>
                              <Controller
                                name="Settings"
                                control={control}
                                defaultValue={false}
                                rules={{
                                  required: "Please select Vehicle Type",
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <Tooltip
                                    title="Settings"
                                    arrow
                                    placement="bottom"
                                  >
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Settings
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              />
                            </Grid>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            <Grid
              item
              px={1}
              // md={12}
              xs={12}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
                position: "sticky",
                bottom: "0px",
              }}
            >
              <Button
                variant="contained"
                sx={{ color: "white" }}
                color="success"
                type="submit"
                disabled={!perms.IsAdd || !perms.IsEdit  }
              >
                Save
              </Button>
              {/* <Button variant="contained" color="error" disabled>
                CANCEL APPIONTMENT
              </Button> */}
              <Button variant="contained" color="primary" disabled={!perms.IsDelete}>
                PRINT
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
