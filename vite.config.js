import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import envCompatible from "vite-plugin-env-compatible";
import svgrPlugin from "vite-plugin-svgr";
import * as child from "child_process";


// https://vitejs.dev/config/
// https://stackoverflow.com/questions/71162040/how-to-insert-git-info-in-environment-variables-using-vite
// https://stackoverflow.com/questions/70436753/how-to-add-commit-hash-into-reactjs-vite-config-js
export default defineConfig(() => {
    const commitHash = child.execSync("git rev-parse --short HEAD").toString().trimEnd();
    const commitDate = child.execSync("git log -1 --format='%ad' --date=short --date=format:'%m/%d/%Y'").toString().trimEnd();
    const errString = "fatal: not a git repository (or any of the parent directories): .git"
    const errStringShort = "Err: not a git repository";

    if (commitHash !== errString && commitDate !== errString) {
        process.env.REACT_APP_GIT_SHORT_HASH = commitHash;
        process.env.REACT_APP_GIT_COMMIT_DATE = commitDate;
    } else {
        process.env.REACT_APP_GIT_SHORT_HASH = errStringShort;
        process.env.REACT_APP_GIT_COMMIT_DATE = errStringShort;
    }

    return {
        envPrefix: 'REACT_APP_',
        // This changes the out put dir from dist to build
        // comment this out if that isn't relevant for your project
        build: {
            outDir: "build",
        },
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
            host: "localhost",
            port: 3000,
        },
    };
})
