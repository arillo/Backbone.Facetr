module.exports = function(grunt) {
  "use strict";

  grunt.loadNpmTasks('grunt-rigger');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-karma-coveralls');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: '// <%= pkg.name %> <%= pkg.version %> \n' + 
              '// Copyright (c)2012 <%= pkg.author.company %> \n' +
              '// Author: <%= pkg.author.name %> \n' +
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
      options: {
        jshintrc: '.jshintrc'
      },
      all: ['Gruntfile.js', 'dist/backbone.facetr.js']
    },
    jasmine: {
      src : 'dist/backbone.facetr.js',
      options : {
        specs : 'spec/*.js',
        vendor : [
          'node_modules/underscore/underscore.js',
          'node_modules/backbone/backbone.js'
        ]
      }
    },
    karma: {
      continuous: {
        configFile: 'karma.conf.js',
        singleRun: true,
        browsers: ['PhantomJS']
      }
    },
    coveralls: {
      options: {
          debug: true,
          coverageDir: 'coverage',
          dryRun: false,
          force: true,
          recursive: true
      }
    }
  });

  // Default task(s).
  grunt.registerTask('default', ['rig', 'jshint', 'jasmine', 'uglify']);
  grunt.registerTask('test', ['jasmine']);
  grunt.registerTask('lint', ['jshint']);
  grunt.registerTask('ci', ['rig', 'jshint', 'karma']);
  grunt.registerTask('coverage', ['coveralls']);
};