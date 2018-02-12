const chai = require('chai');
const expect = chai.expect; 
const net = require('net');
const path = require('path');

const {getExtension, sendTextFile, sendImage} = require('../src/webutils.js');

require('mocha-sinon');

let socket;

function mockSocket() {
    socket = new net.Socket({});
    this.sinon.stub(socket, 'write').callsFake(function(s) { 
        return s;
    });
    this.sinon.stub(socket, 'end').callsFake(function(s) { 
        return s;
    });
}

describe('getExtension', function() {

    it('extracts extension - everything after last . (dot)', function() {
        expect(getExtension('foo.bar')).to.equal('bar');
        expect(getExtension('foo.bar.baz.qux')).to.equal('qux');
        expect(getExtension('foo.')).to.equal('');
    });

    it('empty string returned if no . (dot)', function() {
        expect(getExtension('foo')).to.equal('');
    });
});

describe('sendTextFile', function() {

    beforeEach(mockSocket);

    it('sendTextFile exists', function() {
        sendTextFile('/tests/testfile.html', socket);
    });
    /*
    it('calls write at least once', function() {
        sendTextFile('/tests/testfile.html', socket);
        // expect(socket.write.callCount).to.be.above(1);
    });

    it('calls end once', function() {
        sendImage('/tests/testfile.html', socket);
        // expect(socket.end.callCount).to.equal(1);
    });
    */

});


describe('sendImage', function() {

    beforeEach(mockSocket);

    it('sendImage exists', function() {
        sendImage('/tests/testfile.jpg', socket);
    });
});
