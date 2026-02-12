import React, { useEffect, useState } from "react";
import {
  TextField,
  MenuItem,
  InputAdornment,
  Menu,
  Typography,
  IconButton,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import axios from "axios";

const Alpha2CodeSelector = ({
  value,
  label = "ISO Alpha-2 Code",
  onChange,
  disabled,
  ...restProps
}) => {
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInDropdown, setSearchInDropdown] = useState("");
  const selectedCountry = countries.find((c) => c.code === value);

  const open = Boolean(anchorEl);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(
          "https://restcountries.com/v3.1/all?fields=name,flags,cca2"
        );
        const formatted = response.data.map((country) => ({
          name: country.name.common,
          flag: country.flags.svg,
          code: country.cca2,
        }));
        const sorted = formatted.sort((a, b) => a.name.localeCompare(b.name));
        setCountries(sorted);
        setFilteredCountries(sorted);

        if (!value) {
          onChange("IN");
          setSearchTerm("IN");
        } else {
          setSearchTerm(value);
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
        c.code.toLowerCase().includes(searchInDropdown.toLowerCase())
    );
    setFilteredCountries(filtered);
  }, [searchInDropdown, countries]);

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchInDropdown("");
  };

  const handleSelect = (code) => {
    onChange(code);
    setSearchTerm(code);
    handleClose();
  };

  return (
    <>
      <TextField
        variant="outlined"
        label={label}
        value={value || "IN"}
        size="small"
        sx={{ maxWidth: 220, width: "100%", m: 1 }}
        onClick={handleClick}
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
          // endAdornment: (
          //   <InputAdornment position="end">
          //     <Typography variant="body2" sx={{ fontWeight: 500 }}>
          //       {value}
          //     </Typography>
          //   </InputAdornment>
          // ),
        }}
        {...restProps}
      />

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ disablePadding: true }}
        PaperProps={{ style: { maxHeight: 300, width: 320 } }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            backgroundColor: "#fff", // or use theme for dark mode
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
            onKeyDown={(e) => {
              // 👇 This line is the fix
              e.stopPropagation();
            }}
          />
        </div>

        {filteredCountries.map((country) => (
          <MenuItem
            key={country.code}
            value={country.code}
            onClick={() => handleSelect(country.code)}
          >
            <img
              src={country.flag}
              alt={country.name}
              style={{ width: 20, height: 15, marginRight: 8 }}
            />
            <Typography marginRight="8px">{country.name}</Typography>
            <Typography color="gray">{country.code}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default Alpha2CodeSelector;
