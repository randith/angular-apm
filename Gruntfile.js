module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-minified');
    grunt.loadNpmTasks('grunt-karma');

    grunt.initConfig({
        connect: {
            server: {
                options: {
                    port: 9001,
                    keepalive: true
                }
            }
        },
        minified : {
            files: {
                src: [
                    './src/angular-apm.js'
                ],
                dest: './dist/'
            },
            options : {
                allinone: false,
                ext: '.min.js'
            }
        },
        /**
         * The Karma configurations.
         */
        karma: {
            options: {
                configFile: 'karma.conf.js'
            },
            unit: {
                port: 9019,
                background: true
            },
            test: {
                singleRun: true
            }
        }
    });

    grunt.registerTask('default', ['connect']);
    grunt.registerTask('build', ['minified']);
    grunt.registerTask('test', ['karma:test']);
};
