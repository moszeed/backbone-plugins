backbone-template
================
optimized plugin to get and set templates to view`s


## Dependencies
- jQuery
- underscore

## How to use ?

    var view = Backbone.View.extend({

            render : function() {

                this.template({
                    path    : ' -- Path to Template --',
                    params  : ' -- Template Params  --',    //optional
                    success : function() {},                //optional
                });
            }
        });