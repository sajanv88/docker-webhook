const fs = require("fs");
const execute = require("child_process").execSync;
const YAML = require("json-to-pretty-yaml");

module.export = {
  deploy: async function deployment(serviceName = "blogapp") {
    return new Promise(function (resolve, reject) {
      try {
        let json = fs.readFileSync("webapp_stack.json", { encoding: "utf-8" });
        const uri = process.env.MONGO_URI || req.body.MONGO_URI;
        json = json.replace(/{.*?}/, uri);
        json = JSON.parse(json);
        console.log(json, "jsoin");

        fs.writeFileSync("webapp_stack.yaml", YAML.stringify(json), {
          encoding: "utf-8",
          flag: "w",
        });

        execute(`docker stack deploy -c webapp_stack.yaml ${serviceName}`);
        const msg = `deploy_webapp: ${serviceName} successfully created!!!`;
        console.log(msg);
        resolve({ code: 200, message: msg });
      } catch (e) {
        const msg = `deploy_webapp: ${serviceName} failed!!" reason: ${e.message}`;
        console.log(msg);
        reject({ code: 500, message: msg });
      }
    });
  },
  deployMongodb: async function deploymentMongoDatabase(
    { MONGO_DB_USERNAME, MONGO_DB_PASSWORD },
    serviceName = "db"
  ) {
		const name = serviceName || 'db'; 
    return new Promise(function (resolve, reject) {
      try {
        let json = fs.readFileSync("mongo_stack.json", { encoding: "utf-8" });
        const mongodb_username =
          process.env.MONGO_DB_USERNAME || MONGO_DB_USERNAME || "root";
        const mongodb_password =
          process.env.MONGO_DB_PASSWORD || MONGO_DB_PASSWORD || "password";

        if (
          typeof mongodb_username !== "undefined" &&
          typeof mongodb_password !== "undefined"
        ) {
          json = json
            .replace(/{.*?}/, mongodb_username)
            .replace(/{.*?}/, mongodb_password);
          json = JSON.parse(json);
          console.log("using server environment credentials");
        }
        fs.writeFileSync("./mongo_stack.yaml", YAML.stringify(json), {
          encoding: "utf-8",
          flag: "w",
				});
        execute(`docker stack deploy -c mongo_stack.yaml ${name}`);
        const msg = `deploy_mongodatabase: ${name} successfully created!!!`;
        resolve({ code: 200, message: msg });
      } catch (e) {
        const msg = `deploy_mongodatabase: ${name} failed!!" reason: ${e.message}`;
        console.log(msg);
        res.status(500).send({ message: msg });
      }
    });
  },
};