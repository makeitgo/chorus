chorus.dialogs.PreviewColumns = chorus.dialogs.Base.extend({
    className: "preview_columns",
    title: t("dataset.manage_join_tables.title"),

    setup: function() {
        this.resource = this.collection = this.model.columns();
        this.collection.fetch();
    },

    postRender: function() {
        chorus.search({
            input: this.$("input.search"),
            list: this.$(".list"),
            selector: ".name, .comment"
        });
    },

    additionalContext: function() {
        return {
            objectName: this.model.get("objectName"),
            count: this.collection.models.length
        }
    }
});
