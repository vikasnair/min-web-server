/* webutils.js */
// Vikas was here!

const path = require('path');

module.exports.getExtension = (fileName) => {
	return fileName.split('.').length > 1 ? fileName.split('.').pop().toLowerCase() : '';
}

module.exports.sendTextFile = (fileName, sock, isGET) => {
	const fs = require('fs');
	const extension = this.getExtension(fileName);
	const contentType = this.getMIME(extension);

	if (['gif', 'png', 'jpeg', 'bmp', 'webp'].includes(extension)) {
		sock.write(this.createResponse('406 Not Acceptable', 'text/plain', 'Server only accepts text files for method \'sendTextFile\'.'));
		sock.end();
		return;
	}

	// TODO: check if path to file exists, else 404

	fs.readFile(path.join(__dirname, '..', 'public', fileName), 'utf8', (error, data) => {
		if (error) {
			console.log(__dirname + "/public/" + fileName);
			sock.write(this.createResponse('500 Internal Server Error', 'text/plain', 'Server encountered error reading file.'));
		} else {
			sock.write(this.createResponse('200 OK', contentType));

			if (isGET) {
				sock.write(data);
			}
		}

		sock.end();
	});
}

module.exports.sendImage = (fileName, sock, isGET) => {
	const fs = require('fs');
	const extension = this.getExtension(fileName);
	const contentType = this.getMIME(extension);

	if (['html', 'css', 'txt'].includes(extension)) {
		sock.write(this.createResponse('406 Not Acceptable', 'text/plain', 'Server only accepts image files for method \'sendImage\'.'));
		sock.end();
		return;
	}

	fs.readFile(path.join(__dirname, '..', 'public', fileName), (error, data) => {
		if (error) {
			sock.write(this.createResponse('500 Internal Server Error', 'text/plain', 'Server encountered error reading file.'));
		} else {
			sock.write(this.createResponse('200 OK', contentType));

			if (isGET) {
				sock.write(data);
			}
		}

		sock.end();
	});
}

module.exports.createRedirect = (newFile, sock, isGET) => {
	sock.write(`HTTP/1.1 301 Moved Permanently\r\nLocation: ${newFile}\r\n\r\n`);
}

module.exports.createResponse = (statusCode, contentType, dataMessage='') => {
	return `HTTP/1.1 ${statusCode}\r\nContent-Type: ${contentType}\r\n\r\n${dataMessage}`;
}

module.exports.getMIME = (extension) => {
	const map = {
		'html': 'text/html',
		'css': 'text/css',
		'txt': 'text/plain',
		'gif': 'image/gif',
		'png': 'image/png',
		'jpeg': 'image/jpeg',
		'jpg' : 'image/jpeg',
		'bmp': 'image/bmp',
		'webp': 'image/webp',
	};

	return map[extension] ? map[extension] : '';
}