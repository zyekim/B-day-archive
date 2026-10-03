import assert from "node:assert/strict";
import test from "node:test";

import { boardLookupNames, boardStorageName } from "../lib/board-name";

test("boardStorageName uses the canonical board key when the display name differs", () => {
  assert.equal(
    boardStorageName(
      {
        friend_name: "jiyoung",
        display_name: "지영",
      },
      "지영",
    ),
    "jiyoung",
  );
});

test("boardStorageName falls back to the normalized route name before a board exists", () => {
  assert.equal(boardStorageName(null, "  Alice%20Kim  "), "alice kim");
});

test("boardLookupNames includes legacy display-name writes without duplicates", () => {
  assert.deepEqual(
    boardLookupNames(
      {
        friend_name: "jiyoung",
        display_name: "지영",
      },
      "jiyoung",
    ),
    ["jiyoung", "지영"],
  );
});
