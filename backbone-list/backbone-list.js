;(function() {

    /**
     * List View Templates
     */
    var List        = Backbone.View.extend({tagName : 'ul'});
    var ListItem    = Backbone.View.extend({tagName : 'li'});

    /**
     * build list, creates a new list view
     * @param  {Object}         options
     * @return {Backbone.View}  created list view
     */
    Backbone.View.prototype.buildList = function(params) {

        params              = params                || {};
        params.name         = params.name           || 'list';
        params.item         = params.item           || ListItem;

        params.fetchParams          = params.fetchParams            || {};
        params.fetchParams.success  = params.fetchParams.success    || function() {};

        params.target       = this.$el.find(params.target)  || this.$el;

        if (!(params.collection instanceof Backbone.Collection)) {
            throw new Error('no collection instance given');
        }

        var view = new List({collection:params.collection});
            view.$el
                .hide()
                .addClass(params.name)
                .appendTo(params.target);


            //append success part to success function
            params.fetchParams.success =(function() {
                var cachedSuccess = params.fetchParams.success;
                return function() {
                    cachedSuccess.apply(this, arguments);
                    view.$el.show();
                };
            }());

            //build the list
            view.addList({
                'collection'    : view.collection,
                'item'          : params.item,
                'fetchParams'   : params.fetchParams
            });

        return view;
    };

    /**
     * add list to existing list view
     * @param  {Object}         options
     */
    Backbone.View.prototype.addList = function(params) {

        params              = params || {};
        params.fetchParams  = params.fetchParams || {};

        if (params.collection   === void 0) throw new Error('no collection given');
        if (params.item         === void 0) throw new Error('no item given');
        if (params.target       === void 0) params.target    = this.$el;
        if (params.fetchFunc    === void 0) params.fetchFunc = 'fetch';

        var that = this;

            //clear list on reset
            that.listenTo(params.collection, 'reset', function() {
                params.target.html('');
            });

            //add to list
            that.listenTo(params.collection, 'add', function(model) {
                that.addItem({
                    'target'    : params.target,
                    'item'      : params.item,
                    'model'     : model
                });
            });

            params.collection[params.fetchFunc](params.fetchParams);
    };

    /**
     * add item to existing list view with list collection
     * @param  {Object}         options
     * @return {Backbone.View}  created list view
     */
    Backbone.View.prototype.addItem = function(params) {

        params = params || {};

        if (params.target   === void 0) throw new Error('no target given');
        if (params.model    === void 0) throw new Error('no model given');
        if (params.item     === void 0) throw new Error('no path given');


        var view = new params.item({model:params.model});

        if (params.prepend === void 0 || params.prepend === false) {
            view.$el.appendTo(params.target);
        } else {
            view.$el.prependTo(params.target);
        }

            view.render();

        return view;
    };

})();