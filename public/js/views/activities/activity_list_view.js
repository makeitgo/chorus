(function($, ns) {
    ns.SidebarActivityList = chorus.views.Base.extend({
        tagName : "ul",
        className : "sidebar_activity_list",

        events : {
            "click .morelinks a.more,.morelinks a.less" : "toggleCommentList",
            "click a.more_activities" : "fetchMoreActivities"
        },

        toggleCommentList : function(event) {
            event.preventDefault();
            $(event.target).closest("ul.comments").toggleClass("more")
        },

        additionalContext: function() {
            if (this.collection.loaded) {
                var page = parseInt(this.collection.pagination.page);
                var total = parseInt(this.collection.pagination.total);
                return { showMoreLink : total > page };
            }
        },

        collectionModelContext: function(model) {
            return { authorUrl : model.author().showUrl() };
        },

        fetchMoreActivities : function(ev) {
            ev.preventDefault();
            var pageToFetch = parseInt(this.collection.pagination.page) + 1;
            this.collection.fetchPage(pageToFetch, { add: true });
        }
    });
})(jQuery, chorus.views);

