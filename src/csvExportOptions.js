import config from "./config";

// DataGrid csvOptions with a unique file name like PVInfo_PVs_2026-10-20_134502.csv
// fileName is a getter so the timestamp is from when export is clicked, not when the grid rendered
function csvExportOptions(tableName) {
    return {
        get fileName() {
            const pad = (num) => String(num).padStart(2, "0");
            const now = new Date();
            const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
            const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
            const siteName = (config.WEBSITE_NAME || "PVInfo").replace(/\s+/g, "");
            return `${siteName}_${tableName}_${date}_${time}`;
        },
    };
}

export default csvExportOptions;
