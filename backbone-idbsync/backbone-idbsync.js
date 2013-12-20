/**
 * a simple backbone idbsync for the idbwrapper
 * of Jens Arps (https://github.com/jensarps/IDBWrapper)
 *
 */
;(function() {


    var DB = {};
    var promises = {};

    /**
     * initialize idb store, returns promise
     * @param  {object} model
     * @return {jquery promise}
     */
    function _initStore(model) {

        var deferred = new jQuery.Deferred();

        if (DB[model.storeName] !== void 0) {
            deferred.resolve();
            return deferred;
        }

        DB[model.storeName] = new IDBStore({
            storeName   : model.storeName,
            storePrefix : 'idbwrapper-',
            onError     : function(error)   { deferred.reject(error);   },
            onStoreReady: function()        { deferred.resolve();       }
        });

        return deferred;
    }


    function _cleanData(data) {

        var returnData = {};
        _.each(data, function(value, key) {
            if (value !== null) {
                returnData[key] = value;
            }
        });

        return returnData;
    }

    function _syncModel(model, items, opts) {
        model.trigger('sync', model, items, opts);
        opts.success(items);
    }

    function _onerror(msg, model) {

        if (msg === null || msg.length === 0) {
            msg = 'undefined error given';
        }

        throw new Error(msg, model);
    }


    function _read(instance, opts) {

        if (instance instanceof Backbone.Model) {
            _readModel(instance, opts);
            return true;
        }

        _readCollection(instance, opts);
    }

    function _readModel(model, opts) {

        if (model.get('id') === null) {
            throw new Error('no id given');
        }

        DB[model.storeName].get(model.get('id'),
                function(items) { _syncModel(model, items, opts);   },
                function()      { _onerror('fail to read', model);  });
    }

    function _readCollection(collection, opts) {

        opts        = opts || {};
        opts.filter = opts.filter || null;

        var items  = [];
        var onItem = function(item) {

            if (opts.filter === null) {
                items.push(item);
                return true;
            }

            _.each(opts.filter, function(value, key) {
                if (item[key]) {
                    if (item[key] == value) {
                        items.push(item);
                    }
                }
            });
        };

        DB[collection.storeName].iterate(onItem, {
            onEnd : function() {
                _syncModel(collection, items, opts);
            }
        });
    }


    function _create(model, opts) {

        DB[model.storeName]
            .put(_cleanData(model.attributes),
                function(id)    { _syncModel(model, {id:id}, opts);     },
                function()      { _onerror('fail to create', model);    });
    }

    function _update(model, opts) {

        if (model.get('id') === null) {
            throw new Error('no id given');
        }

        DB[model.storeName].put(model.attributes,
                function(items) { _syncModel(model, items, opts);       },
                function()      { _onerror('fail to update', model);    });
    }

    function _delete(model, opts) {

        if (model.get('id') === null) {
            throw new Error('no id given');
        }

        DB[model.storeName].remove(model.get('id'),
                function(items) { _syncModel(model, items, opts);       },
                function()      { _onerror('fail to delete', model);    });
    }


    Backbone.sync = function(method, model, options) {

        if (model.storeName === void 0) {
            throw new Error('no storeName given');
        }

        options         = options           || {};
        options.success = options.success   || function() {};
        options.error   = options.error     || function() {};

        promises[model.storeName] = promises[model.storeName] || _initStore(model);
        promises[model.storeName]
            .fail(function() {})
            .done(function() {

                switch (method) {
                    case 'read'  :   _read(model, options); break;
                    case 'create': _create(model, options); break;
                    case 'update': _update(model, options); break;
                    case 'delete': _delete(model, options); break;
                }
            });
    };

})();