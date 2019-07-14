var EventBus = require('eventbusjs');

function getEvents () {
    console.log(EventBus.getEvents());
}

function on (eventName, handler, scope) {
    EventBus.addEventListener(eventName, handler, scope);
}

function fire (eventName, scope, args) {
    EventBus.dispatch(eventName, scope, args);
}



module.exports = {
  getEvents: getEvents,
  on: on,
  fire: fire
};