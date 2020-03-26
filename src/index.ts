#!/usr/bin/env node

import {validateOpenRPCDocument, parseOpenRPCDocument} from "@open-rpc/schema-utils-js"

const { program } = require('commander');
program.version("0.0.1");
program.option("-v, --verbose", "verbose logging");
program.parse(process.argv);

// Get either stdin or first argument.
// https://gist.github.com/ishu3101/9fa58ca1440f780d6288
var args = program.args; // process.argv.slice(2);
var input = args[0];
var isTTY = process.stdin.isTTY;
var stdin = process.stdin;
var stdout = process.stdout;

// If no STDIN and no arguments, display usage message
if (isTTY && args.length === 0) {
    program.help();
}
// If no STDIN but arguments given
else if (isTTY && args.length !== 0) {
    handleShellArguments();
}
// read from STDIN
else {
    handlePipedContent();
}

function handlePipedContent() {
    var data = '';

    stdin.on('readable', function() {
        var chuck = stdin.read();
        if(chuck !== null){
            data += chuck;
        }
    });
    stdin.on('end', function() {
        doValidate(data);
    });
}

function handleShellArguments(){
    console.log(doValidate(input));
}

function doValidate(input: string) {
  if (input === "") {
    process.exit(2);
  }
  var doc = parseOpenRPCDocument(input).then((doc) => {
    if (program.verbose) console.log(doc);
    var err = validateOpenRPCDocument(doc);
    if (err === true) {
      console.log("OK");
      process.exit(0);
    }
    console.log("VALIDATE FAIL", input, err);
    process.exit(1);
  }).catch((err) => {
    console.log("PARSE FAIL", err);
    process.exit(1);
  });

}

