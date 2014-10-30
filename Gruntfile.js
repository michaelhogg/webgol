module.exports = function(grunt) {

    grunt.initConfig({

        /*--- Data for templates ---*/

        lintspaces_src: [
            '.gitignore',
            '.jshintrc',
            'config.rb',
            'glsl/*',
            'Gruntfile.js',
            'index.html',
            'js/**/*.js',
            'package.json',
            'README.md',
            'scss/*.scss'
        ],


        /*--- Tasks ---*/

        lintspaces: {
            webgol: {
                options: {
                    newline:        true,
                    trailingspaces: true
                },
                src: ['<%= lintspaces_src %>']
            }
        },

        jshint: {
            webgol: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: ['js/**/*.js']
            }
        },

        concat: {
            webgol: {
                files: {
                    'jsmin/gol.js':  ['js/gol/**/*.js'],
                    'jsmin/main.js': ['js/main.js']
                }
            }
        },

        uglify: {
            webgol: {
                files: {
                    'jsmin/gol.js':  ['js/gol/**/*.js'],
                    'jsmin/main.js': ['js/main.js']
                }
            }
        },

        compass: {
            webgol: {
                options: {
                    config: 'config.rb'
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-lintspaces');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-include-replace');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compass');

    grunt.registerTask('webgol_dev',  ['lintspaces', 'jshint', 'concat', 'compass']);
    grunt.registerTask('webgol_prod', ['lintspaces', 'jshint', 'uglify', 'compass']);

    grunt.registerTask('default', ['webgol_dev']);

};
