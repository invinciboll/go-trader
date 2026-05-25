import { useContext } from "react";
import { OpenCvContext } from "./openCvContext";

export const useOpenCv = () => {
  const ctx = useContext(OpenCvContext);

  if (!ctx) {
    throw new Error("useOpenCv must be used inside OpenCvProvider");
  }

  return ctx;
};