import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

const UnitMapping = [
    {
        Unit: "Lbs",
        Value: 0,
    },
    {
        Unit: "Kg",
        Value: 1,
    }
];

export default function ConversionCalculatorInput() {
    const [inputUnit, setInputUnit] = React.useState(0);
    const [outputUnit, setOutputUnit] = React.useState(0);

    const [inputValue, setInputValue] = React.useState(0);
    const [outputValue, setOutputValue] = React.useState(0);

    const handleInputChange = (e) => { setInputUnit(e.target.value)}
    const handleOutputChange = (e) => { setOutputUnit(e.target.value)}

    const handleInputValue = (e) => { 
        const val = e.target.value;

        setInputValue(val);
        setOutputValue(val);
    }
    
    return (
        <Box>
            <TextField label="Input" type="number" value={inputValue} onChange={handleInputValue} />
            <Select value={inputUnit} onChange={handleInputChange} label="Input Units">
                {UnitMapping.map( (obj) => {
                    return <MenuItem value={obj.Value}>{obj.Unit}</MenuItem>;
                })}
            </Select>

            <TextField label="Output" type="number" value={outputValue} />
            <Select value={outputUnit} onChange={handleOutputChange} label="Output Units">
                {UnitMapping.map( (obj) => {
                    return <MenuItem value={obj.Value}>{obj.Unit}</MenuItem>;
                })}
            </Select>
        </Box>
    );
}