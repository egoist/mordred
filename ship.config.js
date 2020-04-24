module.exports = {
  monorepo: {
    mainVersionFile: "lerna.json",
    packagesToBump: ["packages/*"],
    packagesToPublish: ["packages/*"],
  },
  buildCommand: () => null,
};
