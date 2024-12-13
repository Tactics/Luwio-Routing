export type {
  RoutingParamI,
  RoutingQueryI,
} from "@/hooks/use-routing-params";

export { useRouting } from "@/hooks/use-routing";
export { useRoutingParams } from "@/hooks/use-routing-params";
export { useRoutingQuery } from "@/hooks/use-routing-params";

export { RoutingProvider } from "@/context/router-context";

export { LuwioRouter } from "@/domain";
export type { LuwioRouterI } from "@/domain";

export type {
  LocaleAwareRouteConfigI,
  RouteDefinitionI,
  RouteLocaleI,
  RouteDefinitionsI,
  RouteLocalesI,
} from "@/domain";
