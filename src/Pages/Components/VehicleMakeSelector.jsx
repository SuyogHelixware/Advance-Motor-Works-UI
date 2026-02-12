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

const CarLogoSelector = ({
  value,
  label = "Car Brand",
  onChange,
  disabled,
  ...restProps
}) => {
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchInDropdown, setSearchInDropdown] = useState("");

  const open = Boolean(anchorEl);
  const selectedBrand = brands.find((b) => b.name === value); // Ensures we find the selected brand

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get(
          "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/data.json"
        );
        const sorted = res.data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setBrands(sorted);
        setFilteredBrands(sorted);

        // if (!value && sorted.length > 0) {
        //   onChange?.(sorted[0].name); 
        // }
      } catch (error) {
        console.error("Failed to load brand data:", error);
      }
    };

    fetchBrands();
  }, [value, onChange]); // Add value and onChange to dependency array

  useEffect(() => {
    const filtered = brands.filter((b) =>
      b.name.toLowerCase().includes(searchInDropdown.toLowerCase())
    );
    setFilteredBrands(filtered);
  }, [searchInDropdown, brands]);

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchInDropdown("");
  };

  const handleSelect = (name) => {
    onChange?.(name); // Set the selected value
    handleClose();
  };

  return (
    <>
      <TextField
        variant="outlined"
        label={label}
        value={value || ""} // Make sure to handle empty values correctly
        onClick={handleClick}
        disabled={disabled}
        size="medium"
        sx={{ maxWidth: 220, width: "100%", m: 1 }}
        InputProps={{
          readOnly: true,
          startAdornment: (
            <InputAdornment position="start">
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {selectedBrand?.image?.thumb && (
                  <img
                    src={selectedBrand.image.thumb}
                    alt={selectedBrand.name}
                    style={{ width: 65, height: 45 }}
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
            placeholder="Search brand..."
            size="small"
            fullWidth
            value={searchInDropdown}
            onChange={(e) => setSearchInDropdown(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.stopPropagation()}
            disabled={disabled}
          />
        </div>

        {filteredBrands.map((brand) => (
          <MenuItem key={brand.slug} onClick={() => handleSelect(brand.name)}>
            {brand.image?.thumb && (
              <img
                src={brand.image.thumb}
                alt={brand.name}
                style={{ width: 45, height: 35, marginRight: 8 }}
              />
            )}
            <Typography>{brand.name}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default CarLogoSelector;
