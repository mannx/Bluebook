import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";

const portionSizes = [2.5, 3.0];

// required parameters:
//  callback -> function to call when the "copy" button is pressed, recieves a float value of the result
//  buttonText -> optional to change the value of the copy button text
export default function PortionConverter(params) {
  const [inputValue, setInputValue] = React.useState(0);
  const [portionSize, setPortionSize] = React.useState(portionSizes[1]);
  const [outputValue, setOutputValue] = React.useState(0);

  // convert between the input value (i) and portion size (p)
  const handleConversion = (i, p) => {
    const out = i * p;
    setOutputValue(+out.toFixed(2));
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    handleConversion(e.target.value, portionSize);
  };
  const handlePortionChange = (e) => {
    setPortionSize(e.target.value);
    handleConversion(inputValue, e.target.value);
  };

  const callCallback = () => {
    if (params.callback !== undefined) {
      params.callback(outputValue);
    }
  };

  const buttonText = params.buttonText || "Copy";

  return (
    <Box>
      <Container>{/* <span>{errMsg}</span> */}</Container>

      <TextField
        label="Portion Count"
        type="number"
        value={inputValue}
        onChange={handleInputChange}
      />
      <Select
        value={portionSize}
        onChange={handlePortionChange}
        label="Portion Size"
      >
        {portionSizes.map((obj) => {
          return <MenuItem value={obj}>{obj}</MenuItem>;
        })}
      </Select>

      <TextField
        label="Output Value"
        type="number"
        value={outputValue}
        disabled
      />

      <Button onClick={callCallback}>{buttonText}</Button>
    </Box>
  );
}
