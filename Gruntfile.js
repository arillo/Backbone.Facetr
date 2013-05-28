module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-rigger');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: '// <%= pkg.name %> <%= pkg.version %> \n' +
              '// Copyright (c)2012-2013 <%= pkg.author.company %> \n' +
              '// Author <%= pkg.author.name %> \n' +
              '// Distributed under MIT license \n' +
              '// <%= pkg.homepage %> \n'
    },
    rig: {
      compile: {
        options: {
          banner: '<%= meta.banner %>'
        },
        files: {
          'dist/<%= pkg.name.toLowerCase() %>.js': ['src/facetr.js']
        }
      }
    },
    uglify: {
      options: {
        banner: '<%= meta.banner %>'
      },
      build: {
        src: ['<%= meta.banner %>', 'dist/<%= pkg.name.toLowerCase() %>.js'],
        dest: 'dist/<%= pkg.name.toLowerCase() %>.min.js'
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'dist/backbone.facetr.js']
    },
    jasmine : {
      src : 'dist/backbone.facetr.js',
      options : {
        specs : 'spec/*.js',
        vendor : [
          'node_modules/lodash/dist/lodash.underscore.js',
          'node_modules/backbone/backbone.js'
        ]
      }
    }
  });

  // Default task(s).
  grunt.registerTask('default', ['rig', 'jasmine', 'lint', 'uglify']);
  grunt.registerTask('test', ['jasmine']);
  grunt.registerTask('lint', ['jshint']);
};