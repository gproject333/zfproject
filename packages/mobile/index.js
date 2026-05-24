import { registerRootComponent } from "expo";
import App from "./App";

// Why this file: Expo's default `node_modules/expo/AppEntry.js` does a
// relative `import "../../App"` that breaks under pnpm because the real
// expo package lives under `node_modules/.pnpm/expo@.../node_modules/expo`.
// Registering the root component ourselves sidesteps the brittle path.
registerRootComponent(App);
