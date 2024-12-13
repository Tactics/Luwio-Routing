# Luwio Routing

The `LuwioRouter` is a powerful routing solution designed specifically for modern browser-based applications.
Built on top of the robust [@tanstack/router](https://tanstack.com/router/latest/docs/framework/react/overview),
it simplifies routing by exposing only the most essential, curated features developers need.

With built-in support for multi-language routing, `LuwioRouter` enables seamless navigation
across different locales, making it an ideal choice for internationalized applications.
It integrates smoothly with your existing route definitions while providing an intuitive API
that reduces boilerplate and improves clarity.

`LuwioRouter` streamlines complex routing scenarios and empowers developers to focus on building
dynamic, language-aware applications with minimal configuration.

## How It Works

In `LuwioRouter`, routing is broken down into two main parts:

1. **Route Definitions**: You define which component should render for each route. These definitions determine the core structure of your application’s navigation, linking routes to components.

2. **Route Locales**: Each route can have optional translations that directs to the same component in different languages. This allows you to define localized paths for your routes while keeping the rendering logic consistent across languages.

As part of this, you will also define the **default language** (the main language of the application)
and **supported languages** (any additional languages). The default language routes do not have a language
prefix, while supported languages receive a language prefix (e.g., `/be/` for Belgian).

### Basic Example

Let’s walk through setting up `LuwioRouter` in your application.

#### Setting Up the Route Definitions and Locales

Let’s say you have a home page, an about page and a location detail page. In English, these would be accessed via
`/`, `/about`, `/location/{slug}` , while in Belgian, they would be accessed via `/be`, `/be/over-ons` and `/be/locatie/{slug}`.

Here’s how you define these in `LuwioRouter`:

```typescript
// Routes.ts

export enum RouteKeys {
  Main = "main",
  About = "about",
  Locations = "locations",
  Location = "location",
}

// Define which components should render for each route
const routeDefinitions: RouteDefinitionsI = {
  home: { component: HomeComponent },
  about: { component: AboutComponent },
  locations: { component: LocationsComponent },
  location: { component: LocationComponent },
};

// Define locale-specific paths for each route
const routeLocales: RouteLocalesI = [
  { definition: RouteKeys.Main, language: "en", path: "/" },
  { definition: RouteKeys.Main, language: "be", path: "/" },
  { definition: RouteKeys.About, language: "en", path: "/about" },
  { definition: RouteKeys.About, language: "be", path: "/over-ons" },
  { definition: RouteKeys.Locations, language: "en", path: "/locations" },
  { definition: RouteKeys.Locations, language: "be", path: "/locaties" },
  { definition: RouteKeys.Location, language: "en", path: "/location/$slug" },
  { definition: RouteKeys.Location, language: "be", path: "/locatie/$slug" },
];
```

The following setup above gives you:

- **Home Route**:

    - For the default language `en` (English), the home route will be accessible at `/`.
    - For the `be` (Belgian) locale, the home route will also be accessible at `/be/`.

- **About Route**:
    - For the default language `en`, the about page will be accessible at `/about`.
    - For the `be` locale, the about page will be accessible at `/be/over-ons`.
- **Locations Route**:

    - For the default language `en`, the about page will be accessible at `/locations`.
    - For the `be` locale, the about page will be accessible at `/be/locaties`.

- **Location Route**:
    - For the default language `en`, the about page will be accessible at `/location/$slug`.
    - For the `be` locale, the about page will be accessible at `/be/locatie/$slug`.

Since English is defined as the default language, routes for it do not have a language prefix. In contrast, the `be` locale automatically receives the `/be/` prefix, distinguishing it from the default language.

This setup allows for seamless multi-language support, where each route can have different paths based on the selected language while reusing the same component logic.

#### Setting Up the Route Provider

After defining your routes and locales, the next step is to set up the `RoutingProvider`.
The `RoutingProvider` is the core of your application's routing logic, integrating your route definitions,
locale settings, and root configuration. This provider makes your routes available throughout the application
and handles the multi-language routing.

```react
// Router.tsx

import { RoutingProvider } from "@tactics/luwio-app";
import { LocaleRoutes, RouteDefinitions } from "Routes";

import { AnyRoute } from "@tanstack/react-router";
import { createRootRoute } from '@tanstack/react-router';
const RootRoute = createRootRoute({
  component: () => <RootPage />,
});

export const Router = () => {
  // You can implement your own logic to manage the default and supported language, or leverage LuwioI18n for seamless integration, as demonstrated here.
  const {defaultLanguage, supportedLanguages} = useLanguage();

  return (
    <RoutingProvider
      definitions={routeDefinitions}
      routes={routeLocales}
      defaultLanguage={defaultLanguage} // 'en'
      supportedLanguages={supportedLanguages} // ['en', 'nl']
      root={RootRoute as AnyRoute} // Here you add the root route just like you would with tanstack router.
    />
  );
};
```

#### Last Step: Include the Router in Your App

After setting up your `Router` component, the final step is to include it in your application. This is done
by rendering the `Router` component within your main application file, which is usually `index.tsx` or `App.tsx`.

1. **Integrate the Router Component**:
   Make sure that you have already created the `Router` component as previously discussed, which sets up your routes and language configurations.

2. **Render the Router in Your Application**:
   In your `index.tsx`, you have already set up the router. Here’s a summary of how that looks:

```react
// index.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Router } from './Router'; // Import your Router component

const rootElement = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Router /> {/* Render the Router component to handle routing */}
  </React.StrictMode>,
);
```

## Using the Router

Once you have set up the `LuwioRouter` in your application, you can start utilizing its features to
manage navigation and handle routes efficiently. Below are the key functionalities and examples of
how to use the router.

### Navigating Between Routes

The `LuwioRouter` provides a `navigate` method that allows you to programmatically navigate between different
routes in your application. Here’s how you can use it:

#### Example of Navigation

```react
import { useRouter } from "@tactics/luwio-app";
import RouteKeys from "./Routes.ts" // Import your RouteKey enum, for easy access to available routes.

const ExampleComponent = () => {
  const router = useRouting();

  // You can implement your own logic to manage the current language, or leverage LuwioI18n for seamless integration, as demonstrated here.
  const { currentLanguage } = useLanguage();

  const handleNavigationToDetails = () => {
    router.navigate({
      to: { key: RouteKeys.Location, language: currentLanguage }, // Specify the target route and language
      params: { slug: "my-location-name" }, // Optional route parameters when needed, defined in route locales ($slug).
      query: { sort: "ASC" }, // Optional query parameters when needed.
    });
  };

   const handleNavigationToAll = () => {
    router.navigate({
      to: { key: RouteKeys.Locations, language: currentLanguage }, // Specify the target route and language
      query: { sort: "ASC" }, // Optional query parameters when needed.
    });
  };

  return (
      <>
        <button onClick={handleNavigationToDetails}>
          Go to Location Page
        </button>
        <button onClick={handleNavigationToAll}>
          View All
        </button>
      </>
  );
};
```

## Using the Hooks

The `useRoutingParams` and `useRoutingQuery` hooks provide a streamlined way to access route parameters
and search query parameters within your components. Importantly, these hooks are reactive: they watch
for changes in the URL, automatically triggering re-renders in your components when parameters change.

### `useRoutingParams`

The `useRoutingParams` hook is designed to retrieve routing parameters for a specified route. This hook
is useful for components that need to access dynamic parameters from the URL.

#### Usage

To use the `useRoutingParams` hook, pass an object containing the `router` and the current route `route`:

```react
import { useRoutingParams } from "@tactics/luwio-app";

const MyComponent = () => {
  const router = useRouting();

   // You can implement your own logic to manage the current language, or leverage LuwioI18n for seamless integration, as demonstrated here.
  const { currentLanguage } = useLanguage();

  const route = {
    key: RouteKeys.Location,
    language: currentLanguage
  };

  // Get route parameters
  const params = useRoutingParams({ router, route });

  return (
    <div>
      <h1>Current Route Parameters:</h1>
      <pre>{JSON.stringify(params, null, 2)}</pre>
    </div>
  );
};
```

### `useRoutingQuery`

The `useRoutingQuery` hook is designed to retrieve routing search query parameters for a specified route.
This hook is useful for components that need to access dynamic parameters from the URL.

#### Usage

To use the `useRoutingQuery` hook, pass an object containing the `router` and the current route `route`:

```react
import { useRoutingQuery } from "@tactics/luwio-app";

const MyComponent = () => {
  const router = useRouting();

   // You can implement your own logic to manage the current language, or leverage LuwioI18n for seamless integration, as demonstrated here.
  const { currentLanguage } = useLanguage();

  const route = {
    key: RouteKeys.Locations,
    language: currentLanguage
  };

  // Get route parameters
  const params = useRoutingQuery({ router, route });
  const getSortFromParams = (params : any) => {
    return params && params.sort && ['ASC', 'DESC'].includes(params.sort) ? params.sort : 'ASC';
  }

  const [sort, setSort] = useState<'ASC'|'DESC'>(getSortFromParams(params));

  // When route params change, it means a new sort list will be needed.
  // So we need the list to scroll back to the top.
  useEffect(() => {
    setSort(getSortFromParams(params));
  }, [params]);

  return (
    <div>
      <h1>Current Route Search Query Parameters:</h1>
      <pre>{JSON.stringify(params, null, 2)}</pre>
    </div>
  );
};
```
