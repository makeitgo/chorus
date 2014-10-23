chorus.views.ProjectListHeader = chorus.views.Base.extend({
    constructorName: "ProjectListHeaderView",
    templateName: "project_list_content_header",
    additionalClass: 'list_header',

    events: {
        'change .workspace_filter': 'triggerCollectionFilter'
    },

    setup: function() {
        this.projectCardListModel = new chorus.models.ProjectCardList();
        this.projectCardListModel.fetch({
            success: _.bind(function() {
                var value = this.projectCardListModel.get('option');
                this.list.fillOutContent(value);
            }, this)
        });
    },

    postRender: function(e) {
        _.defer(_.bind(function () {
            chorus.styleSelect(this.$("select.workspace_filter"));
        }, this));
    },

    triggerCollectionFilter: function (e) {
        e && e.preventDefault();

        var filterClass = this.$("select.workspace_filter").val();
        if(this.projectlist.mostActive) {
            if(filterClass === 'members_only' || filterClass === 'all') {
                this.list.fillOutContent(filterClass);
            }
        }
        else {
            if(filterClass === 'most_active') {
                this.list.fillOutContent('most_active');
            }
            else {
                this.projectlist.triggerRender(filterClass === 'all');
            }
        }
        this.$("select.workspace_filter").val(filterClass);
        this.projectCardListModel.save({optionValue: filterClass});
    }
});
