import { Controller } from "react-hook-form";
import { InputTextField } from "./formComponents";
import { useState } from "react";

// Generic Input with local buffer
const GridInput = ({ control, name, row, type = "text", onBlur }) => {
  const [localValue, setLocalValue] = useState(row.value);

  return (
    <Controller
      control={control}
      name={`${name}_${row.id}`} // unique per row
      defaultValue={row[name] || ""}
      render={({ field }) => {

        return (
          <InputTextField
            type={type}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={() => {
              field.onChange(localValue); // commit value to form
              onBlur && onBlur(row, localValue); // trigger calculation
            }}
          />
        );
      }}
    />
  );
};

export default GridInput