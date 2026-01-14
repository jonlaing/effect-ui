import { describe, expect, it } from "vitest";

import {
  calculateSpecificity,
  filePathToRouteName,
  filePathToRoutePath,
  routeNameToComponentImportName,
  routeNameToImportName,
} from "./utils/pathConversion";

describe("filePathToRoutePath", () => {
  it("should convert root index to /", () => {
    expect(filePathToRoutePath("_index.tsx")).toBe("/");
    expect(filePathToRoutePath("_index.ts")).toBe("/");
  });

  it("should convert static segments", () => {
    expect(filePathToRoutePath("about.tsx")).toBe("/about");
    expect(filePathToRoutePath("users.tsx")).toBe("/users");
    expect(filePathToRoutePath("users.settings.tsx")).toBe("/users/settings");
  });

  it("should convert dynamic segments with $", () => {
    expect(filePathToRoutePath("$id.tsx")).toBe("/:id");
    expect(filePathToRoutePath("users.$id.tsx")).toBe("/users/:id");
    expect(filePathToRoutePath("users.$userId.posts.$postId.tsx")).toBe(
      "/users/:userId/posts/:postId",
    );
  });

  it("should convert catch-all segments", () => {
    expect(filePathToRoutePath("$.tsx")).toBe("/*");
    expect(filePathToRoutePath("docs.$.tsx")).toBe("/docs/*");
  });

  it("should handle nested index routes", () => {
    expect(filePathToRoutePath("users._index.tsx")).toBe("/users");
    expect(filePathToRoutePath("admin.dashboard._index.tsx")).toBe(
      "/admin/dashboard",
    );
  });

  it("should return null for layout files", () => {
    expect(filePathToRoutePath("_layout.tsx")).toBeNull();
    expect(filePathToRoutePath("users._layout.tsx")).toBeNull();
    expect(filePathToRoutePath("admin.dashboard._layout.tsx")).toBeNull();
  });

  it("should skip pathless segments (underscore prefix)", () => {
    expect(filePathToRoutePath("_auth.login.tsx")).toBe("/login");
    expect(filePathToRoutePath("_admin.users.tsx")).toBe("/users");
  });

  it("should handle escape sequences with brackets", () => {
    expect(filePathToRoutePath("[index].tsx")).toBe("/index");
    expect(filePathToRoutePath("[$].tsx")).toBe("/$");
  });

  it("should handle mixed patterns", () => {
    expect(filePathToRoutePath("users.$id.edit.tsx")).toBe("/users/:id/edit");
    expect(filePathToRoutePath("posts.$postId.comments.$commentId.tsx")).toBe(
      "/posts/:postId/comments/:commentId",
    );
  });
});

describe("filePathToRouteName", () => {
  it("should convert root index", () => {
    expect(filePathToRouteName("_index.tsx")).toBe("index");
  });

  it("should convert static segments", () => {
    expect(filePathToRouteName("about.tsx")).toBe("about");
    expect(filePathToRouteName("users.tsx")).toBe("users");
    expect(filePathToRouteName("users.settings.tsx")).toBe("users_settings");
  });

  it("should preserve $ in route names", () => {
    expect(filePathToRouteName("users.$id.tsx")).toBe("users_$id");
    expect(filePathToRouteName("$id.tsx")).toBe("$id");
  });

  it("should handle nested index routes", () => {
    expect(filePathToRouteName("users._index.tsx")).toBe("users");
  });

  it("should handle layout routes", () => {
    expect(filePathToRouteName("users._layout.tsx")).toBe("users_layout");
  });
});

describe("routeNameToImportName", () => {
  it("should convert route names to PascalCase import names", () => {
    expect(routeNameToImportName("index")).toBe("IndexRoute");
    expect(routeNameToImportName("about")).toBe("AboutRoute");
    expect(routeNameToImportName("users")).toBe("UsersRoute");
    expect(routeNameToImportName("users_$id")).toBe("UsersIdRoute");
    expect(routeNameToImportName("users_settings")).toBe("UsersSettingsRoute");
  });
});

describe("routeNameToComponentImportName", () => {
  it("should convert route names to PascalCase component import names", () => {
    expect(routeNameToComponentImportName("index")).toBe("IndexComponent");
    expect(routeNameToComponentImportName("about")).toBe("AboutComponent");
    expect(routeNameToComponentImportName("users_$id")).toBe(
      "UsersIdComponent",
    );
  });
});

describe("calculateSpecificity", () => {
  it("should give higher specificity to static segments", () => {
    const staticScore = calculateSpecificity("/users/settings");
    const dynamicScore = calculateSpecificity("/users/:id");
    expect(staticScore).toBeGreaterThan(dynamicScore);
  });

  it("should give higher specificity to dynamic than catch-all", () => {
    const dynamicScore = calculateSpecificity("/users/:id");
    const catchAllScore = calculateSpecificity("/users/*");
    expect(dynamicScore).toBeGreaterThan(catchAllScore);
  });

  it("should give bonus for longer paths", () => {
    const shorterScore = calculateSpecificity("/users");
    const longerScore = calculateSpecificity("/users/profile");
    expect(longerScore).toBeGreaterThan(shorterScore);
  });

  it("should handle mixed paths correctly", () => {
    const moreSpecific = calculateSpecificity("/users/:id/edit");
    const lessSpecific = calculateSpecificity("/users/:id");
    expect(moreSpecific).toBeGreaterThan(lessSpecific);
  });
});
