import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";

export const UNIT_LBS = 0;
export const UNIT_KGS = 1;
export const UNIT_GRAMS = 2;
export const UNIT_OUNCES = 3;

const UnitMapping = [
    {
        Unit: "Lbs",
        Value: UNIT_LBS,
    },
    {
        Unit: "Kg",
        Value: UNIT_KGS,
    },
    {
        Unit: "Gram",
        Value: UNIT_GRAMS,
    },
    {
        Unit: "Ounce",
        Value: UNIT_OUNCES,
    },
];

// <ConversionCalculatorInput callback={()=>{...}} useCallback />
// if useCallback is provided a copy button will be displayed and will call the function
// provided by the 'callback' parameter with the conversion out value and output unit type
export default function ConversionCalculatorInput(params) {
    const [inputUnit, setInputUnit] = React.useState(UNIT_LBS);
    const [outputUnit, setOutputUnit] = React.useState(UNIT_KGS);

    const [inputValue, setInputValue] = React.useState(0);
    const [outputValue, setOutputValue] = React.useState(0);

    const [errMsg, setErrMsg] = React.useState(null);

    const handleConversion = (i, o, v) => {
        // use inputValue if we weren't given a v.  pass v when setting inputValue to make sure its sent correctly
        const val = v || inputValue;
        const out = performConversion(i, v, o);

        if(out === undefined) {
            // unable to convert
            setErrMsg("Unable to convert between units " + getUnitName(i) + " and " + getUnitName(o));
        }else{
            // +out.toFixed to round to 2 decimal places
            setOutputValue(+out.toFixed(2));
            setErrMsg(null);
        }
    }

    const handleInputChange = (e) => { setInputUnit(e.target.value); handleConversion(e.target.value, outputUnit); }
    const handleOutputChange = (e) => { setOutputUnit(e.target.value); handleConversion(inputUnit, e.target.value); }

    const handleInputValue = (e) => { 
        const val = e.target.value;
        setInputValue(val);

        handleConversion(inputUnit, outputUnit, val);
    }
    
    const callCallback = () => {
        if(params.callback !== undefined) {
            params.callback(outputValue, outputUnit);
        }
    };
    const button = params.useCallback === true ? <Button onClick={callCallback}>Copy</Button> : <></>;

    return (
        <Box>
            <Container>
                <span>{errMsg}</span>
            </Container>

            <TextField label="Input" type="number" value={inputValue} onChange={handleInputValue} />
            <Select value={inputUnit} onChange={handleInputChange} label="Input Units">
                {UnitMapping.map( (obj) => {
                    return <MenuItem value={obj.Value}>{obj.Unit}</MenuItem>;
                })}
            </Select>

            <TextField label="Output" type="number" value={outputValue} disabled/>
            <Select value={outputUnit} onChange={handleOutputChange} label="Output Units">
                {UnitMapping.map( (obj) => {
                    return <MenuItem value={obj.Value}>{obj.Unit}</MenuItem>;
                })}
            </Select>

            {button}
        </Box>
    );
}

const convMappings = [
    // Input: Lbs
    {
        Input: UNIT_LBS,
        Output: UNIT_KGS,
        Func: (n) => {return n/2.205; }
    },
    {
        Input: UNIT_LBS,
        Output: UNIT_GRAMS,
        Func: (n) => {return n*453.6; }
    },
    {
        Input: UNIT_LBS,
        Output: UNIT_OUNCES,
        Func: (n) => {return n*16; }
    },

    // Input: Ounces
    {
        Input: UNIT_OUNCES,
        Output: UNIT_LBS,
        Func: (n) => {return n/16; }
    },
    {
        Input: UNIT_OUNCES,
        Output: UNIT_KGS,
        Func: (n) => {return n/35.274; }
    },
    {
        Input: UNIT_OUNCES,
        Output: UNIT_GRAMS,
        Func: (n) => {return n*28.35; }
    },

    // Input: Grams
    {
        Input: UNIT_GRAMS,
        Output: UNIT_LBS,
        Func: (n) => {return n/453.6; }
    },
    {
        Input: UNIT_GRAMS,
        Output: UNIT_OUNCES,
        Func: (n) => {return n/28.35; }
    },
    {
        Input: UNIT_GRAMS,
        Output: UNIT_KGS,
        Func: (n) => {return n/1000; }
    },

    // Input: Kgs
    {
        Input: UNIT_KGS,
        Output: UNIT_LBS,
        Func: (n) => {return n*2.205; }
    },
    {
        Input: UNIT_KGS,
        Output: UNIT_GRAMS,
        Func: (n) => {return n*1000; }
    },
    {
        Input: UNIT_KGS,
        Output: UNIT_OUNCES,
        Func: (n) => {return n*35.274; }
    },
];

function performConversion(inputType, inputValue, outputType) {
    // find the conversion function if we can
    for(let i = 0; i < convMappings.length; i++) {
        if(convMappings[i].Input == inputType && convMappings[i].Output == outputType) {
            return convMappings[i].Func(inputValue);
        }
    }

    console.log("Unable to convert between " + inputType + " and " + outputType);
    return undefined;
}

function getUnitName(unit) { 
    for(let i = 0; i < UnitMapping.length; i++) {
        if(UnitMapping[i].Value === unit) {
            return UnitMapping[i].Unit;
        }
    }

    return "UNKNOWN UNIT";
}