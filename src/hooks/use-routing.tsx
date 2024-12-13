import { useContext } from "react";
import { LuwioRouterI } from "@/domain";
import { RoutingContext } from "@/context/router-context";

export const useRouting = (): LuwioRouterI => {
  const router = useContext(RoutingContext);
  if (router === undefined) {
    throw new Error("useRouting must be used within a RoutingProvider");
  }
  return router;
};
