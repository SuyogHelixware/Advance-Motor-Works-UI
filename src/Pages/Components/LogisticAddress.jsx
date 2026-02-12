import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Divider,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { InputSelectTextField, InputTextField, ModelInputSelectTextField } from "./formComponents";
import axios from "axios";
import Swal from "sweetalert2";
import apiClient from "../../services/apiClient";

const LogisticAddress = ({
  Title,
  openPayTo,
  BlockB,
  StreetB,
  CityB,
  StateB,
  ZipCodeB,
  CountryB,
  DialogClosePayto,
  onSubmit,
}) => {
  const [listofstate, setListofState] = useState([]);
  const [listofcountry, setListofCountry] = useState([]);

  const { control, handleSubmit,  reset } = useForm();

  const handleFormSubmit = (data) => {
    onSubmit(data);
    DialogClosePayto();
  };

  const fetchCountries = async () => {
    try {
      const { data } = await apiClient.get(`/Country/all`);
      if (data.success) {
        setListofCountry(data.values || []);
      } else {
        Swal.fire("Error!", data.message, "warning");
      }
    } catch (error) {
      Swal.fire("Error!", "Failed to load countries.", "error");
    }
  };

  const fetchStates = async (countryCode) => {
    try {
      const { data } = await apiClient.get(
        `/ListofStates/GetByCountryCode/${countryCode}`
      );
      if (data.success) {
        setListofState(data.values || []);
      } else {
        Swal.fire("Error!", data.message, "warning");
      }
    } catch (error) {
      Swal.fire("Error!", "Failed to load states.", "error");
    }
  };

  const handleCountryChange = (value) => {
    fetchStates(value);
  };

  // Fetch countries once on first open
  useEffect(() => {
    if (openPayTo) {
      fetchCountries();
    }
  }, [openPayTo]);

  // Reset form and fetch states when dialog opens
  useEffect(() => {
    if (openPayTo) {
      reset({
        BlockB: BlockB || "",
        StreetB: StreetB || "",
        CityB: CityB || "",
        StateB: StateB || "",
        ZipCodeB: ZipCodeB || "",
        CountryB: CountryB,
      });

      fetchStates(CountryB || "IND");
    }
  }, [openPayTo, BlockB, StreetB, CityB, StateB, ZipCodeB, CountryB, reset]);

  return (
    <Grid container>
      <Dialog
        open={openPayTo}
        onClose={DialogClosePayto}
        scroll="paper"
        component="form"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <DialogTitle>
          <Grid item display="flex" justifyContent="center">
            <Typography textAlign="center" fontWeight="bold">
              {Title}
            </Typography>
          </Grid>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={2}>
            {[
              { name: "BlockB", label: "BLOCK" },
              { name: "StreetB", label: "STREET" },
              { name: "CityB", label: "CITY" },
              { name: "ZipCodeB", label: "POST CODE" },
            ].map(({ name, label }) => (
              <Grid item xs={12} sm={6} key={name}>
                <Controller
                  name={name}
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label={label}
                      type="text"
                      inputProps={{ maxLength: 100 }}
                      {...field}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
            ))}
              <Grid item xs={12} sm={6}>
              <Controller
                name="CountryB"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <ModelInputSelectTextField
                    label="COUNTRY"
                    type="text"
                    {...field}
                    error={!!error}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val);
                      handleCountryChange(val);
                    }}
                    helperText={error ? error.message : null}
                    data={listofcountry.map((item) => ({
                      key: item.CountryCode,
                      value: item.CountryName,
                    }))}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="StateB"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <ModelInputSelectTextField
                    label="STATE"
                    type="text"
                    {...field}
                    error={!!error}
                    helperText={error ? error.message : null}
                    data={listofstate.map((item) => ({
                      key: item.Code,
                      value: item.Name,
                    }))}
                  />
                )}
              />
            </Grid>

          
          </Grid>
        </DialogContent>
        <DialogActions>
          <Grid
            item
            px={2}
            xs={12}
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Button variant="contained" color="success" type="submit">
              Save
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={DialogClosePayto}
            >
              Close
            </Button>
          </Grid>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default LogisticAddress;
