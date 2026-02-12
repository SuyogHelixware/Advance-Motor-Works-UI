import React, { useEffect, useState } from "react";
import {
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";

const CurrencySelector = ({
  value,
  label,
  onChange,
  disabled,
  ...restProps
}) => {
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get("https://restcountries.com/v3.1/all?fields=name,capital,region,subregion,population,flags,languages,currencies");
        const formattedData = response.data.map((country) => ({
          name: country.name.common,
          flag: country.flags.svg,
          currency: Object.keys(country.currencies || {})[0] || "",
        }));
        const validCountries = formattedData.filter((c) => c.currency);
        setCountries(validCountries);
        setFilteredCountries(validCountries);
      } catch (error) {
        console.error("Error fetching country data:", error);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!value) {
      setSelectedCountry(null);
      setSearchTerm("");
    } else {
      const matchedCountry = countries.find(
        (country) => country.currency.toUpperCase() === value.toUpperCase()
      );
      setSelectedCountry(matchedCountry || null);
      setSearchTerm(value.toUpperCase());
    }
  }, [value, countries]);

  const handleSearchChange = (e) => {
    const search = e.target.value.toUpperCase();
    setSearchTerm(search);

    const filtered = countries.filter(
      (country) =>
        country.name.toUpperCase().includes(search) ||
        country.currency.toUpperCase().includes(search)
    );
    setFilteredCountries(filtered);

    const exactMatch = filtered.find(
      (country) => country.currency.toUpperCase() === search
    );
    setSelectedCountry(exactMatch || null);
    onChange(exactMatch ? exactMatch.currency : "");
  };

  const handleCountryChange = (isoCurrencyCode) => {
    const selected = countries.find((c) => c.currency === isoCurrencyCode);
    setSelectedCountry(selected);
    setSearchTerm("");
    onChange(isoCurrencyCode);
  };

  return (
    <TextField
      variant="outlined"
      label={label}
      color="primary"
      value={searchTerm}
      onChange={handleSearchChange}
      size="small"
      inputProps={{
        readOnly: restProps.readOnly,
      }}
      sx={{ maxWidth: 220, width: "100%", m: 1 }}
      placeholder="CURRENCY CODE"
      disabled={disabled}
      InputProps={{
        startAdornment: (
          <InputAdornment
            position="start"
            style={{ marginRight: "2px", marginLeft: "-8px" }}
          >
            <Select
              MenuProps={{
                style: {
                  height: "300px",
                  width: "320px",
                  top: "10px",
                  left: "-34px",
                },
              }}
              sx={{
                fieldset: { display: "none" },
                ".MuiSelect-select": { padding: "2px", paddingRight: "24px" },
              }}
              value={selectedCountry?.currency || ""}
              onChange={(e) => handleCountryChange(e.target.value)}
              renderValue={(selected) => {
                const country = countries.find((c) => c.currency === selected);
                return (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                    }}
                  >
                    {country ? (
                      <img
                        src={country.flag}
                        alt={country.name}
                        style={{ width: 20, height: 20 }}
                      />
                    ) : (
                      <div style={{ width: 20, height: 20 }} />
                    )}
                  </div>
                );
              }}
              // disabled={disabled}
            >
              {filteredCountries.map((country) => (
                <MenuItem key={country.name} value={country.currency}>
                  <img
                    src={country.flag}
                    alt={country.name}
                    style={{ width: 20, height: 14, marginRight: 8 }}
                  />
                  <Typography marginRight="8px">{country.name}</Typography>
                  <Typography color="gray">{country.currency}</Typography>
                </MenuItem>
              ))}
            </Select>
          </InputAdornment>
        ),
      }}
      {...restProps}
    />
  );
};

export default CurrencySelector;
