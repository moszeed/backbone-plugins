/**
 * a simple backbone idbsync for the idbwrapper
 * of Jens Arps (https://github.com/jensarps/IDBWrapper)
 *
 */
;(function() {


    var DB = null;


    /**
     * initialize idb store, returns promise
     * @param  {object} model
     * @return {jquery promise}
     */
    function _initStore(model) {

        var deferred = new jQuery.Deferred();

        if (DB !== null) {
            deferred.resolve();
            return deferred;
        }

        DB = new IDBStore({
            storeName   : model.storeName,
            storePrefix : 'idbsync-',
            onError     : function(error)   { deferred.reject(error);   },
            onStoreReady: function()        { deferred.resolve();       }
        });

        return deferred;
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

        DB.get(model.get('id'),
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

        DB.iterate(onItem, {
            onEnd : function() {
                _syncModel(collection, items, opts);
            }
        });
    }


    function _create(model, opts) {

        DB.put(model.attributes,
                function(id)    { _syncModel(model, {id:id}, opts); },
                function()      { _onerror('fail to create', model);  });
    }

    function _update(model, opts) {

        if (model.get('id') === null) {
            throw new Error('no id given');
        }

        DB.put(model.attributes,
                function(items) { _syncModel(model, items, opts);       },
                function()      { _onerror('fail to update', model);    });
    }

    function _delete(model, opts) {

        if (model.get('id') === null) {
            throw new Error('no id given');
        }

        DB.remove(model.get('id'),
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

        //initialize store
        _initStore(model)
            .fail(function() { throw new Error('fail to initialize'); })
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