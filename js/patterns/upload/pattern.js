/* Upload pattern.
 *
 * Options:
 *    url(string): If not used with a form, this option must provide the URL to submit to (null)
 *    clickable(boolean): If you can click on container to also upload (false)
 *    className(string): value for class attribute in the form element ('upload')
 *    paramName(string): value for name attribute in the file input element ('file')
 *    uploadMultiple(boolean): condition value for multiple attribute in the file input element. If the value is 'true' and paramName is file, 'multiple=multiple' and 'name=file[]' will be added in the file input. (false)
 *    ajaxUpload(boolean): true or false for letting the widget upload the files via ajax. If false the form will act like a normal form. (true)
 *    wrap(boolean): true or false for wrapping this element using the value of wrapperTemplate. (false)
 *    wrapperTemplate(string): HTML template for wrapping around with this element. ('<div class="upload-container"/>')
 *    resultTemplate(string): HTML template for the element that will contain file information. ('<div class="dz-notice"><p>Drop files here...</p></div><div class="upload-previews"/>')
 *    autoCleanResults(boolean): condition value for the file preview in div element to fadeout after file upload is completed. (false)
 *    previewsContainer(selector): JavaScript selector for file preview in div element. (.upload-previews)
 *    container(selector): JavaScript selector for where to put upload stuff into in case of form. If not provided it will be place before the first submit button. ('')
 *
 * Documentation:
 *    # On a form element
 *
 *    {{ example-1 }}
 *
 *    # On a div element
 *
 *    {{ example-2 }}
 *
 *    # On a single input element inside a form with NO ajax upload
 *
 *    {{ example-3 }}
 *
 * Example: example-1
 *    <form method="post" action="/upload" enctype="multipart/form-data"
 *          class="pat-upload" data-pat-upload="clickable:true">
 *        <input type="submit" value="Submit" />
 *    </form>
 *
 * Example: example-2
 *    <div class="pat-upload" data-pat-upload="url: /upload">
 *      <div>
 *        <p>Something here that is useful</p>
 *        <p>Something else here that is useful</p>
 *        <p>Another thing here that is useful</p>
 *      </div>
 *    </div>
 *
 * Example: example-3
 *    <form method="post" action="/upload" enctype="multipart/form-data">
 *        <input type="file" class="pat-upload" name="single-upload-file"
 *               data-pat-upload="uploadMultiple:false;ajaxUpload:false;maxFiles:1" />
 *        <input type="submit" value="submit" />
 *    </form>
 *
 * License:
 *    Copyright (C) 2010 Plone Foundation
 *
 *    This program is free software; you can redistribute it and/or modify it
 *    under the terms of the GNU General Public License as published by the
 *    Free Software Foundation; either version 2 of the License.
 *
 *    This program is distributed in the hope that it will be useful, but
 *    WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General
 *    Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License along
 *    with this program; if not, write to the Free Software Foundation, Inc.,
 *    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */


define([
  'jquery',
  'underscore',
  'mockup-patterns-base',
  'mockup-patterns-relateditems',
  'dropzone',
  'text!js/patterns/upload/templates/upload.xml',
  'text!js/patterns/upload/templates/preview.xml',
], function($, _, Base,
            RelatedItems, Dropzone,
            UploadTemplate, PreviewTemplate) {
  'use strict';

  /* we do not want this plugin to auto discover */
  Dropzone.autoDiscover = false;

  var UploadPattern = Base.extend({
    name: 'upload',
    defaults: {
      url: null, // XXX MUST provide url to submit to OR be in a form
      className: 'upload',
      wrap: false,
      wrapperTemplate: '<div class="upload-wrapper"/>',
      fileaddedClassName: 'dropping',
      useTus: false,
      container: '',
      ajaxUpload: true,

      paramName: 'file',
      uploadMultiple: true,
      clickable: true,
      addRemoveLinks: false,
      autoCleanResults: false,
      previewsContainer: '.previews',
      previewTemplate: null,
      maxFiles: null,
      maxFilesize: 99999999 // let's not have a max by default...
    },

    _is: function(name) {
      return this.$el[0].tagName === name;
    },

    isForm: function() {
      return this._is('FORM');
    },

    isFileInput: function() {
      return this._is('INPUT') && (this.$el.attr('type') === 'file');
    },

    init: function() {
      var self = this,
          template = UploadTemplate;

      template = _.template(template);
      self.$el.addClass(self.options.className);

      if (self.isForm()){
        if (self.options.container) {
          // a container for the upload box has been provided
          $(self.options.container, self.$el).append(template);
        } else {
          // no container, so we want upload box before the form submit button
          $('[type="submit"]:first', self.$el).before(template);
        }
        // and we want the form button to handle the upload
        // remove the upload all button
        $('.upload-all', self.$el).remove();
      } else if (self.isFileInput()) {
        // if we have a single input we want to wrap it into our container
        // and to use its name for for uploading
        self.$el.parent().append(template);
        self.$el.prependTo( self.$el.siblings('.upload-container') );

        // self.options.paramName = this.$el.attr('name');
        self.$el = self.$el.closest('.upload-container');
        if (typeof(self.options.ajaxUpload) === 'string') {
          if (self.options.ajaxUpload === 'true') {
            self.options.ajaxUpload = true;
          } else {
            self.options.ajaxUpload = false;
          }
        }
        $('.upload-all', self.$el).remove();
      } else {
        self.$el.append(template);
      }

      if (!self.options.ajaxUpload) {
        // no ajax upload, drop the fallback
        $('.fallback', this.$el).remove();
        if (this.$el.hasClass('.upload-container')){
          this.$el.addClass('no-ajax-upload');
        } else {
          this.$el.closest('.upload-container').addClass('no-ajax-upload');
        }
      }

      if (self.options.wrap) {
        self.$el.wrap(self.options.wrapperTemplate);
        self.$el = self.$el.parent();
      }

      self.uploadPath = null;
      self.$pathInput = $('input[name="upload-path"]', self.$el);
      self.setupRelatedItems(self.$pathInput);

      var $uploadArea = $('.upload-area', self.$el);

      $('button.browse').click(function(e){
        e.preventDefault();
        e.stopPropagation();
        // we trigger the dropzone dialog!
        self.dropzone.hiddenFileInput.click()
      });

      var dzoneOptions = this.getDzoneOptions();

      try {
        // if init of Dropzone fails it says nothing and
        // it fails silently. Using this block we make sure
        // that if you break it w/ some weird or missing option
        // you can get a proper log of it
        self.dropzone = new Dropzone($uploadArea[0], dzoneOptions);
      } catch (e) {
        if (window.DEBUG) {
          // log it!
          console.log(e);
        }
        throw e;
      }

      if (self.isForm()) {
        self.$el.on('submit', function(e) {
          self.dropzone.processQueue();
        });
      }

      self.dropzone.on('addedfile', function() {
        console.log('file added!!');
        // show upload controls
        $('.controls', self.$el).fadeIn('slow');
        debugger;
        // self.$el.addClass(fileaddedClassName);
        // setTimeout(function() {
        //   if (!processing) {
        //     process();
        //   }
        // }, 100);
      });

      self.dropzone.on('removedfile', function() {
        if (self.dropzone.files.length < 1) {
          $('.controls', self.$el).fadeOut('slow');
        }
      });

      if (self.options.autoCleanResults) {
        self.dropzone.on('complete', function(file) {
          setTimeout(function() {
            $(file.previewElement).fadeOut();
          }, 3000);
        });
      }

      // self.dropzone.on('sending', function(file) {
      //   console.log(file);
      // });

      // self.dropzone.on('success', function(file) {
      //   console.log(file);
      // });

      // self.dropzone.on('complete', function(file) {
      //   console.log(file);
      // });

      // self.dropzone.on('uploadprogress', function(file) {
      //   console.log(file);
      // });

      self.dropzone.on('totaluploadprogress', function(pct) {
        console.log(pct);
        $('.progress-bar-success').attr('aria-valuenow', pct).css('width', pct + '%');
      });

      self.dropzone.on("addedfile", function(file){
      });

      $('.upload-all', self.$el).click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.dropzone.processQueue();
      });
      // self.processUpload();
    },

    getDzoneOptions: function() {
      var self = this;

      // clickable option
      if (typeof(self.options.clickable) === 'string') {
        if (self.options.clickable === 'true') {
          self.options.clickable = true;
        } else {
          self.options.clickable = false;
        }
      }
      // url to submit to
      if (!self.options.url) {
        var url;
        if (self.isForm()) {
          url = self.$el.attr('action');
        }
        if (self.isFileInput()) {
          url = self.$el.closest('form').attr('action');
        }
        if (!url) {
          // form without action, defaults to current url
          url = window.location.href;
        }
        self.options.url = url;
      }

      var options = $.extend({}, self.options);
      delete options.wrap;
      delete options.wrapperTemplate;
      delete options.resultTemplate;
      delete options.autoCleanResults;
      delete options.fileaddedClassName;
      delete options.useTus;

      if (self.options.previewsContainer) {
        /*
         * if they have a select but it's not an id, let's make an id selector
         * so we can target the correct container. dropzone is weird here...
         */
        var $preview = self.$el.find(self.options.previewsContainer);
        if ($preview.length > 0) {
          options.previewsContainer = $preview[0];
        }
      }

      // XXX: do we need to allow this?
      options.autoProcessQueue = false;
      // options.addRemoveLinks = true;  // we show them in the template
      options.previewTemplate = PreviewTemplate;

      // if our element is a form we should force some values
      // https://github.com/enyo/dropzone/wiki/Combine-normal-form-with-Dropzone
      if (self.isForm()){
        options.autoProcessQueue = false;
        options.uploadMultiple = true;
        options.parallelUploads = 100;
        options.maxFiles = 100;
      }
      return options;
    },

    processUpload: function() {
      var self = this,
          processing = false,
          useTus = self.options.useTus,
          fileaddedClassName = self.options.fileaddedClassName;

      function process() {
        console.log('processing....');
        processing = true;
        if (self.dropzone.files.length === 0) {
          processing = false;
          self.$el.removeClass(fileaddedClassName);
          return;
        }
        var file = self.dropzone.files[0];
        if ([Dropzone.SUCCESS, Dropzone.ERROR, Dropzone.CANCELED]
            .indexOf(file.status) !== -1) {
          // remove it
          self.dropzone.removeFile(file);
          process();
        } else if (file.status !== Dropzone.UPLOADING) {
          // start processing file
          if (useTus && window.tus) {
            // use tus upload if installed
            self.handleTusUpload(file);
          } else {
            // otherwise, just use dropzone to process
            // XXX: do this only if auto-upload is on!
            // self.dropzone.processFile(file);
            console.log('should process autoupload here...');
          }
          // setTimeout(process, 100);
        } else {
          // currently processing
          // setTimeout(process, 100);
          console.log('should process files here...');
        }
      }
      // debugger;

    },

    handleTusUpload: function(file) {
      var self = this,
          $preview = $(file.previewElement),
          $progress = $preview.find('[data-dz-uploadprogress]'),
          chunkSize = 1024 * 1024 * 5; // 5mb chunk size

      file.status = Dropzone.UPLOADING;

      window.tus.upload(file, {
        endpoint: self.options.url,
        headers: {
          'FILENAME': file.name
        },
        chunkSize: chunkSize
      }).fail(function() {
        console.alert('Error uploading with TUS resumable uploads');
        file.status = Dropzone.ERROR;
      }).progress(function(e, bytesUploaded, bytesTotal) {
        var percentage = (bytesUploaded / bytesTotal * 100);
        $progress.css('width', percentage + '%');
        $progress.parent().css('display', 'block');
        var $size = $preview.find('.dz-size');
        $size.html('uploading...<br />' +
                   self.formatBytes(bytesUploaded) +
                   ' / ' + self.formatBytes(bytesTotal));
      }).done(function(url, file) {
        file.status = Dropzone.SUCCESS;
        self.dropzone.emit('success', file);
        self.dropzone.emit('complete', file);
      });
    },

    formatBytes: function(bytes) {
      var kb = Math.round(bytes / 1024);
      if (kb < 1024) {
        return kb + ' KiB';
      }
      var mb = Math.round(kb / 1024);
      if (mb < 1024) {
        return mb + ' MB';
      }
      return Math.round(mb / 1024) + ' GB';
    },

    setupRelatedItems: function($input) {
      // TODO: get options from upload pattern setups
      var options = {
        'vocabularyUrl': '/relateditems-test.json'
      };
      this.uploadPath = new RelatedItems($input, options);
    }

  });

  return UploadPattern;

});
