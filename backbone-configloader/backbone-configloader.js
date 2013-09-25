;(function() {

    var Configs = {};
        Configs._promises = {};

    function getConfig(name) {

        var opts = {
            url         : './assets/config/' + name + '.json',                  //config path
            dataType    : 'JSON'
        };

        var promise =   Configs._promises[name] || $.ajax(opts);
                        Configs._promises[name] = promise;

        return promise;
    }

    //get config by name
    Backbone.View.prototype.getConfig = function(name) {
        return getConfig(name);
    };

})();