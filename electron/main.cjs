const { app, BrowserWindow, shell } = require("electron");
const path = require("node:path");

let api;

async function createWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 920, minWidth: 1050, minHeight: 680,
    title: "GOMDOL Finance", backgroundColor: "#0b1020", autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  const devUrl = process.env.VITE_DEV_SERVER_URL || (!app.isPackaged ? "http://localhost:5173" : null);
  if (devUrl) {
    await win.loadURL(devUrl);
    if (process.env.GOMDOL_DEVTOOLS === "1") win.webContents.openDevTools({ mode: "detach" });
  } else {
    await win.loadFile(path.join(__dirname, "..", "frontend", "dist", "index.html"));
  }
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") || url.startsWith("http://")) shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(async () => {
  try {
    const { startServer } = await import("../backend/src/server.js");
    api = await startServer({ port: Number(process.env.GOMDOL_API_PORT || 0), databasePath: path.join(app.getPath("userData"), "data", "gomdol-finance.sqlite") });
    process.env.GOMDOL_API_URL = `http://127.0.0.1:${api.port}`;
    await createWindow();
  } catch (error) {
    console.error("GOMDOL Finance startup failed:", error);
    app.quit();
  }
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on("before-quit", () => { if (api) api.close().catch(error => console.error("API shutdown error:", error)); });
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
