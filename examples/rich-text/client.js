var ReconnectingWebSocket = require('reconnecting-websocket');
var sharedb = require('sharedb/lib/client');
var richText = require('rich-text');
var Quill = require('quill');
sharedb.types.register(richText.type);

// Open WebSocket connection to ShareDB server
var socket = new ReconnectingWebSocket('ws://' + window.location.host);
var connection = new sharedb.Connection(socket);

// For testing reconnection
window.disconnect = function() {
  connection.close();
};
window.connect = function() {
  var socket = new ReconnectingWebSocket('ws://' + window.location.host);
  connection.bindToSocket(socket);
};

// Create local Doc instance mapped to 'examples' collection document with id 'richtext'
var doc = connection.get('examples', 'richtext');
//console.log(doc);
connection.fetchSnapshot('examples', 'richtext', 44, function (err, results) {
    //console.log(results);
});
connection.fetchSnapshotByTimestamp('examples', 'richtext', 1579771022074, function (err, snapshot) {
    // console.log(err);
    // console.log(snapshot);
});
doc.subscribe(function(err) {
  if (err) throw err;
  var quill = new Quill('#editor', {theme: 'snow'});
  quill.setContents(doc.data);
    quill.on('text-change', function (delta, oldDelta, source) {
    //   console.log(delta);
    //   console.log(oldDelta);
    //   console.log(source);
    if (source !== 'user') return;
    doc.submitOp(delta, {source: quill});
  });
  doc.on('op', function(op, source) {
    if (source === quill) return;
    quill.updateContents(op);
  });
});
