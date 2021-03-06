// this is an example configuration file
// place it into the root of your project
// it is used by both sides - server and client

var config = {
    // main server address
    url: 'https://example.org',

    // bulldozer deployment server port (must be different than your app port!)
    port: 8000,

    // secures communication between bulldozer's client & server
    // WARNING: you must use HTTPS to keep this token secure!
    secret: 'YOUR_SECRET',

    // bitbucket or github
    gitUrl: 'github',

    // git repository name
    name: 'KITSAlvaroSilva/bulldozer-test-app',

    // branch that will be tagged by 'bulldozer tag' (master is default)
    branch: 'master',

    // in case the repository is private
    // HTTPS authentication is used
    auth: {
      username: 'USERNAME',
      password: 'PASSWORD'
    },

    // pre-deployment hook
    // put here everything that should be ran before the
    // replacement of source code from Git repository
    preDeploy: function(utils) {
       // utils.getLogger() gives you Winston utility
      utils.getLogger().info('Pre-deploy started.');
      // good place to run some integration tests
      // if false, the deployment is stopped
      // if true, the deployment continues
      return true;
    },

    // post deployment hook
    // put here everything that should be ran with a new source code
    postDeploy: function(utils) {
      utils.getLogger().info('Post-deploy started.');

      // it runs exec(), logs stdout/stderr and returns promise
      utils.run('npm install')
        .then(function() {
          utils.getLogger().info('Deploy finished.');
          utils.getLogger().info('Starting production server.');
          return utils.run('PORT=80 NODE_ENV=production forever stop src/server');
        })
        // if there was no server running, forever stop fails, so I'm catching it here...
        .fail(function() {return utils.getLogger().info('There was no running instance of production server.'); })
        // start application
        .then(function() {return utils.run('PORT=80 NODE_ENV=production forever start src/server'); })
        .then(function() {
          utils.getLogger().info('Production server started.');
   
          // this is a good place to do something with the output log
          // e.g. you can send it as an email through service like Mailgun or save it as a file
          utils.getLoggerOutput(); // << THIS RETURNS THE OUTPUT LOG AS A STRING
   
          // resets the output log, so the next deployment log starts clean
          utils.resetLoggerOutput();
        });
    },

    // on error hook
    // this is a good place to do something with the output log
    // e.g. you can send it as an email through service like Mailgun or save it as a file
    onError: function(utils) {
      utils.getLoggerOutput(); // << THIS RETURNS THE OUTPUT LOG AS A STRING
      utils.resetLoggerOutput();
    }

  };

  module.exports = config;