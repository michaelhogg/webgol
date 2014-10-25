module.exports = function(grunt) {

    grunt.initConfig({

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
        },

        watch: {
            webgol_js: {
                files: ['js/**/*.js'],
                tasks: ['jshint', 'concat']
            },
            webgol_css: {
                files: ['scss/*.scss'],
                tasks: ['compass']
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('webgol_dev',  ['jshint', 'concat', 'compass']);
    grunt.registerTask('webgol_prod', ['jshint', 'uglify', 'compass']);

    grunt.registerTask('default', ['webgol_dev']);

};
