import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { Grid, Typography, Box, Paper, Card } from "@mui/material";
import Swal from "sweetalert2";
import ORP_LOGO from "../../assets/orp-1.png";
import song from "../../assets/audio/catoon.wav";

const AppointmentScreen = () => {
  const [dailyAppointmentsList, setDailyAppointmentsList] = useState([]);
  const [dateTimeValue, setDateTimeValue] = useState(new Date());
  const scrollRef = useRef(null);
  const scrollPos = useRef(0);
  const speed = 1; // scroll pixels per frame
  const gap = 100; // gap between loops

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const audioRef = useRef(new Audio(song));

  const getDailyAppointments = async () => {
    try {
      const res = await fetch(`${BASE_URL}/Appointment/Todays`);
      setDailyAppointmentsList(res.data.values || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  useEffect(() => {
    getDailyAppointments();

    const intervalId = setInterval(async () => {
      const response = await fetch(`${BASE_URL}/Appointment/Todays`);
      const res = await response.json();
      const appointments = res?.values || [];

      setDailyAppointmentsList(appointments);

      const readyAppointments = appointments.filter(
        (appoint) => appoint.AppointStatus === "READY FOR PICKUP",
      );

      if (readyAppointments.length > 0) {
        audioRef.current.play().catch(() => {});

        Swal.fire({
          position: "top-center",
          icon: "warning",
          title: "CUSTOMER IS WAITING",
          showConfirmButton: false,
          timer: 7000,
          timerProgressBar: true,
        });
      }
    }, 15000);

    const timeIntervalId = setInterval(
      () => setDateTimeValue(new Date()),
      1000,
    );

    return () => {
      clearInterval(intervalId);
      clearInterval(timeIntervalId);
    };
  }, []);

  const isPaused = useRef(false);

  useEffect(() => {
    if (!scrollRef.current) return;
    let requestId;

    const step = () => {
      if (!isPaused.current) {
        const container = scrollRef.current;
        const scrollHeight = container.scrollHeight / 2; // half because of duplicated items
        scrollPos.current += speed;

        if (scrollPos.current >= scrollHeight) {
          scrollPos.current = 0; // restart scroll
        }

        container.scrollTop = scrollPos.current;
      }
      requestId = requestAnimationFrame(step);
    };

    requestId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(requestId);
  }, [dailyAppointmentsList]);

  // Helper to render appointment item
  const renderAppointment = (appointment) => (
    <Grid
      container
      key={appointment.DocNum + Math.random()} // unique key for duplicates
      p={2}
      component="div"
      mb={1}
      bgcolor={
        appointment.AppointStatus === "READY FOR PICKUP"
          ? "#85e5b9"
          : dayjs(appointment.AppointDate).isSame(
                dayjs(appointment.CreatedDate),
                "day",
              )
            ? "#DDAA66"
            : ""
      }
      sx={{ borderRadius: "8px", boxShadow: 1 }}
    >
      <Grid item sx={{ textAlign: "left", paddingLeft: "30px" }} width="9%">
        <Typography noWrap variant="h5">
          {dayjs(appointment.CreatedDate).format("DD-MM-YYYY")}
        </Typography>
      </Grid>
      <Grid item sx={{ textAlign: "left" }} width="8%">
        <Typography noWrap variant="h5">
          {dayjs(appointment.AppointDate).format("DD-MM-YYYY")} &nbsp;
          {dayjs(appointment.AppointTimeFrom).format("HH:mm")}
        </Typography>
      </Grid>
      <Grid item width="8%" sx={{ textAlign: "left" }}>
        <Typography noWrap variant="h5">
          {appointment.CardName?.toUpperCase()}
        </Typography>
      </Grid>
      <Grid item width="8%" sx={{ textAlign: "left" }}>
        <Typography noWrap variant="h5">
          {appointment.PhoneNumber1}
        </Typography>
      </Grid>
      <Grid item width="44%" sx={{ textAlign: "left" }}>
        <Typography noWrap variant="h5">
          {appointment.JobRemarks?.toUpperCase()}
        </Typography>
      </Grid>
      <Grid item sx={{ textAlign: "left" }} width="7%">
        <Typography noWrap variant="h5">
          {appointment.OrderNo}
        </Typography>
      </Grid>
      <Grid item sx={{ textAlign: "left" }} width="10%">
        <Typography
          noWrap
          variant="h5"
          fontWeight="bold"
          color={
            appointment.AppointStatus === "VEHICLE PICKED UP"
              ? "red"
              : "inherit"
          }
        >
          {appointment.AppointStatus}
        </Typography>
      </Grid>
      <Grid item sx={{ textAlign: "left", paddingLeft: "10px" }} width="6%">
        <Typography noWrap variant="h5">
          {appointment.SalesEmp}
        </Typography>
      </Grid>
    </Grid>
  );

  return (
    <Grid container width={"100vw"} bgcolor={"#F0F0F0"} height={"100vh"}>
      {/* Header */}
      <Grid
        container
        item
        height={"15vh"}
        justifyContent={"space-between"}
        alignItems={"center"}
        fontWeight={"bold"}
        fontFamily={"Montserrat-Regular"}
        bgcolor={"#2196F3"}
        color={"#fff"}
      >
        <Grid item width={"15vw"}>
          <img src={ORP_LOGO} alt="ORP" height="100%" width="100%" />
        </Grid>
        <Grid item>
          <Typography
            variant="h3"
            fontFamily={"Montserrat-Regular"}
            textTransform={"uppercase"}
            textAlign={"center"}
            noWrap
            color="white"
          >
            Today's &nbsp; Appointments
          </Typography>
        </Grid>
        <Grid>
          <Typography
            style={{
              fontFamily: "digital-7",
              fontSize: "2.5em",
              paddingRight: "46px",
              color: "white",
            }}
          >
            {dayjs(dateTimeValue).format("DD-MMM-YYYY HH:mm:ss")}
          </Typography>
          <div
            style={{
              fontSize: "34px",
              paddingRight: "30px",
              textTransform: "uppercase",
            }}
          >
            Total Appointments : {dailyAppointmentsList.length}
          </div>
        </Grid>
      </Grid>

      {/* Appointment Table */}
      <Grid item height={"83vh"} width={"100vw"} px={2}>
        <Card
          sx={{ height: "100%", width: "100%", backgroundColor: "#F5F5F5" }}
        >
          <Grid
            container
            py={2}
            fontWeight="bold"
            textTransform="uppercase"
            bgcolor="#64B5F6"
            color="#fff"
            px={1}
          >
            <Grid
              item
              sx={{ textAlign: "left", paddingLeft: "30px" }}
              width="9%"
            >
              <Typography noWrap variant="h5">
                CDT
              </Typography>
            </Grid>
            <Grid item sx={{ textAlign: "left" }} width="8%">
              <Typography noWrap variant="h5">
                APT
              </Typography>
            </Grid>
            <Grid item width="8%" sx={{ textAlign: "left" }}>
              <Typography noWrap variant="h5">
                Customer
              </Typography>
            </Grid>
            <Grid item width="8%" sx={{ textAlign: "left" }}>
              <Typography noWrap variant="h5">
                Contact#
              </Typography>
            </Grid>
            <Grid item width="44%" sx={{ textAlign: "left" }}>
              <Typography noWrap variant="h5">
                Job Remarks
              </Typography>
            </Grid>
            <Grid item sx={{ textAlign: "left" }} width="7%">
              <Typography noWrap variant="h5">
                Order No
              </Typography>
            </Grid>
            <Grid item sx={{ textAlign: "left" }} width="10%">
              <Typography noWrap variant="h5">
                Status
              </Typography>
            </Grid>
            <Grid
              item
              sx={{ textAlign: "left", paddingLeft: "10px" }}
              width="6%"
            >
              <Typography noWrap variant="h5">
                Sales Emp
              </Typography>
            </Grid>
          </Grid>

          <Grid
            item
            rowSpacing={3}
            width={"100%"}
            height={"100%"}
            px={1}
            className="marquee-container"
            ref={scrollRef}
            style={{
              height: "80vh",
              overflow: "hidden",
              paddingLeft: 10,
              paddingRight: 10,
            }}
            onMouseEnter={() => (isPaused.current = true)}
            onMouseLeave={() => (isPaused.current = false)}
          >
            {dailyAppointmentsList.length === 0 ? (
              <Typography textAlign="center" variant="h6">
                No More Appointments
              </Typography>
            ) : (
              <>
                {dailyAppointmentsList.map(renderAppointment)}
                <div style={{ height: gap }} />
                {dailyAppointmentsList.map(renderAppointment)}
              </>
            )}
          </Grid>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AppointmentScreen;
