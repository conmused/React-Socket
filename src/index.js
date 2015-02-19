'use strict';
var io = require('socket.io-client');
var _ = require('lodash');

/**
 * Mixin constructor
 * @param {string} url Namespace you want to subscribe to with socket.io
 */

 var Mixin = function SocketMixin(url) {
  /**
  /* scoped socket instance
  */
  var socket = io;

  /**
  * Private helper method to determine if value exists and is a function
  * @param {Mixed} val The value you want to check
  */
  function existsAndFunc(val) {
    return val && {}.toString.call(val) === '[object Function]';
  }

  return {

    /**
    *  Connect/Disconnect Methods. Minimize persistant connections.
    */

    disconnect: function(){
      console.log(socket);
      if(socket.connected){
        this.socketOffAll(); //garbage collection.
        socket.io.close();
      }
    },

    connect: function(url){
      if(!socket.connected){
        if(!this.state.reconnect){
          //If we haven't yet connected.
          socket = url ? io.connect(url) : io.connect();
          this.setState({reconnect:true});
        } else {
          //maintain connection.
          socket.io.open();
        }

        this.getListeners();
      }
    },

    /**
    * Loop through all of our listeners and subscribe to the socket event.
    * Listeners is a function that returns an object.
    */
    getListeners: function(){
      var that = this;
      var listeners = this.listeners();
      this.socketEvents = {};

      if (!listeners) {
        throw new Error('SocketMixin requires listeners to be defined on the component');
      }
      _.forIn(listeners, function(value, key){
        var listener = listeners[key];
        if(existsAndFunc(listener)){
          that.socketEvents[key] = listener;
          socket.on(key, that.socketEvents[key]);
        } else {
          throw new Error('Listener: "' + key + '" is not a function');
        }
      });
    },

    /**
    * Clean up all of our even listeners
    */
    componentWillUnmount: function() {
      this.socketOffAll();
    },

    /**
    * Public method to emit a socket event to the server
    * @param {[type]} key     [description]
    * @param {[type]} payload [description]
    */
    socketEmit: function(key, payload) {
      if (key) {
        socket.emit(key, payload);
      }
    },

    /**
    * Public method to subscribe to socket event just in case you remove
    * your subscription and want to add it back on at a later time.
    *
    * Note: this will reference an existing event on the listeners property
    *
    * @param {string} key The event name youw wish to subscribe to
    */
    socketOn: function(key) {
      var listeners = this.listeners();

      if (listeners && key) {
        this.socketEvents[key] = listeners[key];
        socket.on(key, this.socketEvents[key]);
      }
    },

    /**
    * Public method to remove a specific listener from the component
    * @param {string} key The event name you wish to remove
    */
    socketOff: function(key) {
      var listeners = this.listeners();
      if (listeners && key) {
        if (existsAndFunc(listeners[key])) {
          socket.removeListener(key, this.socketEvents[key]);
          this.socketEvents[key] = null; //garbage collection
        }
      }
    },

    /**
    * Public method for removing all listeners for the component
    */
    socketOffAll: function() {
      var listeners = this.listeners();
      var that = this;

      if (listeners) {
        _.forIn(listeners, function(value, key){
          if (existsAndFunc(listeners[key])) {
            socket.removeListener(key, that.socketEvents[key]);
          }
        });

        // garbage collect our socketEvents object
        this.socketEvents = null;
      }
    },
  };
};

module.exports = Mixin;