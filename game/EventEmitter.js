export const EventEmitter = {

    // NISEM SURE KAJ TO SPLOH JE

    _eventHandlers: {},

    addEventListener: (event, handler) => {
        if (!this._eventHandlers[event]) {
            this._eventHandlers[event] = [];
        }
        this._eventHandlers[event].push(handler);
    },

    trigger: event => {
        const handlers = this._eventHandlers[event];
        if (!handlers) {
            return;
        }

        for (let i = 0; i < handlers.length; i++) {
            handlers[i].apply(this, Array.prototype.slice.call(arguments, 1));
        }
    }

};
