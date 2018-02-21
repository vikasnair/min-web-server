/* intro.js */
// Vikas was here!

const util = require('./webutils.js');
const net = require('net');

// helper class, lifted from example

class Request {
	constructor(s) {
		this.method = s.split(' ')[0];
		this.path = s.split(' ')[1];
		this.body = s.split('\r\n\r\n')[1];
	}
}

const route = (path, sock, isGET) => {
	const routes = {
		'/' : (sock) => { util.sendTextFile('index.html', sock, isGET); },
		'/such/stylish' : (sock) => { util.sendTextFile('such/stylish/index.html', sock, isGET); },
		'/css/base.css' : (sock) => { util.sendTextFile('css/base.css', sock, isGET); },
		'/picsplz' : (sock) => { util.sendTextFile('picsplz/index.html', sock, isGET); },
		'/img/animal.jpg' : (sock) => { util.sendImage('img/animal.jpg', sock, isGET); },
		'/showanimage' : (sock) => {
			util.createRedirect('/picsplz', sock);
			routes['/picsplz'](sock);
		}
	};

	if (routes.hasOwnProperty(path)) {
		routes[path](sock);
	} else {
		sock.write(util.createResponse('404 Not Found', 'text/plain', 'Server cannot locate resource specified.'));
		sock.end();
	}
};

const PORT = 8080;
const HOST = '127.0.0.1';

const server = net.createServer((sock) => {
	console.log(`We got a client: ${sock.remoteAddress}:${sock.remotePort}`);

	sock.on('data', (binaryData) => {
		const strData = binaryData + '';
		console.log("HI", strData);
		const req = new Request(strData);

		console.log(`Path: ${req.path}`);
		console.log(`Method: ${req.method}\n`);

		if (req.method === 'GET') {
			route(req.path, sock, true);
		} else if (req.method === 'POST') {
			sock.write(util.createResponse('200 OK', 'text/plain', req.body));
			sock.end();
		} else if (req.method === 'HEAD') {
			route(req.path, sock, false);
		} else {
			sock.write(util.createResponse('405 Method Not Allowed', 'text/plain', 'Server cannot handle method specified.'));
			sock.end();
		}
		
		// sock.end();
	});
});

server.listen(PORT, HOST);