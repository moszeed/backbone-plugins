;(function() {

    var root = this;
    var Codelist = {};

        Codelist.Model  = Backbone.Model.extend({

            defaults : {
                name        : null,
                description : null,
                items       : null
            },

            getDescriptionByValue : function(value) {

                var result = _.findWhere(this.get('items'), {
                    value : value
                });

                if (result === void 0) {
                    return false;
                }

                return result.description;
            },

            getDescriptionByName : function(name) {

                var result = _.findWhere(this.get('items'), {
                    name : name
                });

                if (result === void 0) {
                    return false;
                }

                return result.description;
            }
        });

        Codelist.Collection = Backbone.Collection.extend({

            model       : Codelist.Model,
            getCodelist : function(name) {

                var def = $.Deferred();

                var codelist = this.findWhere({name : name});
                if (codelist !== void 0) {
                    def.resolve(codelist);
                    return def;
                }

                var path = './assets/codelists/' + name + '.json';

                var that = this;
                $.get(path, function(data) {

                    codelist = new Codelist.Model();
                    codelist.set(data);

                    that.add(codelist);

                    def.resolve(codelist);
                }, 'json');



                return def;
            }
        });

        Codelist.currentAvailable = new Codelist.Collection();


        Codelist.getByName = function(name) {

            if (name === void 0) throw new Error('no name given');
            return Codelist.currentAvailable.getCodelist(name);
        };

        Backbone.View.prototype.fillSelectByCodelist = function(params) {

            params          = params        || {};
            params.selected = params.selected || null;

            if (params.target   == void 0) throw new Error('no target given');
            if (params.codelist == void 0) throw new Error('no codelist given');

            var tmpl = '<option <%= selected%> value="<%= value%>"><%= description%></option>';

            Codelist.getByName(params.codelist)
                .done(function(codelist) {

                    if (codelist.attributes.items === void 0 ||
                        codelist.attributes.items.length === 0) {
                        return true;
                    }

                    var options = [];
                    _(codelist.attributes.items).each(function(item) {
                        options.push(_.template(tmpl, {
                            selected    : (params.selected == item.value) ? 'selected' : '',
                            value       : item.value,
                            description : item.description
                        }));
                    });

                    params.target.html(options.join(' '));
                });
        };

        Backbone.View.prototype.fillInputSelectionByCodelist = function(params) {

            params = params          || {};

            if (void 0 == params.selectedValue) {
                return true;
            }

            if (params.inputTarget  == void 0) throw new Error('no input target given');
            if (params.codelistName == void 0) throw new Error('no codelistName given');

            Codelist.getByName(params.codelistName)
                .done(function(codelist) {

                    if (codelist.attributes.items === void 0 ||
                        codelist.attributes.items.length === 0) {
                        return true;
                    }

                    var selectedItem = _(codelist.get('items')).findWhere({value: Number(params.selectedValue)});

                    if (void 0 == selectedItem) {
                        return false;
                    }

                    params.inputTarget.val(selectedItem.description);
                    return true;
                });

        };

        root.Codelist = Codelist;

}).call(this);