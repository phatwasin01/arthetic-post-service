import dotenv from "dotenv";
dotenv.config();

namespace SetEnv {
  export const toString = (v: any): string => `${v}`;
  export const toInteger = (v: any): number => {
    if (isNaN(Number(v))) {
      return 0;
    }
    return parseInt(v, 10);
  };
  export const toNumber = (v: any): number => {
    if (isNaN(Number(v))) {
      return 0;
    }
    return Number(v);
  };
  export const toBoolean = (v: any): boolean => {
    if (typeof v === "boolean") {
      return v;
    }
    if (v === "true") {
      return true;
    }
    return false;
  };
}

export const config = {
  port: SetEnv.toInteger(process.env.PORT),
};