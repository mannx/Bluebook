import { useLoaderData, redirect, Link } from "react-router-dom";
import { UrlApiBackupGet } from "../URLs.jsx";

// import dayjs from "dayjs";

export async function loader({ params }) {
  const resp = await fetch(UrlApiBackupGet);
  const data = await resp.json();

  return data;
}

export default function Backup() {
  const data = useLoaderData();

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((obj) => {
            return (
              <tr>
                <td>{obj.id}</td>
                <td>{obj.DayDate}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
