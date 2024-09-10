import { assertEquals } from "@std/assert/equals";
import { assertType, type IsExact } from "@std/testing/types";
import {
  create_link_generator,
  type ExtractRouteData,
  type FlatRoutes,
  flatten_route_config,
  type RouteConfig,
} from "../src/mod.ts";

const route_config = {
  string_param: {
    path: "/:param<string>",
  },
  number_param: {
    path: "/:param<number>",
  },
  boolean_param: {
    path: "/:param<boolean>",
  },
  string_query: {
    path: "/?key<string>",
  },
  number_query: {
    path: "/?key<number>",
  },
  boolean_query: {
    path: "/?key<boolean>",
  },
  strings_union_param: {
    path: "/:param<(a|b|c)>",
  },
  numbers_union_param: {
    path: "/:param<(1|2|3)>",
  },
  mix_union_param: {
    path: "/:param<(a|1|true)>",
  },
  strings_union_query: {
    path: "/?key<(a|b|c)>",
  },
  numbers_union_query: {
    path: "/?key<(1|2|3)>",
  },
  mix_union_query: {
    path: "/?key<(a|1|true)>",
  },
} as const satisfies RouteConfig;

const flat_route_config = flatten_route_config(route_config);

Deno.test("FlatRoutes type", () => {
  type ExpectedFlatRoutes = {
    string_param: "/:param<string>";
    number_param: "/:param<number>";
    boolean_param: "/:param<boolean>";
    string_query: "/?key<string>";
    number_query: "/?key<number>";
    boolean_query: "/?key<boolean>";
    strings_union_param: "/:param<(a|b|c)>";
    numbers_union_param: "/:param<(1|2|3)>";
    mix_union_param: "/:param<(a|1|true)>";
    strings_union_query: "/?key<(a|b|c)>";
    numbers_union_query: "/?key<(1|2|3)>";
    mix_union_query: "/?key<(a|1|true)>";
  };

  assertType<IsExact<FlatRoutes<typeof route_config>, ExpectedFlatRoutes>>(
    true,
  );
});

Deno.test("ExtractRouteData type", () => {
  type ExpectedExtractRouteData = {
    string_param: {
      path: "/:param";
      params: Record<"param", string>;
      queries: never;
    };
    number_param: {
      path: "/:param";
      params: Record<"param", number>;
      queries: never;
    };
    boolean_param: {
      path: "/:param";
      params: Record<"param", boolean>;
      queries: never;
    };
    string_query: {
      path: "/";
      params: never;
      queries: Record<"key", string>;
    };
    number_query: {
      path: "/";
      params: never;
      queries: Record<"key", number>;
    };
    boolean_query: {
      path: "/";
      params: never;
      queries: Record<"key", boolean>;
    };
    strings_union_param: {
      path: "/:param";
      params: Record<"param", "a" | "b" | "c">;
      queries: never;
    };
    numbers_union_param: {
      path: "/:param";
      params: Record<"param", 1 | 2 | 3>;
      queries: never;
    };
    mix_union_param: {
      path: "/:param";
      params: Record<"param", "a" | 1 | true>;
      queries: never;
    };
    strings_union_query: {
      path: "/";
      params: never;
      queries: Record<"key", "a" | "b" | "c">;
    };
    numbers_union_query: {
      path: "/";
      params: never;
      queries: Record<"key", 1 | 2 | 3>;
    };
    mix_union_query: {
      path: "/";
      params: never;
      queries: Record<"key", "a" | 1 | true>;
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
    string_param: "/:param<string>",
    number_param: "/:param<number>",
    boolean_param: "/:param<boolean>",
    string_query: "/?key<string>",
    number_query: "/?key<number>",
    boolean_query: "/?key<boolean>",
    strings_union_param: "/:param<(a|b|c)>",
    numbers_union_param: "/:param<(1|2|3)>",
    mix_union_param: "/:param<(a|1|true)>",
    strings_union_query: "/?key<(a|b|c)>",
    numbers_union_query: "/?key<(1|2|3)>",
    mix_union_query: "/?key<(a|1|true)>",
  } as const satisfies FlatRoutes<typeof route_config>;

  assertEquals(flat_route_config, expected_flat_route_config);
});

Deno.test(
  "The constraint area should be removed when creating the path",
  () => {
    const link = create_link_generator(flat_route_config);
    const path = link("string_param", { param: "a" });
    assertEquals(path, "/a");
  },
);