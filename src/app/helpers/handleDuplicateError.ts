import { TGenericErrorResponse } from "../interfaces/error.types";


/* eslint-disable @typescript-eslint/no-explicit-any */
export const handleDuplicateError = (err: any): TGenericErrorResponse => {
  const matchArray = err.message.match(/"([^"]*)"/);
  return {
    statusCode: 400,
    message: `${matchArray[1]} is already exist.`,
  };
};