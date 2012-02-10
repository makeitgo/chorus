chorus.views.DatabaseColumnList = chorus.views.Base.extend({
    tagName:"ul",
    className:"database_column_list",
    additionalClass:"list",
    events:{
        "click li":"selectColumn"
    },
    selectMulti: false,

    setup:function () {
        this.collection.comparator = function (column) {
            return parseInt(column.get("ordinalPosition"))
        };
        this.collection.sort();
    },

    postRender:function () {
        this.$("li:eq(0)").click();
    },

    collectionModelContext:function (model) {
        return {
            typeClass:model.humanType(),
            typeString: model.get("type")
        }
    },

    selectColumn:function (e) {
        var selectedColumn = $(e.target).closest("li");
        if(this.selectMulti) {
            selectedColumn.toggleClass("selected");
        } else {
            this.$("li").removeClass("selected");
            selectedColumn.addClass("selected");
        }
    }
});
