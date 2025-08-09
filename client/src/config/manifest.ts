import localhost from "../../../contract/manifest_dev.json";

// Export only localhost manifest
export const manifest = localhost;

export type Manifest = typeof manifest;