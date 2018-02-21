/* better.js */
// Vikas was here..........

const App = require('./webframework.js').App;
const app = new App();

app.get('/', (req, res) => {
	res.sendFile('home.html');
});

app.get('/css/base.css', (req, res) => {
	res.sendFile('css/base.css');
});

app.get('/image1.jpg', (req, res) => {
	res.sendFile('img/image1.jpg');
});

app.get('/image2.gif', (req, res) => {
	res.sendFile('img/image2.gif');
});

app.get('/image3.jpg', (req, res) => {
	res.sendFile('img/image3.jpg');
});

app.get('/image3', (req, res) => {
	res.sendFile('img/image3.jpg');
});

app.get('/random', (req, res) => {
	const randInt = Math.floor(Math.random() * Math.floor(3)) + 1;
	let fileName = 'image' + randInt;
	
	switch (randInt) {
		case 1: fileName += '.jpg'; break;
		case 2: fileName += '.gif'; break;
		case 3: fileName += '.jpg'; break;
	}

	const html = "\
		<!DOCTYPE html>\
		<html lang='en'>\
		  <head>\
		    <meta charset='utf-8'>\
		    <link rel='stylesheet' href='css/base.css'>\
		    <title>Dasha Tsenter</title>\
		  </head>\
		  <body>\
		    <h1>Official fan page of NYC Tsenter.</h1>\
		    <img src='" + fileName + "' style='width:500px;height:auto;'>\
		    <ol>\
		    	<li><a href='/random'>Random!</a></li>\
		      <li><a href='/random'>Rando!</a></li>\
		      <li><a href='/form'>Form!</a></li>\
		    </ol>\
		  </body>\
		</html>\
	";

	res.send(200, html);
});

app.get('/rando', (req, res) => {
	res.redirect('/random');
});

app.get('/form', (req, res) => {
	res.sendFile('form.html');
});

app.post('/form', (req, res) => {
	let data = '';
	req.body.split('&').forEach(pair => {
		const value = pair.split('=')[1];
		data += value;
	});

	res.send(200, data);
});

app.listen(8080, '127.0.0.1');