import { assertEquals } from "@std/assert/equals";
import { assertType, type IsExact } from "@std/testing/types";
import {
  create_link_generator,
  type DefaultParamValue,
  type ExtractRouteData,
  type FlatRoutes,
  flatten_route_config,
  type RouteConfig,
} from "../src/mod.ts";

const route_config = {
  http: {
    path: "http://",
    children: {
      localhost: {
        path: "localhost:3000",
        children: {
          static: {
            path: "/name",
          },
          with_param: {
            path: "/:param",
          },
          with_query: {
            path: "/name?key",
          },
        },
      },
    },
  },
} as const satisfies RouteConfig;

const flat_route_config = flatten_route_config(route_config);

Deno.test("FlatRoutes type", () => {
  type ExpectedFlatRoutes = {
    http: "http://";
    "http/localhost": "http://localhost:3000";
    "http/localhost/static": "http://localhost:3000/name";
    "http/localhost/with_param": "http://localhost:3000/:param";
    "http/localhost/with_query": "http://localhost:3000/name?key";
  };

  assertType<IsExact<FlatRoutes<typeof route_config>, ExpectedFlatRoutes>>(
    true,
  );
});

Deno.test("ExtractRouteData type", () => {
  type ExpectedExtractRouteData = {
    http: {
      path: "http://";
      params: never;
      queries: never;
    };
    "http/localhost": {
      path: "http://localhost:3000";
      params: never;
      queries: never;
    };
    "http/localhost/static": {
      path: "http://localhost:3000/name";
      params: never;
      queries: never;
    };
    "http/localhost/with_param": {
      path: "http://localhost:3000/:param";
      params: Record<"param", DefaultParamValue>;
      queries: never;
    };
    "http/localhost/with_query": {
      path: "http://localhost:3000/name";
      params: never;
      queries: Record<"key", DefaultParamValue>;
    };
  };

  assertType<
    IsExact<
      ExtractRouteData<typeof flat_route_config>,
      ExpectedExtractRouteData
    >
  >(true);
});

Deno.test("flatten_route_config", () => {
  const expected_flat_route_config = {
    http: "http://",
    "http/localhost": "http://localhost:3000",
    "http/localhost/static": "http://localhost:3000/name",
    "http/localhost/with_param": "http://localhost:3000/:param",
    "http/localhost/with_query": "http://localhost:3000/name?key",
  } as const satisfies FlatRoutes<typeof route_config>;

  assertEquals(flat_route_config, expected_flat_route_config);
});

Deno.test("create_link_generator", () => {
  const link = create_link_generator(flat_route_config);
  const protocol = link("http");
  const path_to_localhost = link("http/localhost");
  const path_to_static = link("http/localhost/static");
  const path_to_with_param = link("http/localhost/with_param", { param: "a" });
  const path_to_with_query = link("http/localhost/with_query", undefined, {
    key: "a",
  });

  assertEquals(protocol, "http://");
  assertEquals(path_to_localhost, "http://localhost:3000");
  assertEquals(path_to_static, "http://localhost:3000/name");
  assertEquals(path_to_with_param, "http://localhost:3000/a");
  assertEquals(path_to_with_query, "http://localhost:3000/name?key=a");
});