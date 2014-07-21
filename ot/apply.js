// This module defines functions to apply an edit on a document representation
define(function(require, exports, module) {
"use strict";

var operations = require("./operations");
var Range = require("ace/range").Range;

/**
 * Apply an operation on a string document and return the resulting new document text.
 *
 * @param  {Opeartion} op - e.g. ["r2", "iabc", "r12"]
 * @param  {String} doc
 * @return {String} newDoc
 */
exports.applyContents = function(op, doc) {
    var val, newDoc = "";
    for (var i = 0, len = op.length; i < len; i += 1) {
        val = op[i].slice(1);
        switch (op[i][0]) {
        case "r": // retain
            val = Number(val);
            newDoc += doc.slice(0, val);
            doc = doc.slice(val);
            break;
        case "i": // insert
            newDoc += val;
            break;
        case "d": // delete
            if (doc.indexOf(val) !== 0)
                throw new TypeError("Expected '" + val +
                    "' to delete, found '" + doc.slice(0, 10) + "'");
            else
                doc = doc.slice(val.length);
            break;
        default:
            throw new TypeError("Unknown operation: " + operations.type(op[i]));
        }
    }
    return newDoc;
};

/**
 * Apply an operation on an Ace document
 *
 * @param  {Opeartion} op - e.g. ["r2", "iabc", "r12"]
 * @param  {String} doc
 */
exports.applyAce = function(op, editorDoc) {
    var i, len, index = 0, text = "";
    for (i = 0, len = op.length; i < len; i += 1) {
        switch (operations.type(op[i])) {
        case "retain":
            index += operations.val(op[i]);
            break;
        case "insert":
            text = operations.val(op[i]);
            editorDoc.insert(editorDoc.indexToPosition(index), text);
            index += text.length;
            break;
        case "delete":
            text = operations.val(op[i]);
            var startDel = editorDoc.indexToPosition(index);
            var endDel = editorDoc.indexToPosition(index + text.length);
            var range = Range.fromPoints(startDel, endDel);
            var docText = editorDoc.getTextRange(range);
            if (docText !== text) {
                var err = new Error("Expected '" + text +
                    "' to delete, found '" + docText + "'");
                err.code = "EMISMATCH";
                throw err;
            }
            editorDoc.remove(range);
            break;
        default:
            throw new TypeError("Unknown operation: " + operations.type(op[i]));
        }
    }
};

});
