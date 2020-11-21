const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 8080;
const webapp = require("./deploy");

app.use(bodyParser.json());

app.post("/api/mongodb", async function spinMongodb(req, res) {
  const serviceName = req.params.service_name;
  const { MONGO_DB_USERNAME, MONGO_DB_PASSWORD } = req.body;
  try {
    const data = await webapp.deployMongodb(
      { MONGO_DB_USERNAME, MONGO_DB_PASSWORD },
      serviceName
    );
    res.status(data.code).json(data);
  } catch (err) {
    res.status(err.code).json(err);
  }
});

app.post("/api/deploy_webapp", async function deploy(req, res) {
  try {
    const { MONGO_URI, NEXT_PUBLIC_FB_ID, JWT_SCERET_KEY } = req.body;
    const data = await webapp.deploy({
      MONGO_URI,
      NEXT_PUBLIC_FB_ID,
      JWT_SCERET_KEY,
    });
    res.status(data.code).json(data);
  } catch (err) {
    res.status(err.code).json(err);
  }
});

app.post("/api/update/:service_name", async function deployWebApp(req, res) {
  try {
    const data = await webapp.updateWebApp(req.params.service_name);
    res.status(data.code).json(data);
  } catch (err) {
    console.log("errr ===>", err);
    res.status(err.code).json(err);
  }
});

app.listen(port, function listener() {
  console.log("Docker hook up and running port", port);
});
