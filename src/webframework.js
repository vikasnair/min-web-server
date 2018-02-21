/* webframework.js */
// Vikas was here...

module.exports.Request = class Request {
	constructor(s) {
		this.method = s.split(' ')[0];
		this.path = s.split(' ')[1];

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

