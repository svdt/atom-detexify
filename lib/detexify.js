'use babel';

import DetexifyView from './detexify-view';
import { CompositeDisposable } from 'atom';
import Request from 'request';
import Raphael from 'raphael';
// require('lib/jquery.raphael.canvassify');
// var $ = require('jquery');
import jQuery from 'jquery';
import './underscore-min.js';
(function($) {

  function Point(x,y) {
    this.x = x;
    this.y = y;
    this.t = (new Date()).getTime();
  }

  function stroke2path(stroke) {
    var first = _.first(stroke);
    var path = _.map(_.rest(stroke), function(point) { return ["L", point.x, point.y]; })
    if (path.length == 0)
      return [["M", first.x, first.y], ["l", 0, 0.1]];
    else
      return [["M", first.x, first.y]].concat(path);
  }

  // canvassify object constructor -> new Canvassified(...) yields object
  Canvassified = function(container, config) {
    var canvassified = this;
    var defaults = {
      width: $(container).width(),
      height: $(container).height()
    }
    var config = $.extend({}, defaults, config);
    // code here...
    var paper = Raphael(container, config.width, config.height);

    var drawing = false;
    var current_stroke;
    var current_path;
    canvassified.strokes = [];

    var dirtyClass = 'dirty';
    var pristineClass = 'pristine';
    $(container).addClass(pristineClass);

    var start = function (evt) {
      $('#detexify-drawhere').fadeOut();
      $(container).addClass(dirtyClass);
      $(container).removeClass(pristineClass);
      evt.preventDefault();
      if (evt.originalEvent) evt.originalEvent.preventDefault();
      evt.stopPropagation();
      drawing = true;
      var x,y;
      pageX = evt.originalEvent.touches ? evt.originalEvent.touches[0].pageX : evt.pageX
      pageY = evt.originalEvent.touches ? evt.originalEvent.touches[0].pageY : evt.pageY
      x = pageX - $(container).offset().left;
      y = pageY - $(container).offset().top;

      current_stroke = [new Point(x,y)]; // initialize new stroke
      current_path = paper.path(stroke2path(current_stroke)).attr({'stroke-width': 5, 'stroke-linecap': 'round'});
      return false;
    }
    var stroke = function(evt) {
      evt.preventDefault();
      if (evt.originalEvent) evt.originalEvent.preventDefault();
      evt.stopPropagation();
      if (drawing) {
        var x,y;
        pageX = evt.originalEvent.touches ? evt.originalEvent.touches[0].pageX : evt.pageX
        pageY = evt.originalEvent.touches ? evt.originalEvent.touches[0].pageY : evt.pageY
        x = pageX - $(this).offset().left;
        y = pageY - $(this).offset().top;

        // console.log('pushing point at',x, y);

        current_stroke.push(new Point(x, y));
        current_path.attr('path', stroke2path(current_stroke));
      }
      // else {
      //   console.log('not drawing');
      // }
      return false;
    }
    var stop = function(evt) {
      // console.log('stopping');
      // console.log(evt);
      evt.preventDefault();
      evt.stopPropagation();
      if (drawing) {
        canvassified.strokes.push(current_stroke);
        if (config.callback) config.callback(canvassified.strokes);
        drawing = false;
      }
      return false;
    }

    $(container).mousedown(start)
      .mousemove(stroke)
      .mouseup(stop)
      .mouseleave(stop)
      .on('touchstart', start).on('touchend touchleave touchcancel', stop).on('touchmove', stroke);

    // maintainence functions
    canvassified.clear = function() {
      $(container).removeClass(dirtyClass)
      this.strokes = [];
      paper.clear();
    }

  }

  $.canvassify = function (container, config) {
    var container = $(container).get(0);
    return container.canvassified || (container.canvassified = new Canvassified(container, config));
  }

  $.fn.extend({
    canvassify: function(config) {
      $.canvassify(this, config);
      return this;
    }
  });

})(jQuery);

export default {

  detexifyView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.detexifyView = new DetexifyView(state.detexifyViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.detexifyView.getElement(),
      visible: false
    });
    this.show_n = 5;
    var that = this;
    this.canvas = new Canvassified(document.getElementById("detexify-canvas"),
      {callback: function (t){
        that.fetch(t,that.show_n);
      }}
    );
    var canvas = this.canvas;
    document.getElementById('detexify-clear').addEventListener('click',function(){canvas.clear();console.log('okcool')})


    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'detexify:toggle': () => this.toggle(),
      'detexify:fetch': () => this.fetch()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.detexifyView.destroy();
  },

  serialize() {
    return {
      detexifyViewState: this.detexifyView.serialize()
    };
  },

  toggle() {
    if(this.modalPanel.isVisible()){
      this.canvas.clear();
      return this.modalPanel.hide();
    } else {
      jQuery('#detexify-drawhere').fadeIn();
      return this.modalPanel.show()
    }
  },

  fetch(t,n){
    var that = this;
    Request.post('http://detexify.kirelabs.org/api/classify', {form:{strokes:JSON.stringify(t)}}, function(err,httpResponse,body){
      result = JSON.parse(body);
      that.detexifyView.addResult(result.slice(0, n));
    })
    return
  }

};
