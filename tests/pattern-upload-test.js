define([
  'expect',
  'jquery',
  'mockup-registry',
  'mockup-patterns-upload'
], function(expect, $, registry, Upload) {
  'use strict';

  window.mocha.setup('bdd');
  $.fx.off = true;

/* ==========================
   TEST: Upload
  ========================== */

  describe('Upload', function () {
    describe('Div', function () {
      beforeEach(function() {
        this.$el = $('' +
          '<div>' +
          '  <div class="pat-upload"' +
          '    data-pat-upload="url: /upload">' +
          '  </div>' +
          '</div>');
      });
      afterEach(function() {
        this.$el.remove();
      });
      it('default attributes', function() {
        expect($('.pat-upload', this.$el).hasClass('upload')).to.be.equal(false);
        expect($('.dz-notice', this.$el).size()).to.equal(0);
        expect($('.upload-previews', this.$el).size()).to.equal(0);
        expect($('.dz-default', this.$el).size()).to.equal(0);
        expect($('.dz-message', this.$el).size()).to.equal(0);
        registry.scan(this.$el);
        expect($('.pat-upload', this.$el).hasClass('upload')).to.be.equal(true);
        expect($('.dz-notice', this.$el).size()).to.equal(1);
        expect($('.dz-notice p', this.$el).size()).to.equal(1);
        expect($('.dz-notice p', this.$el).html()).to.equal('Drop files here...');
        expect($('.upload-previews', this.$el).size()).to.equal(1);
        expect($('.upload-previews', this.$el).html()).to.be.equal('');
        expect($('.dz-default', this.$el).size()).to.equal(1);
        expect($('.dz-message', this.$el).size()).to.equal(1);
        expect($('.dz-message', this.$el).hasClass('dz-default')).to.be.equal(true);
        expect($('.dz-default span', this.$el).size()).to.equal(1);
        expect($('.dz-default span', this.$el).html()).to.equal('Drop files here to upload');
      });
      it('required url data option', function() {
        $('.pat-upload', this.$el).removeAttr('data-pat-upload');
        // TODO: checking throw error does not work
        //expect(registry.scan(this.$el)).to.throw(new Error('No URL provided'));
      });
      it('change className data option', function() {
        var attr = $('.pat-upload', this.$el).attr('data-pat-upload');
        $('.pat-upload', this.$el).attr('data-pat-upload', attr + '; className: drop-zone');
        registry.scan(this.$el);
        expect($('.pat-upload', this.$el).hasClass('drop-zone')).to.be.equal(true);
      });
      it('update clickable data option to true', function() {
        var attr = $('.pat-upload', this.$el).attr('data-pat-upload');
        $('.pat-upload', this.$el).attr('data-pat-upload', attr + '; clickable: true');
        registry.scan(this.$el);
        expect($('.pat-upload', this.$el).hasClass('dz-clickable')).to.be.equal(true);
      });
      it('update clickable data option to false', function() {
        var attr = $('.pat-upload', this.$el).attr('data-pat-upload');
        $('.pat-upload', this.$el).attr('data-pat-upload', attr + '; clickable: false');
        registry.scan(this.$el);
        expect($('.pat-upload', this.$el).hasClass('dz-clickable')).to.be.equal(false);
      });
      it('update wrap data option to true', function() {
        var attr = $('.pat-upload', this.$el).attr('data-pat-upload');
        $('.pat-upload', this.$el).attr('data-pat-upload', attr + '; wrap: true');
        registry.scan(this.$el);
        expect($('.pat-upload', this.$el).parent().hasClass('upload')).to.be.equal(true);
        expect($('.pat-upload', this.$el).parent().hasClass('upload-container')).to.be.equal(true);
        var dzNotice = $('.pat-upload', this.$el).next();
        expect($(dzNotice).size()).to.equal(1);
        expect($(dzNotice).hasClass('dz-notice')).to.be.equal(true);
        expect($('p', dzNotice).size()).to.equal(1);
        expect($('p', dzNotice).html()).to.equal('Drop files here...');
        var dzPreviews = $(dzNotice).next();
        expect($(dzPreviews).size()).to.equal(1);
        expect($(dzPreviews).hasClass('upload-previews')).to.be.equal(true);
        expect($(dzPreviews).html()).to.be.equal('');
        var dzMessage = $(dzPreviews).next();
        expect($(dzMessage).size()).to.equal(1);
        expect($(dzMessage).hasClass('dz-message')).to.be.equal(true);
        expect($(dzMessage).hasClass('dz-default')).to.be.equal(true);
        expect($('span', dzMessage).size()).to.equal(1);
        expect($('span', dzMessage).html()).to.equal('Drop files here to upload');
      });
      it('update wrap data option to inner', function() {
        var attr = $('.pat-upload', this.$el).attr('data-pat-upload');
        $('.pat-upload', this.$el).attr('data-pat-upload', attr + '; wrap: inner');
        registry.scan(this.$el);
        var dzChildren = $('.pat-upload', this.$el).children();
        expect($(dzChildren).hasClass('upload')).to.be.equal(true);
        expect($(dzChildren).hasClass('upload-container')).to.be.equal(true);
        expect($('.dz-notice', dzChildren).size()).to.equal(1);
        expect($('.dz-notice p', dzChildren).size()).to.equal(1);
        expect($('.dz-notice p', dzChildren).html()).to.equal('Drop files here...');
        expect($('.upload-previews', dzChildren).size()).to.equal(1);
        expect($('.upload-previews', dzChildren).html()).to.be.equal('');
        expect($('.dz-default', dzChildren).size()).to.equal(1);
        expect($('.dz-message', dzChildren).size()).to.equal(1);
        expect($('.dz-message', dzChildren).hasClass('dz-default')).to.be.equal(true);
        expect($('.dz-default span', dzChildren).size()).to.equal(1);
        expect($('.dz-default span', dzChildren).html()).to.equal('Drop files here to upload');
      });
      it('update autoCleanResults data option to true', function() {
        var attr = $('.pat-upload', this.$el).attr('data-pat-upload');
        $('.pat-upload', this.$el).attr('data-pat-upload', attr + '; autoCleanResults: true');
        registry.scan(this.$el);
        //TODO
      });
    });

    describe('Form', function () {
      beforeEach(function() {
        this.$el = $('' +
          '<div>' +
          '  <form method="post"' +
          '    action="/upload"' +
          '    enctype="multipart/form-data"' +
          '    class="pat-upload">' +
          '  </form>' +
          '</div>');
      });
      afterEach(function() {
        this.$el.remove();
      });
      it('default attributes', function() {
        expect($('.pat-upload', this.$el).hasClass('upload')).to.be.equal(false);
        expect($('.dz-notice', this.$el).size()).to.equal(0);
        expect($('.upload-previews', this.$el).size()).to.equal(0);
        expect($('.dz-default', this.$el).size()).to.equal(0);
        expect($('.dz-message', this.$el).size()).to.equal(0);
        registry.scan(this.$el);
        expect($('.pat-upload', this.$el).hasClass('upload')).to.be.equal(true);
        expect($('.dz-notice', this.$el).size()).to.equal(1);
        expect($('.dz-notice p', this.$el).size()).to.equal(1);
        expect($('.dz-notice p', this.$el).html()).to.equal('Drop files here...');
        expect($('.upload-previews', this.$el).size()).to.equal(1);
        expect($('.upload-previews', this.$el).html()).to.be.equal('');
        expect($('.dz-default', this.$el).size()).to.equal(1);
        expect($('.dz-message', this.$el).size()).to.equal(1);
        expect($('.dz-message', this.$el).hasClass('dz-default')).to.be.equal(true);
        expect($('.dz-default span', this.$el).size()).to.equal(1);
        expect($('.dz-default span', this.$el).html()).to.equal('Drop files here to upload');
      });
      it('default action url', function() {
        $('.pat-upload', this.$el).removeAttr('action');
        registry.scan(this.$el);
        //TODO
      });
      it('change className data option', function() {
        $('.pat-upload', this.$el).attr('data-pat-upload', 'className: drop-zone');
        registry.scan(this.$el);
        expect($('.pat-upload', this.$el).hasClass('drop-zone')).to.be.equal(true);
      });
      it('update clickable data option to true', function() {
        $('.pat-upload', this.$el).attr('data-pat-upload', 'clickable: true');
        registry.scan(this.$el);
        expect($('.pat-upload', this.$el).hasClass('dz-clickable')).to.be.equal(true);
      });
      it('update clickable data option to false', function() {
        $('.pat-upload', this.$el).attr('data-pat-upload', 'clickable: false');
        registry.scan(this.$el);
        expect($('.pat-upload', this.$el).hasClass('dz-clickable')).to.be.equal(false);
      });
      it('update wrap data option to true', function() {
        $('.pat-upload', this.$el).attr('data-pat-upload', 'wrap: true');
        registry.scan(this.$el);
        expect($('.pat-upload', this.$el).parent().hasClass('upload')).to.be.equal(true);
        expect($('.pat-upload', this.$el).parent().hasClass('upload-container')).to.be.equal(true);
        var dzNotice = $('.pat-upload', this.$el).next();
        expect($(dzNotice).size()).to.equal(1);
        expect($(dzNotice).hasClass('dz-notice')).to.be.equal(true);
        expect($('p', dzNotice).size()).to.equal(1);
        expect($('p', dzNotice).html()).to.equal('Drop files here...');
        var dzPreviews = $(dzNotice).next();
        expect($(dzPreviews).size()).to.equal(1);
        expect($(dzPreviews).hasClass('upload-previews')).to.be.equal(true);
        expect($(dzPreviews).html()).to.be.equal('');
        var dzMessage = $(dzPreviews).next();
        expect($(dzMessage).size()).to.equal(1);
        expect($(dzMessage).hasClass('dz-message')).to.be.equal(true);
        expect($(dzMessage).hasClass('dz-default')).to.be.equal(true);
        expect($('span', dzMessage).size()).to.equal(1);
        expect($('span', dzMessage).html()).to.equal('Drop files here to upload');
      });
      it('update wrap data option to inner', function() {
        $('.pat-upload', this.$el).attr('data-pat-upload', 'wrap: inner');
        registry.scan(this.$el);
        var dzChildren = $('.pat-upload', this.$el).children();
        expect($(dzChildren).hasClass('upload')).to.be.equal(true);
        expect($(dzChildren).hasClass('upload-container')).to.be.equal(true);
        expect($('.dz-notice', dzChildren).size()).to.equal(1);
        expect($('.dz-notice p', dzChildren).size()).to.equal(1);
        expect($('.dz-notice p', dzChildren).html()).to.equal('Drop files here...');
        expect($('.upload-previews', dzChildren).size()).to.equal(1);
        expect($('.upload-previews', dzChildren).html()).to.be.equal('');
        expect($('.dz-default', dzChildren).size()).to.equal(1);
        expect($('.dz-message', dzChildren).size()).to.equal(1);
        expect($('.dz-message', dzChildren).hasClass('dz-default')).to.be.equal(true);
        expect($('.dz-default span', dzChildren).size()).to.equal(1);
        expect($('.dz-default span', dzChildren).html()).to.equal('Drop files here to upload');
      });
      it('update autoCleanResults data option to true', function() {
        $('.pat-upload', this.$el).attr('data-pat-upload', 'autoCleanResults: true');
        registry.scan(this.$el);
        //TODO
      });
      //TODO upload complete event, i think we need robot test?
    });

  });
});
