import { useFilePicker } from "use-file-picker";

export default function InputTest() {
  const { openFilePicker, plainFiles, loading, errors } = useFilePicker({
    readAs: "",
  });
}
