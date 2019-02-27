module.exports = function(grunt) {
  var options = {
    livereload: true,
    port: grunt.option('port') || 8888,
    hostname:  grunt.option('server') || "dev.esri.com", // 'zrh-yannik.esri.com', // "dev.esri.com", //  '192.168.178.20',   //   '10.195.20.46', // 
  };

  // Project configuration.
  grunt.initConfig({
    watch: {
      livereload: {
        // Here we watch any files changed
        options: { 
          livereload: true 
        },
        files: [
          'src/**/*.js', 
          'src/**/*.css',
          'src/**/*.html'
        ]
      }
    },
    connect: {
      app: {
        options: options
      }
    }
  });

  // Load grunt plugins
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // grunt.loadTasks("tasks");

  // Register tasks
  grunt.registerTask("default", ["connect", "watch"]);
};
