import { useLoaderData, Form } from "react-router-dom";

export async function loader() {
  const resp = await fetch("http://localhost:8080/api/test/ok");
  const data = await resp.json();

  return { data };
}

interface TestMessage {
  Number: number;
  Msg: string;
}

// interface TestInfo {
//   Error: boolean;
//   Message: string;
//   Data: TestMessage;
// }

interface ApiReturnMessage {
  Error: boolean;
  Message: string;
}

interface TestApiMessage extends ApiReturnMessage {
  Data: TestMessage;
}

export default function TestApi() {
  const { data }: TestApiMessage = useLoaderData();

  return (
    <>
      Error: {data.Error.toString()}
      <br />
      Message: {data.Message}
      <br />
      {data.Error === false ? display(data) : <></>}
    </>
  );
}

function display(data) {
  return (
    <>
      Number: {data.Data.Number}
      <br />
      Msg: {data.Data.Msg}
      <br />
    </>
  );
}
