const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const execute = require('child_process').execSync;

app.post('/api/:service_name/:username/:image_name/:tag', function postMethod(req, res) {
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