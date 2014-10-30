module.exports = function(grunt) {

    grunt.initConfig({

        /*--- Data for templates ---*/

        // Files to lint for terminating newlines and trailing whitespace
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


        /*--- Core tasks ---*/

        // Lint for terminating newlines and trailing whitespace
        lintspaces: {
            webgol: {
                options: {
                    newline:        true,  // Check for one newline at end of every file
                    trailingspaces: true   // Check for any trailing whitespace
                },
                src: ['<%= lintspaces_src %>']
            }
        },

        // Lint JavaScript files
        jshint: {
            webgol: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: ['js/**/*.js']
            }
        },

        // Compile SCSS to CSS
        compass: {
            webgol: {
                options: {
                    config: 'config.rb'
                }
            }
        },


        /*--- Dev tasks ---*/

        // Concatenate JavaScript files without minifying
        concat: {
            webgol: {
                files: {
                    'jsmin/gol.js':  ['js/gol/**/*.js'],
                    'jsmin/main.js': ['js/main.js']
                }
            }
        },


        /*--- Prod tasks ---*/

        // Concatenate and minify JavaScript files
        uglify: {
            webgol: {
                files: {
                    'jsmin/gol.js':  ['js/gol/**/*.js'],
                    'jsmin/main.js': ['js/main.js']
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

    grunt.registerTask('webgol_core', ['lintspaces', 'jshint', 'compass']);

    grunt.registerTask('webgol_dev',  ['webgol_core', 'concat']);
    grunt.registerTask('webgol_prod', ['webgol_core', 'uglify']);

    grunt.registerTask('default', ['webgol_dev']);

};
