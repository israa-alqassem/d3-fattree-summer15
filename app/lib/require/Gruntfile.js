module.exports = function(grunt) {

    grunt.initConfig({
        jsbeautifier: {
            files: [
                "**/*.src",
                "!**/*.min.src",
                "!bin/templates/template.src",
                "!node_modules/**/*"
            ]
        },
        jshint: {
            options: {
                es3: true,
                unused: true,
                curly: false,
                eqeqeq: true,
                expr: true,
                eqnull: true,
                evil: true
            },
            files: [
                "**/*.src",
                "!**/*.min.src",
                "!build/require.src",
                "!**/node_modules/**/*"
            ]
        },
        uglify: {
            compress: {
                options: {
                    output: {
                        beautify: false,
                        space_colon: false,
                        bracketize: true
                    },
                    compress: {
                        sequences: true,
                        hoist_vars: true
                    },
                    preserveLicenseComments: true,
                    mangle: true,

                    generateSourceMaps: false,
                    warnings: true
                },
                files: {
                    "build/require.min.js": [
                        "build/require.src"
                    ]
                }
            }
        },
        requirejs: {
            compile: {
                options: {
                    out: "build/require.src",
                    file: "src/index.src",
                    verbose: true
                }
            }
        },
        watch: {
            scripts: {
                files: [
                    "**/*.src",
                    "!node_modules/**/*"
                ],
                tasks: ["requirejs"],
                options: {
                    spawn: false
                }
            }
        }
    });

    grunt.registerMultiTask("requirejs", "Compiles CommonJS modules into one file", function() {
        var options = this.options(),
            RequireJS, requirejs, fs, out, verbose;

        if (!options) {
            grunt.fail.error("no options for requirejs");
            return;
        }

        options.main = options.main || options.file || options.index;
        out = options.out;
        verbose = options.verbose != null ? !!options.verbose : true;

        RequireJS = require("./bin/requireify");
        fs = require("fs");

        requirejs = new RequireJS(options);

        if (verbose) grunt.log.write("\nwriting compiled file " + out + "\n");
        fs.writeFileSync(out, requirejs.compile());
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-jsbeautifier");

    grunt.registerTask("jsb", ["jsbeautifier"]);
    grunt.registerTask("default", ["jshint", "requirejs", "jsbeautifier", "uglify"]);
};
