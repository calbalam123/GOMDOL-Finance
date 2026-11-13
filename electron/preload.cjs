const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("gomdolDesktop", Object.freeze({
  apiBaseUrl: "http://127.0.0.1:43117",
  platform: process.platform,
  isDesktop: true
}));
