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

		// format methods and paths appropriately

		this.method = s.split(' ')[0].toUpperCase();
		this.path = s.split(' ')[1];

		if (this.path.length > 1 && this.path.slice(-1) === '/') {
			this.path = this.path.slice(0, -1);
		}

		// declare and init any headers + body

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

		// simple toString, loop through headers and append

		let s = `${this.method} ${this.path} HTTP/1.1\r\n`;

		Object.keys(this.headers).forEach(key => {
			s += `${key}: ${this.headers[key]}\r\n`;
		});

		return s + '\r\n' + this.body;
	}
};

module.exports.Response = class Response {
	constructor(s) {

		// init socket, empty header + body

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

		// use writeHead and end, but still writing in correct order

		this.body = body;
		
		this.write(`HTTP/1.1 ${statusCode} ${statusCodes[String(statusCode)]}\r\n`);
		this.writeHead(statusCode);
		this.end(this.body);
	}

	writeHead(statusCode) {

		// loop through headers and write, with appropriate format

		this.statusCode = statusCode;
		
		Object.keys(this.headers).forEach(key => {
			this.write(`${key}: ${this.headers[key]}\r\n`);
		});

		this.write('\r\n');
	}

	redirect(statusCode, url) {

		// if only one argument is given, assign correctly

		if (arguments.length === 1) {
			url = statusCode;
			statusCode = 301;
		}

		// send redirect

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

		// using prev helper functions for extension, contenttype

		const util = require('./webutils.js');
		const path = require('path');
		const fs = require('fs');

		// get ext, content type

		const filePath = path.join(__dirname, '..', 'public', fileName);
		const ext = util.getExtension(fileName);
		const contentType = util.getMIME(ext);

		// check type and read w/ appropriate params to interpret data correctly

		if (['html', 'css', 'txt'].includes(ext)) {
			fs.readFile(filePath, 'utf8', (error, data) => { this.handleRead(contentType, error, data); });
		}

		if (['gif', 'png', 'jpg', 'jpeg', 'bmp', 'webp'].includes(ext)) {
			fs.readFile(filePath, (error, data) => { this.handleRead(contentType, error, data); });
		}
	}

	handleRead(contentType, err, data) {

		// callback for readfile, set content type here and send data

		this.setHeader('Content-Type', contentType);

		if (err) {
			this.send(500);
		} else {
			this.send(200, data);
		}
	}
};

module.exports.App = class App {
	constructor() {

		// init server, empty routes

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

		// callback for socket.on('data' ...)
		// instantiate request, response objects with data

		const strData = binaryData + '';
		const req = new module.exports.Request(strData);
		const res = new module.exports.Response(sock);

		// set callback for socket.on('end' ...)

		sock.on('end', this.logResponse.bind(this, req, res));

		// check if host exists for valid request

		if (!req.headers.hasOwnProperty('Host')) {
			return res.send(400, 'Invalid request.');
		}

		// if exists, then check if valid route (resource available)

		if (this.routes.hasOwnProperty(`${req.method} ${req.path}`)) {
			this.routes[`${req.method} ${req.path}`](req, res);
			return;
		} else {
			return res.send(404, 'Resource could not be found.');
		}
	}

	logResponse(req, res) {
		console.log(`${req.toString()}\r\n${res.toString()}\r\n`);
		// console.log(req.toString());
	}
};