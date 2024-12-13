import {
  AnyRoute,
  createRoute,
  createRouter,
  Route,
  Router,
  RouterProvider,
} from "@tanstack/react-router";
import React, {JSX} from "react";

export interface RouteDefinitionI {
  component: () => React.ReactNode;
}

export type RouteDefinitionsI = Record<string, RouteDefinitionI>;

export interface RouteLocaleI {
  definition: string;
  language: string;
  path: string;
}

export type RouteLocalesI = RouteLocaleI[];

export interface LocaleAwareRouteConfigI {
  root: AnyRoute;
  definitions: RouteDefinitionsI;
  routes: RouteLocalesI;
  defaultLanguage: string;
  supportedLanguages: string[];
}

export interface LanguageAwareRoute {
  key: string;
  language: string;
}

type NavigateParams<T> = {
  to: LanguageAwareRoute;
  from?: LanguageAwareRoute;
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
  hash?: string;
  method?: "replace" | "push";
  state?: T;
};

type AbsoluteHrefParams = {
  baseUrl: string;
} & HrefParams;

type HrefParams = {
  key: string;
  language: string;
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
  hash?: string;
};

export interface LuwioRouterI {
  reload(): void;
  goBack(): Promise<void>;
  navigate<T>({
    to,
    from,
    query,
    params,
    hash,
    method,
    state,
  }: NavigateParams<T>): Promise<void>;
  href({ key, language, query, params, hash }: HrefParams): string;
  relative({ key, language, query, params, hash }: HrefParams): string;
  absolute({ key, language, query, params, hash }: HrefParams): string;
  path(key: string, language: string): string;
  isActive(key: string, language: string): boolean;
  hasRoute(key: string, language: string): boolean;
  getTanstackProvider(): JSX.Element;
}

export class LuwioRouter implements LuwioRouterI {
  private readonly _config: LocaleAwareRouteConfigI;
  private readonly _router: Router<any, any, any>;

  constructor(config: LocaleAwareRouteConfigI) {
    this._config = config;

    // Define the type of the array based on what `addChildren` expects
    const routes: AnyRoute[] = this._config.routes
      .map((route: RouteLocaleI) => {
        const routeConfig = this._config.definitions[route.definition];

        if (!routeConfig) {
          return null; // Skip this route if no configuration is found.
        }

        if (!this._config.supportedLanguages.includes(route.language)) {
          return null; // Skip this route if language is not supported.
        }

        return createRoute({
          getParentRoute: () => this._config.root,
          path: this._buildPath(route.language, route.path),
          component: routeConfig.component,
        }) as AnyRoute; // Ensure the return type is AnyRoute
      })
      .filter((route): route is AnyRoute => route !== null); // Type guard to filter out null values

    this._router = createRouter({
      routeTree: this._config.root.addChildren(routes),
      trailingSlash: "never",
    });
  }

  public async goBack(): Promise<void> {
    this.router().history.back();
  }

  public reload(): void {
    window.location.reload();
  }

  public async navigate<T>({
    to,
    from,
    query,
    params,
    hash,
    method,
    state,
  }: NavigateParams<T>): Promise<void> {
    const toRoute = this._route(to.key, to.language.toString());
    if (!toRoute) {
      return Promise.reject(
        new Error(
          `Route (to) for key "${to.key}" and language "${to.language.toString()}" not found.`,
        ),
      );
    }

    let fromRoute = null;
    if (from) {
      fromRoute = this._route(from.key, from.language.toString());
      if (!fromRoute) {
        return Promise.reject(
          new Error(
            `Route (from) for key "${from.key}" and language "${from.language.toString()}" not found.`,
          ),
        );
      }
    }

    const options = {
      to: toRoute.fullPath,
      ...(fromRoute && {
        from: fromRoute.fullPath,
      }),
      ...(query && { search: query }),
      ...(params && { params }),
      ...(hash && { hash }),
      method,
      ...(state && { state }),
    };

    await this._router.navigate(options);
  }

  public absolute({
    baseUrl,
    key,
    language,
    query,
    params,
    hash,
  }: AbsoluteHrefParams): string {
    const href = this.href({
      key: key,
      language: language,
      query: query,
      params: params,
      hash: hash,
    });
    const strippedHref = href.startsWith("/") ? href.slice(1) : href;
    const strippedBaseUrl = baseUrl.endsWith("/")
      ? baseUrl.slice(0, -1)
      : baseUrl;
    return `${strippedBaseUrl}/${strippedHref}`;
  }

  public relative({ key, language, query, params, hash }: HrefParams) {
    return this.href({
      key: key,
      language: language,
      query: query,
      params: params,
      hash: hash,
    });
  }

  public href({ key, language, query, params, hash }: HrefParams): string {
    const route = this._route(key, language.toString());
    if (!route) {
      return "";
    }

    const options = {
      to: route.fullPath,
      ...(query && { search: query }),
      ...(params && { params: params }),
      ...(hash && { hash: hash }),
    };

    const parsedLocation = this._router.buildLocation(options);
    return parsedLocation.href;
  }

  public path(key: string, language: string): string {
    const route = this._route(key, language.toString());
    if (!route) {
      return "";
    }

    this._router.buildLocation({ to: route.fullPath });

    return route.fullPath;
  }

  public isActive(key: string, language: string): boolean {
    const currentLocation = this._router.__store.state.location;
    const route = this._route(key, language.toString());
    if (route) {
      return currentLocation.pathname === route.fullPath;
    }
    return false;
  }

  public hasRoute(key: string, language: string): boolean {
    const route = this._route(key, language.toString());
    return !!route;
  }

  private _route(key: string, language: string): Route | null {
    const definition = this._config.definitions[key] ?? null;
    if (!definition) {
      return null;
    }

    const route = this._config.routes.find(
      (route) => route.language === language && route.definition === key,
    );

    if (!route) {
      return null;
    }

    const path = this._buildPath(language, route.path);
    return this._router.routesByPath[path] ?? null;
  }

  private _buildPath(language: string, path: string): string {
    const defaultLng = this._config.defaultLanguage ?? "";
    const languageSafePath = path === "/" ? "" : path;

    return language !== defaultLng ? "/" + language + languageSafePath : path;
  }

  private router(): Router<any, any, any> {
    return this._router;
  }

  /**
   * Provides the RouterProvider component for our custom context without exposing the underlying router.
   */
  getTanstackProvider(): JSX.Element {
    return (
        <RouterProvider router={this._router} />
    );
  }
}
