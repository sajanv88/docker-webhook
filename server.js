const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const fs = require('fs');
const execute = require('child_process').execSync;
const YAML = require('json-to-pretty-yaml');

app.post('/api/mongodb', function spinMongodb(req, res) {
  try {
    const json = require('./mongo_stack.json');
    const mongodb_username = process.env.MONGO_DB_USERNAME;
    const mongodb_password = process.env.MONGO_DB_PASSWORD;
    if(typeof mongodb_username !== 'undefined' && typeof mongodb_password !== 'undefined') {
      json.services.mongo.environment.MONGO_INITDB_ROOT_USERNAME = mongodb_username;
      json.services.mongo.environment.MONGO_INITDB_ROOT_PASSWORD = mongodb_password;
      console.log('using server environment credentials');
    }
    fs.writeFileSync('mongo_stack.yaml', YAML.stringify(json), {encoding: 'utf-8'});
    execute('docker stack deploy -c mongo_stack.yaml db');
    res.status(200).send({message: 'Success!'});
  }catch(e) {
    res.status(500).send({message: e.message});
  }
});



app.post('/api/deploy_webapp', function deploy(req, res) {
  try{
    const json = require('./webapp_stack.json');
    const mongo_uri = process.env.MONGO_URI;
    json.services.webapp.environment.MONGO_URI = mongo_uri;
    fs.writeFileSync('webapp_stack.yaml', YAML.stringify(json), {encoding: 'utf-8'});
    execute('docker stack deploy -c webapp_stack.yaml blogapp');
    console.log('deploy_webapp created!!!')
    res.status(200).send({message: 'Success!'});
  }catch(e) {
    console.log('failed to deploy_webapp', e.message);
    res.status(500).send({message: e.message});
  }
});

app.post('/api/:service_name/:username/:image_name/:tag', function deployWebApp(req, res) {
  const serviceName = req.params.service_name || '';
  const username = req.params.username || '';
  const imageName = req.params.image_name || '';
  const tag = req.params.tag || 'latest';
  if(typeof serviceName !== 'string' || typeof username !== 'string' || typeof imageName !== 'string') {
    return res.status(400).send({message: 'Bad request'});
  }
  try{
    const dockerImageInfo = `${username}/${imageName}:${tag} ${serviceName}`;
    execute(`docker service update --image ${dockerImageInfo}`);
    console.log(`Build updated has been updated. ${dockerImageInfo}`);
    res.status(200).send({message: 'Success!'});
  }catch(e) {
    console.error(e);
    res.status(500).send({message: e.message});
  }
});

app.listen(port, function listener() {
  console.log('Docker hook up and running');
});