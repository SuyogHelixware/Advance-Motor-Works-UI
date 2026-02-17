import React from "react";
import { Controller, useWatch } from "react-hook-form";
import dayjs from "dayjs";
import InputTextField from "./InputTextField"; // your custom component

const AppointmentTimeField = ({
  control,
  dateFieldName = "AppointDate",
  name = "AppointTime",
  label = "APPOINTMENT TIME",
}) => {
  const watchedDate = useWatch({ control, name: dateFieldName });
  const now = dayjs();

  const isToday = watchedDate && dayjs(watchedDate).isSame(now, "day");

  const workStart = "08:00";
  const workEnd = "20:00";

  const isWorkClosed = isToday && now.isAfter(dayjs().hour(20).minute(0));

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: "Time is required",
        validate: (value) => {
          if (!value) return "Time is required";

          const selected = dayjs(value, "HH:mm");

          if (
            selected.isBefore(dayjs(workStart, "HH:mm")) ||
            selected.isAfter(dayjs(workEnd, "HH:mm"))
          ) {
            return "Time must be between 08:00 AM and 08:00 PM";
          }

          if (isToday && selected.isBefore(now)) {
            return "Past time not allowed";
          }

          return true;
        },
      }}
      render={({ field, fieldState: { error } }) => (
        <InputTextField
          {...field}
          type="time"
          label={label}
          disabled={isWorkClosed}
          InputLabelProps={{ shrink: true }}
          error={!!error}
          helperText={error?.message}
          onKeyDown={(e) => e.preventDefault()}
          inputProps={{
            min: isToday ? now.format("HH:mm") : workStart,
            max: workEnd,
            step: 1800, // 30-minute slot
          }}
        />
      )}
    />
  );
};

export default AppointmentTimeField;
