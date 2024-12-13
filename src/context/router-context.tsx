import React, { createContext, FC } from "react";
import {
  LocaleAwareRouteConfigI,
  LuwioRouter,
  LuwioRouterI,
} from "@/domain";

export const RoutingContext = createContext<LuwioRouterI | undefined>(
  undefined,
);

export const RoutingProvider: FC<LocaleAwareRouteConfigI> = (props) => {
  const localeAwareRouter = new LuwioRouter(props);

  return (
    <RoutingContext.Provider value={localeAwareRouter}>
      {localeAwareRouter.getTanstackProvider()}
    </RoutingContext.Provider>
  );
};
