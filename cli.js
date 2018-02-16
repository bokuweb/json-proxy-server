#!/usr/bin/env node

const meow = require('meow');
const inquirer = require('inquirer');
const path = require('path');
const is = require('@sindresorhus/is');
const start = require('./');

const cli = meow(
  `
  Usage
    $ json-proxy-server --conf ./json-proxy-server.conf.js
  Options
    -C, --conf Specify path of config file.
    -S, --select Select routes.
  Examples
    $ json-proxy-server --conf ./json-proxy-server.conf.js
`,
  {
    flags: {
      conf: {
        type: 'string',
        alias: 'C',
      },
      select: {
        type: 'boolean',
        alias: 'S',
      },
    },
  },
);

const confPath = cli.flags.conf ? cli.flags.conf : './json-proxy-server.conf.js';
const confFnOrPbj = require(path.join(process.cwd(),confPath));
const conf = is.function(confFnOrPbj) ? confFnOrPbj() : confFnOrPbj;

if (cli.flags.select) {
  return inquirer
    .prompt([
      {
        type: 'checkbox',
        message: 'Select routes',
        name: 'routes',
        choices: (conf.routes || []).map(r => {
          return {
            name: r.name,
          };
        }),
        validate: answer => {
          if (answer.length < 1) {
            return 'You must choose at least one route.';
          }
          return true;
        },
      },
    ])
    .then(answers => {
      const selected = conf.routes.filter(r => r.name.indexOf(answers.routes) !== -1);
      conf.routes = selected;
      start(conf);
    });
}

start(conf);



