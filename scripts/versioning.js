const fs = require("fs");
const { execSync } = require("child_process");

const noChange = "__NO_CHANGE__";

function exec(command) {
  const output = execSync(command, { encoding: "utf-8" });
  console.log(output);
}

function updatePackageVersion() {
  const githubEventPath = process.env.GITHUB_EVENT_PATH || "";
  const packageJsonPath = "package.json";

  const { version, targetCommitish } = (() => {
    try {
      const githubEventString = fs.readFileSync(githubEventPath, "utf-8");
      const githubEvent = JSON.parse(githubEventString);
      const tagName = githubEvent.release.tag_name;
      const targetCommitish = githubEvent.release.target_commitish;
      const version = tagName.replace(/^v(.*)/, "$1");
      return { version, targetCommitish };
    } catch (error) {
      throw new Error("Error parsing GITHUB_EVENT_PATH:", error);
    }
  })();

  const packageJson = (() => {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      if (packageJson.version === version) return noChange;
      packageJson.version = version;
      const updatedPackageJson = JSON.stringify(packageJson, null, 2) + "\n";
      return updatedPackageJson;
    } catch (error) {
      throw new Error("Error parsing package.json:", error);
    }
  })();

  if (packageJson === noChange) return;

  try {
    fs.writeFileSync(packageJsonPath, packageJson, "utf8");
  } catch (error) {
    throw new Error("Error writing package.json:", error);
  }

  try {
    exec(`git config --local user.email "action@github.com"`);
    exec(`git config --local user.name "GitHub Action"`);
    exec(`git commit -a -m "Update package version: ${version}"`);
    exec(`git push origin HEAD:${targetCommitish}`);
  } catch (error) {
    throw new Error("Error executing push package.json", error);
  }

  console.log(`Successfully updated version to ${version}`);
}

updatePackageVersion();
