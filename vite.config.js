import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import envCompatible from "vite-plugin-env-compatible";
import svgrPlugin from "vite-plugin-svgr";
import path from "path";
import * as child from "child_process";


// https://vitejs.dev/config/
// https://stackoverflow.com/questions/71162040/how-to-insert-git-info-in-environment-variables-using-vite
// https://stackoverflow.com/questions/70436753/how-to-add-commit-hash-into-reactjs-vite-config-js
export default defineConfig(({ command, mode }) => {
    const hardcodedPath = [
        // Windows
        'C:\\Windows\\System32',
        'C:\\Windows',
        'C:\\Program Files',
        'C:\\Program Files (x86)',

        // Linux and macOS
        '/bin',
        '/usr/bin',
        '/usr/local/bin',
        '/usr/sbin',
        '/usr/local/sbin',
        '/Applications', // for macOS
    ];
    process.env.PATH = hardcodedPath.join(path.delimiter);

    let commitHash = "";
    let commitDate = "";
    try {
        commitHash = child.execSync("git rev-parse --short HEAD").toString().trimEnd();
        commitDate = child.execSync("git log -1 --format='%ad' --date=short --date=format:'%m/%d/%Y'").toString().trimEnd();
    } catch (error) {
        console.error("Error occurred while fetching git information: ", error);
        commitHash = "unknown";
        commitDate = "unknown";
    }

    // Common error string is "fatal: not a git repository (or any of the parent directories): .git"
    if (commitHash.includes("fatal")) {
        console.error("Error occurred while fetching git short hash: ", commitHash);
        commitHash = "unknown";
    }
    if (commitDate.includes("fatal")) {
        console.error("Error occurred while fetching git commit date: ", commitDate);
        commitDate = "unknown";
    }
    process.env.REACT_APP_GIT_SHORT_HASH = commitHash;
    process.env.REACT_APP_GIT_COMMIT_DATE = commitDate;

    const env = loadEnv(mode, process.cwd(), '')

    return {
        envPrefix: 'REACT_APP_',
        // This changes the out put dir from dist to build
        // comment this out if that isn't relevant for your project
        build: {
            outDir: "build",
        },
        base: env.REACT_APP_ENDPOINT,
        plugins: [
            react(),
            envCompatible(),
            svgrPlugin({
                svgrOptions: {
                    icon: true,
                    // ...svgr options (https://react-svgr.com/docs/options/)
                },
            }),
        ],
        server: {
            host: "localhost", // change to 0.0.0.0 or true to listen on all addresses
            port: 3000,
        },
    };
})
