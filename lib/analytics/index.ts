// The public surface. `AnalyticsEvent` and `AnalyticsAdapter` are deliberately
// not re-exported here: call sites pass an object literal to `track()` and are
// checked against the union structurally, so nothing outside this folder has
// ever needed to name the types — and an unused re-export is exactly what knip
// is here to catch. Import them from "./types" if that changes.
export { registerAdapter, track } from "./track";
export { gaAdapter } from "./adapters/ga";
export { debugAdapter } from "./adapters/debug";
