var fs = require('fs');
var exec = require('child_process').exec;
var f = JSON.parse(fs.readFileSync('graph.json'));
var s = '';

//stackoverflow
var mkdirSync = function (path) {
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if ( e.code != 'EEXIST' ) {
      throw e;
    }
  }
};

mkdirSync('./build/');

Object.keys(f).forEach(function(key) {
  s += '\n' + (key) + ':';
  f[key].deps.forEach(function(dep) {
    s += ' ' + (dep) + ' ';
  });
  s += '\n\t' + f[key].cmd;
});

s += '\nall: ' + Object.keys(f).join(' ');
s += '\nclean:\n\trm -rf *';

fs.writeFileSync('./build/Makefile', s, 'ascii');

var constructDot = function() {
  var s = 'digraph d {\n';
  Object.keys(f).forEach(function(node) {
    f[node].deps.forEach(function(to) {
      s += '\t"' + to + '" -> "' + node + '";\n';
    });
  });
  s += '}';
  fs.writeFileSync('./build/d.dot', s, 'ascii');
  exec('cd ./build/ && dot -Tpng d.dot -o d.png && google-chrome-stable d.png');
};

exec('cd build && make all', function(error, stdout, stderr) {
  if (error != null || /Circular/.test(stderr)) {
    console.log(stderr);
  } else {
    constructDot();
  }
});
