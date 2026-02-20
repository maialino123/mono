# phantom.fixture.ts

Fixture wiring for Phantom wallet tests.

```ts
import { testWithSynpress } from "@synthetixio/synpress";
import { phantomFixtures } from "@synthetixio/synpress/playwright";
import phantomSetup from "../wallet-setup/phantom.setup";

export const test = testWithSynpress(phantomFixtures(phantomSetup));
export const { expect } = test;
```
