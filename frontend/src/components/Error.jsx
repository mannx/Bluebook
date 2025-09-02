import { Typography } from "@mui/material";

// Display an error, or call the callback with the data provided, along with the resp data in case of wanting to show
// the message if no error
export default function ErrorOrData(resp, dataCallback) {
  if (resp.Error !== undefined && resp.Error === true) {
    return (
      <>
        <div>
          <Typography sx={{ color: "red" }} variant="h5">
            {resp.Message}
          </Typography>
        </div>
      </>
    );
  }

  // const data = JSON.parse(resp.Data);
  const data = resp.Data;
  return dataCallback(data, resp);
}

export function ShowOnError(resp) {
  if (resp === undefined) {
    return <></>;
  }

  if (resp.Error !== undefined && resp.Error === true) {
    return (
      <>
        <div>
          <Typography sx={{ color: "red" }} variant="h5">
            {resp.Message}
          </Typography>
        </div>
      </>
    );
  } else {
    if (
      resp.Error !== undefined &&
      resp.Error === false &&
      resp.Message !== undefined
    ) {
      // have a non error status message to show
      return (
        <>
          <div>
            <Typography sx={{ color: "green" }} varian="h5">
              {resp.Message}
            </Typography>
          </div>
        </>
      );
    }
    return <></>;
  }
}
