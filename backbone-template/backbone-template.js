;(function() {

    var Template = {};
        Template._promises = {};

    function getTemplate(path) {
        var promise = Template._promises[path] || $.get(path);
        Template._promises[path] = promise;
        return promise;
    }

    //make template function available in views
    Backbone.View.prototype.template = function(params) {

        params          = params            || {};
        params.params   = params.params     || {};
        params.success  = params.success    || function() {};

        if (params.path === void 0) {
            throw Error('no path given');
        }

        var that = this;
        getTemplate(params.path)
            .done(function(tpl) {
                that.$el.html(_.template(tpl, params.params));
                params.success();
            })
            .fail(function() {
                throw Error('fail to get template');
            });
    };

})();