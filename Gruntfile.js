module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-autoprefixer');
  
  // Include these tasks if using PNG spirete sheets
  //grunt.loadNpmTasks('grunt-spritesmith');
  //grunt.loadNpmTasks('grunt-contrib-imagemin');
  //grunt.loadNpmTasks('grunt-scss-image-helpers');
  
  // Include this task if using SVG files
  //grunt.loadNpmTasks('grunt-svgmin');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // -------------------- CSS -------------------- //
    concat: {
      dist: {
        src: ['page*/*.scss'],
        dest: '_tmp/style.scss',
      }
    },
   
    sass: {
      dist: {
        options: {
          outputStyle: 'compressed',
          sourceMap: true,
        },
        files: { '_tmp/style.css': '_tmp/style.scss', }
        //files: { '_tmp/home.css': 'pagehome/home.scss' }
        //files: [{
        //  expand: true,
        //  //cwd: '/',
        //  flatten: true,
        //  src: ['page*/*.scss'],
        //  dest: '_tmp/css/',
        //  ext: '.css'
        //}]
      }
    },

    autoprefixer: {
      options: {
        map: true,
        browsers: ['last 2 versions', '> 5%']
      },
      default: { src: '_tmp/style.css', dest: 'live/style.css' },
      //default: {
      //  files: [{
      //    expand: true,
      //    flatten: true,
      //    src: '_tmp/css/*.css',
      //    dest: 'live/'
      //  }]
      //}
    },

    // -------------------- HTML -------------------- //
    handlebars: {
      default: {
        options: {
          namespace: 'HBS',
          processName: function(filePath) { // Only keep filename (remove folder and extension)
            var pieces = filePath.split('/');
            return pieces[pieces.length - 1].split('.')[0];
          }
        },
        files: {
          '_tmp/hbs-templates.js': ['_hbs/*.hbs'],
        }
      }
    },
    shell: { // Split handlebar templates using "save: myFilename.hbs" lines
      handlebarsSplit: { // Note: On mac, change 'csplit' to 'gcsplit' and run "brew install coreutils" for it to work
        command: "rm -f _hbs/*.hbs & for file in page*/*.hbs; do csplit -z -f \"_hbs/hbsSplit_$(basename $file)\" $file '/saveAs:/' '{*}'; done;"
      },
      handlebarsRename: { // Note: space is the delimeter
        command: "for file in _hbs/hbsSplit_*; do mv $file _hbs/$(head -1 $file | cut -d ' ' -f 2); done;"
      },
      handlebarsDeleteFirstLine: { // Note: On mac put a space after -i in: sed -i '.del'
        command: "rm -f _hbs/hbsSplit_* & for file in _hbs/*.hbs; do sed -i'.del' '1d' $file; rm ${file}.del 2> /dev/null; done;"
      },
      handlebarsDeleteCompiled: { // Clears the pre-compile cache
        command: "rm -f _hbs/*.php;"
      },
      
      // -------------------- VERSIONING -------------------- //
      // The file "_tmp/version.txt" should only contain a number, which is automatically incremented.
      // Use the number in this file to indicate in PHP when the files have changed
      gruntCount: {
        command: "GRUNTCOUNT=$(cat _tmp/version.txt); GRUNTCOUNT=`expr $GRUNTCOUNT + 1`; echo $GRUNTCOUNT > _tmp/version.txt;"
      },
    },

    // -------------------- JS -------------------- //
    uglify: {
      options: {
        mangle: false, // Does not impact build speed really
        screwIE8: true, // In 2015, there was a bug with v0.9.1 of uglify (this option had to be false)
        sourceMap: true,
        nameCache: '_tmp/grunt-uglify-cache.json',
        //sourceMapIncludeSources: true,
      },
      default:{ files:{
        'live/script.js': ['_tmp/*.js','source/*.js','page*/*.js'],
      }}
    },
    
    /*
    // -------------------- SVG -------------------- //
    svgmin: {
      options: {
        plugins: [ // For options, see: https://github.com/svg/svgo
          { removeViewBox: false },
          { removeUselessStrokeAndFill: true },
          { cleanupIDs: false }, // Don't change the IDs so they can be interacted with
          { mergePaths: false }, // Had a negative preformance impact (converted 196 paths to 70-ish paths and the preformance was bad)
        ]
      },
      dist: {
        files: {
          'image-min/svg/world.svg': 'image-raw/svg/world.svg',
        }
      }
    },
    
    // -------------------- PNG -------------------- //
    // Spritesmith
    // NOTE: Change the image URLs to "...file.svg?v=2" to invalidate the cache
    sprite:{
      layout: {
        padding: 10, // 1px padding prevents artifacts when doing CSS transforms
        cssSpritesheetName:       'layout_x1',
        cssRetinaSpritesheetName: 'layout_x2',
        retinaSrcFilter: 'image-raw/layout/*_x2.png',
        src:             'image-raw/layout/*.png',
        dest:            '_tmp/layout_x1.png',
        retinaDest:      '_tmp/layout_x2.png',
        destCss:         'scss/_sprite-layout.scss',
        imgPath:         '/rg/image-min/layout_x1.png', // URL given in SASS
        retinaImgPath:   '/rg/image-min/layout_x2.png', // (starting slash is important in this case)
        cssRetinaGroupsName: 'layout-groups', // Scss variable for all x1 and x2 grops
      },
      avatars17: {
        padding: 10, // 1px padding prevents artifacts when doing CSS transforms
        cssSpritesheetName:       'avatars17_x1',
        cssRetinaSpritesheetName: 'avatars17_x2',
        retinaSrcFilter: 'image-raw/avatars_17/*_x2.png',
        src:             'image-raw/avatars_17/*.png',
        dest:            '_tmp/avatars17_x1.png',
        retinaDest:      '_tmp/avatars17_x2.png',
        destCss:         'scss/_sprite-avatars17.scss',
        imgPath:         '/rg/image-min/avatars17_x1.png', // URL given in SASS
        retinaImgPath:   '/rg/image-min/avatars17_x2.png', // (starting slash is important in this case)
        cssRetinaGroupsName: 'avatars17-groups', // Scss variable for all x1 and x2 grops
      },
    },

    // Optimize PNG: Lossless, use for fullcolor and gradients etc. (No palette mode)
    // Also accepts JPG, SVG, GIF files. Warning: Can make massive files
    imagemin: {
      default: {
        options: {
          optimizationLevel: 2, // Go no higher than 5. Use 2 or 3
        },
        files: [{
          expand: true, // Compress spritesheets
          cwd:  '_tmp/',
          src:  '*.png',
          dest: 'image-min/'
        },{
          expand: true, // Compress individual files
          cwd:  'image-raw/solo/',
          src:  '*.png',
          dest: 'image-min/solo/'
        }]
      }
    },

    // Export width/height variables for the solo images
    scss_images: {
      dist: {
        options: {
          imageRoot: 'image-min/solo/',
          prefix: 'solo',
          antiCache: false,
          relativePath: '/rg/image-min/solo/'
        },
        files: {
          'scss/_solo.scss': ['image-min/solo/*_x1.png']
        }
      }
    },
    */
    
    watch: {
      reload: { files: 'Gruntfile.js',  tasks: 'build', options: {reload: true} },
      css:    { files: 'page*/*.scss', tasks: 'build:css'  },
      html:   { files: 'page*/*.hbs',  tasks: 'build:html' },
      js:     { files: ['page*/*.js', 'source/*.js'], tasks: 'build:js'},
    },
  });
   
  grunt.registerTask('snutiNote', function() {
    grunt.log.writeln(['\nSnuti note:\nRememmber to hug your co-worker <3']);
  });
  grunt.registerTask('prepHandlebars', [
    'shell:handlebarsDeleteCompiled',
    'shell:handlebarsSplit',
    'shell:handlebarsRename',
    'shell:handlebarsDeleteFirstLine'
  ]);
  grunt.registerTask('default',    ['build','watch']);
  grunt.registerTask('build',      ['build:css','build:html']);
  grunt.registerTask('build:css',  ['shell:gruntCount','concat','sass','autoprefixer']);
  grunt.registerTask('build:html', ['prepHandlebars','handlebars','build:js']);
  grunt.registerTask('build:js',   ['shell:gruntCount','uglify']);
  //grunt.registerTask('build:img',  ['shell:gruntCount','sprite','imagemin','scss_images', 'snutiNote']);
  //grunt.registerTask('build:svg',  ['svgmin']);
}
