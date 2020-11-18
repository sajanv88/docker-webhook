const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 8080;
const fs = require('fs');
const execute = require('child_process').execSync;
const YAML = require('json-to-pretty-yaml');

app.use(bodyParser.json());

app.post('/api/mongodb', function spinMongodb(req, res) {
  try {
    let json = fs.readFileSync('mongo_stack.json', {encoding: 'utf-8'});
    const mongodb_username = process.env.MONGO_DB_USERNAME || req.body.MONGO_DB_USERNAME || 'root';
    const mongodb_password = process.env.MONGO_DB_PASSWORD || req.body.MONGO_DB_PASSWORD || 'password';

    if(typeof mongodb_username !== 'undefined' && typeof mongodb_password !== 'undefined') {
      json = json.replace(/{.*?}/, mongodb_username).replace(/{.*?}/, mongodb_password);
      json = JSON.parse(json);
      console.log('using server environment credentials');
    }
    fs.writeFileSync('./mongo_stack.yaml', YAML.stringify(json), {encoding: 'utf-8', flag: 'w'});
    execute('docker stack deploy -c mongo_stack.yaml db');
    res.status(200).send({message: 'Success!'});
  }catch(e) {
    res.status(500).send({message: e.message});
  }
});



app.post('/api/deploy_webapp', function deploy(req, res) {
  try{
    let json = fs.readFileSync('webapp_stack.json', {encoding: 'utf-8'});
    const uri = process.env.MONGO_URI || req.body.MONGO_URI;
    json = json.replace(/{.*?}/, uri);
    json = JSON.parse(json);
    console.log(json, 'jsoin')

    fs.writeFileSync('webapp_stack.yaml', YAML.stringify(json), {encoding: 'utf-8', flag: 'w'});
    execute('docker stack deploy -c webapp_stack.yaml blogapp');
    console.log('deploy_webapp created!!!')
    res.status(200).send({message: 'Success!'});
  }catch(e) {
    console.log('failed to deploy_webapp', e.message);
    res.status(500).send({message: e.message});
  }
});

app.post('/api/update/:service_name', function deployWebApp(req, res) {
  const serviceName = req.params.service_name || '';
  if(typeof serviceName !== 'string') {
    return res.status(400).send({message: 'Bad request'});
  }
  try{
    execute(`docker service update --force ${serviceName}`);
    console.log(`Build updated has been updated. ${serviceName}`);
    res.status(200).send({message: 'Success!'});
  }catch(e) {
    console.error(e);
    res.status(500).send({message: e.message});
  }
});

app.listen(port, function listener() {
  console.log('Docker hook up and running');
});