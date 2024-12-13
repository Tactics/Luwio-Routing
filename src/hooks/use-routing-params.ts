import { useParams, useSearch } from "@tanstack/react-router";
import { LanguageAwareRoute, LuwioRouterI } from "@/packages/routing/domain";

export interface BaseRoutingHookI {
  router: LuwioRouterI;
  route: LanguageAwareRoute;
}

export interface RoutingParamI extends BaseRoutingHookI {}
export interface RoutingQueryI extends BaseRoutingHookI {}

export function useRoutingParams({ router, route }: RoutingParamI): any {
  const path = router.path(route.key, route.language);
  return useParams({ from: path });
}

export function useRoutingQuery({ router, route }: RoutingQueryI): any {
  const path = router.path(route.key, route.language);
  return useSearch({ from: path });
}
