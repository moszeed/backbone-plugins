;(function() {

    /**
     * Deferred fetch for collections.
     * Uses jQuery deferred
     * @param   {object} options
     * @return  {deferred object}
     */
    Backbone.Collection.prototype.deferredFetch = function(params) {

        var def = $.Deferred();

            params          = params || {};
            params.success  = params.success || function() {};

            //add promise resolve
            params.success  = (function(data) {
                var funcCache = params.success;
                return function(data) {
                    funcCache.apply(this, arguments);
                    def.resolve(data);
                };
            }());

            this.fetch(params);

        return def;
    };

})();