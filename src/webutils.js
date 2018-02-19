/* webutils.js */
// Vikas was here!

module.exports.getExtension = (fileName) => {
	return fileName.split('.').length > 1 ? fileName.split('.').pop().toLowerCase() : '';
}

module.exports.sendTextFile = (fileName, sock) => {
	const fs = require('fs');
	const extension = this.getExtension(fileName);
	const contentType = getMIME(extension);

	if (['gif', 'png', 'jpeg', 'bmp', 'web'].includes(extension)) {
		this.generateResponse(sock, '406: Not Acceptable', contentType, 'Server only accepts text files for method \'sendTextFile\'.');
		sock.end();
		return;
	}

	fs.readFile(__dirname + "../public/" + fileName, 'utf8', (error, data) => {
		if (error) {
			this.generateResponse(sock, '500: Internal Server Error', contentType, 'Server encountered error reading file.');
		} else {
			this.generateResponse(sock, '200: OK', contentType, data);
		}

		sock.end();
	});
}

module.exports.sendImage = (fileName, sock) => {
	const fs = require('fs');
	const extension = this.getExtension(fileName);
	const contentType = getMIME(extension);

	if (['html', 'css', 'txt'].includes(extension)) {
		this.generateResponse(sock, '406: Not Acceptable', contentType, 'Server only accepts image files for method \'sendImage\'.');
		return;
	}

	fs.readFile(__dirname + "../public/" + fileName, (error, data) => {
		if (error) {
			this.generateResponse(sock, '500: Internal Server Error', contentType, 'Server encountered error reading file.');
		} else {
			this.generateResponse(sock, '200: OK', contentType);
			sock.write(data);
		}

		sock.end();
	});
}

function generateResponse(sock, statusCode, contentType, dataMessage = '') {
	sock.write('HTTP/1.1 ' + statusCode + '\r\n' + 'Content-Type: ' + contentType + '\r\n\r\n' + dataMessage);
}

function getMIME(extension) {
	const map = {
		'html': 'text/html',
		'css': 'text/css',
		'txt': 'text/plain',
		'gif': 'image/gif',
		'png': 'image/png',
		'jpeg': 'image/jpeg',
		'bmp': 'image/bmp',
		'webp': 'image/webp',
	};

	return map[extension] ? map[extension] : '';
}