/* webframework.js */
// Vikas was here...

const statusCodes = {
	'200' : 'OK',
	'301' : 'Moved Permanently',
	'302' : 'Found',
	'303' : 'See Other',
	'400' : 'Bad Request',
	'404' : 'Not Found',
	'405' : 'Method Not Allowed',
	'500' : 'Internal Server Error'
};

module.exports.Request = class Request {
	constructor(s) {
		this.method = s.split(' ')[0].toUpperCase();
		this.path = s.split(' ')[1];

		if (this.path.length > 1 && this.path.slice(-1) === '/') {
			this.path = this.path.slice(0, -1);
		}

		const headers = {};

		s.split('\r\n').forEach(line => {
			const properties = line.split(': ');

			if (properties.length > 1) {
				headers[properties[0]] = properties[1];
			}
		});

		this.headers = headers;
		this.body = s.split('\r\n\r\n')[1];
	}

	toString() {
		let s = `${this.method} ${this.path} HTTP/1.1\r\n`;

		Object.keys(this.headers).forEach(key => {
			s += `${key}: ${this.headers[key]}\r\n`;
		});

		return s + '\r\n' + this.body;
	}
}

module.exports.Response = class Response {
	constructor(s) {
		this.sock = s;
		this.headers = {};
		this.body = '';
	}

	setHeader(name, value) {
		this.headers[name] = value;
	}

	write(data) {
		this.sock.write(data);
	}

	end(s) {
		this.sock.write(s);
		this.sock.end();
	}

	send(statusCode, body) {
		this.body = body;
		
		this.write(`HTTP/1.1 ${statusCode} ${statusCodes[String(statusCode)]}\r\n`);
		this.writeHead(statusCode);
		this.end(this.body);
	}

	writeHead(statusCode) {
		this.statusCode = statusCode;
		
		Object.keys(this.headers).forEach(key => {
			this.write(`${key}: ${this.headers[key]}\r\n`);
		});

		this.write('\r\n');
	}

	redirect(statusCode, url) {
		if (arguments.length === 1) {
			url = statusCode;
			statusCode = 301;
		}

		this.statusCode = statusCode;
		this.setHeader('Location', url);
		this.send(this.statusCode, this.body);
	}

	toString() {
		let s = `HTTP/1.1 ${this.statusCode} ${statusCodes[String(this.statusCode)]}\r\n`;
		
		Object.keys(this.headers).forEach(key => {
			s += `${key}: ${this.headers[key]}\r\n`;
		});

		return s + '\r\n' + this.body;
	}

	sendFile(fileName) {
		const util = require('./webutils.js');
		const path = require('path');
		const fs = require('fs');

		const filePath = path.join(__dirname, '..', 'public', fileName);
		const ext = util.getExtension(fileName);
		const contentType = util.getMIME(ext);

		if (['html', 'css', 'txt'].includes(ext)) {
			fs.readFile(filePath, 'utf8', (error, data) => { this.handleRead(contentType, error, data); });
		}

		if (['gif', 'png', 'jpg', 'jpeg', 'bmp', 'webp'].includes(ext)) {
			fs.readFile(filePath, (error, data) => { this.handleRead(contentType, error, data); });
		}
	}

	handleRead(contentType, err, data) {
		this.setHeader('Content-Type', contentType);

		if (err) {
			this.send(500);
		} else {
			this.send(200, data);
		}
	}
}

module.exports.App = class App {
	constructor() {
		const net = require('net');
		this.server = net.createServer(this.handleConnection.bind(this));
		this.routes = {};
	}

	get(path, cb) {
		this.routes[`GET ${path}`] = cb;
	}

	post(path, cb) {
		this.routes[`POST ${path}`] = cb;
	}

	listen(port, host) {
		this.server.listen(port, host);
	}

	handleConnection(sock) {
		sock.on('data', this.handleRequestData.bind(this, sock));
	}

	handleRequestData(sock, binaryData) {
		const strData = binaryData + '';
		const req = new module.exports.Request(strData);
		const res = new module.exports.Response(sock);

		sock.on('end', this.logResponse.bind(this, req, res));

		if (!req.headers.hasOwnProperty('Host')) {
			return res.send(400, 'Invalid request.');
		}

		if (this.routes.hasOwnProperty(`${req.method} ${req.path}`)) {
			this.routes[`${req.method} ${req.path}`](req, res);
			return;
		} else {
			return res.send(404, 'Resource could not be found.');
		}
	}

	logResponse(req, res) {
		// console.log(`${req.toString()}\r\n${res.toString()}\r\n`);
		console.log(req.toString());
	}
}