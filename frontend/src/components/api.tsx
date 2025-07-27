interface ApiReturnMessage<DataType> {
  Error: boolean;
  Message: string;
  (Data: DataType): DataType;
}

export default ApiReturnMessage;
