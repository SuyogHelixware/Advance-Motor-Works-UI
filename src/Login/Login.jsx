import { Person, Visibility, VisibilityOff } from "@mui/icons-material"; // Import icons
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import useAuth from "../Routing/AuthContext";
import apiClient from "../services/apiClient";
import "./AddLogin.css";
const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, companyData } = useAuth();

  const navigate = useNavigate();
  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      login(data.username, data.password);
      const response = await apiClient(`/Login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify(data),
      });
      console.log(response);
      if (response.data.success) {
        const accessToken = response.headers["authorization"];
        const refreshToken = response.headers["x-refresh-token"];
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // 👇 EXISTING user object
        const basicUser = response.data.values;

        // 🔥 ADD THIS BLOCK
        try {
          const userRes = await apiClient.get(`/Users/${basicUser.UserId}`);

          if (userRes.data.success) {
            const profile = userRes.data.values;

            // merge extra fields
            basicUser.Email = profile.Email || "";
            basicUser.PhoneNumber = profile.PhoneNumber || "";
          }
        } catch (e) {
          console.error("User profile fetch failed", e);
        }

        // 👇 keep your existing login call
        login(basicUser);

        navigate("/dashboard");
      } else {
        setError(response.data.message || "Invalid username or password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Grid className="background-image">
      <Box className="box">
        <Box className="logo-container">
          {companyData?.Logo1 && (
            <img
              src={`data:image/png;base64,${companyData.Logo2}`}
              height={70}
              width={150}
              alt=""
              style={{ objectFit: "contain" }}
            />
          )}
        </Box>

        {error && <Typography className="error">{error}</Typography>}
        <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
          <div className="input-field">
            <TextField
              variant="outlined"
              fullWidth
              type="text"
              label="username"
              size="small"
              margin="normal"
              {...register("username", {
                required: "Username is required",
              })}
              error={!!errors.username}
              helperText={errors.username?.message}
              // InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Person />
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <div className="input-field">
            <TextField
              label="Password"
              variant="outlined"
              type={showPassword ? "text" : "password"}
              size="small"
              fullWidth
              margin="normal"
              {...register("password", { required: "Password is required" })}
              error={!!errors.password}
              helperText={errors.password?.message}
              // InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControlLabel
              control={<Checkbox name="rememberMe" color="primary" />}
              label="Remember me"
            />
          </div>
          <Button
            className="btn"
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Login"}
          </Button>
        </form>
      </Box>
    </Grid>
  );
};

export default Login;
