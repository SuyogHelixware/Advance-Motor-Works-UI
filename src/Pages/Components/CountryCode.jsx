import React, { useEffect, useState } from "react";
import {
  TextField,
  Menu,
  MenuItem,
  InputAdornment,
  Typography,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import axios from "axios";

const CountryCodeSelector = ({
  value,
  label = "Country (Alpha-3)",
  onChange,
  disabled,
  ...restProps
}) => {
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchInDropdown, setSearchInDropdown] = useState("");

  const open = Boolean(anchorEl);
  const selectedCountry = countries.find((c) => c.numeric === value);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(
          "https://restcountries.com/v3.1/all?fields=name,flags,cca3,ccn3"
        );
        const formatted = response.data.map((country) => ({
          name: country.name.common,
          flag: country.flags.svg,
          code: country.cca3,       // Alpha-3 code
          numeric: country.ccn3,    // ISO Numeric code
        }));
        const sorted = formatted.sort((a, b) => a.name.localeCompare(b.name));
        setCountries(sorted);
        setFilteredCountries(sorted);

        if (!value) {
          onChange?.("IND");
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const filtered = countries.filter(
      (c) =>
        c.name.toLowerCase().includes(searchInDropdown.toLowerCase()) ||
        c.code.toLowerCase().includes(searchInDropdown.toLowerCase()) ||
        c.numeric.includes(searchInDropdown) // filter by numeric too
    );
    setFilteredCountries(filtered);
  }, [searchInDropdown, countries]);

  const handleClick = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => {
    setAnchorEl(null);
    setSearchInDropdown("");
  };
  const handleSelect = (numeric) => {
    onChange?.(numeric);
    handleClose();
  };

  return (
    <>
      <TextField
        variant="outlined"
        label={label}
        value={value || "IND"}
        onClick={handleClick}
        disabled={disabled}
        size="small"
        sx={{ maxWidth: 220, width: "100%", m: 1 }}
        InputProps={{
          readOnly: true,
          startAdornment: (
            <InputAdornment position="start">
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {selectedCountry && (
                  <img
                    src={selectedCountry.flag}
                    alt={selectedCountry.name}
                    style={{ width: 20, height: 15 }}
                  />
                )}
                <ArrowDropDownIcon />
              </div>
            </InputAdornment>
          ),
        }}
        {...restProps}
      />

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{ style: { maxHeight: 300, width: 320 } }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            backgroundColor: "#fff",
            padding: 8,
          }}
        >
          <TextField
            placeholder="Search country..."
            size="small"
            fullWidth
            value={searchInDropdown}
            onChange={(e) => setSearchInDropdown(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>

        {filteredCountries.map((country) => (
          <MenuItem
            key={country.code}
            value={country.code}
            onClick={() => handleSelect(country.numeric)}
          >
            <img
              src={country.flag}
              alt={country.name}
              style={{ width: 20, height: 15, marginRight: 8 }}
            />
            <Typography marginRight="8px">{country.name}</Typography>
            <Typography color="gray">
              {country.code} | {country.numeric}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default CountryCodeSelector;
