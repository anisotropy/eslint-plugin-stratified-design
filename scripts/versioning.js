const fs = require("fs");

function updatePackageVersion() {
  const githubEventPath = process.env.GITHUB_EVENT_PATH || "";
  const packageJsonPath = "package.json";

  const version = (() => {
    try {
      const githubEventString = fs.readFileSync(githubEventPath, "utf-8");
      const githubEvent = JSON.parse(githubEventString);
      const tagName = githubEvent.release.tag_name;
      const version = tagName.replace(/^v(.*)/, "$1");
      return version;
    } catch (error) {
      throw new Error("Error parsing GITHUB_EVENT_PATH:", error);
    }
  })();

  const packageJson = (() => {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      packageJson.version = version;
      const updatedPackageJson = JSON.stringify(packageJson, null, 2) + "\n";
      return updatedPackageJson;
    } catch (error) {
      throw new Error("Error parsing package.json:", error);
    }
  })();

  try {
    fs.writeFileSync(packageJsonPath, packageJson, "utf8");
    console.log(`Successfully updated version to ${version}`);
  } catch (error) {
    throw new Error("Error writing package.json:", error);
  }
}

updatePackageVersion();
