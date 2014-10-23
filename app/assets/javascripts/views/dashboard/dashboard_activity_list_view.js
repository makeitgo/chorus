chorus.views.DashboardActivityList = chorus.views.Base.extend({
    constructorName: "DashboardActivityListView",
    templateName:"dashboard/activity_list",
    useLoadingSection:true,

    events:{
        "click .morelinks a.more, .morelinks a.less": "toggleCommentList",
        "click .more_items a": "fetchMoreActivities"
    },

    setup: function() {
        this.subscribePageEvent('note:deleted', this.noteDeleted);
        this.subscribePageEvent('note:saved', this.noteSaved);
    },

    noteDeleted: function(note) {
        if (this.collection.get(note.id)) {
            this.collection.remove(note);
            this.collection.fetch();
        }
    },

    noteSaved: function(note) {
        var collectionNote = this.collection.get(note.id);
        if (collectionNote) {
            collectionNote.set('body', note.get('body'));
            this.render();
        }
    },

    toggleCommentList:function (ev) {
        ev.preventDefault();
        $(ev.target).closest(".comments").toggleClass("more");
        chorus.PageEvents.trigger("content:changed");
    },

    fetchMoreActivities:function (ev) {
        ev.preventDefault();
        var pageToFetch = parseInt(this.collection.pagination.page, 10) + 1;
        this.collection.fetchPage(pageToFetch, { reset: false, remove: false, success: _.bind(this.render, this) });
    },

    additionalContext:function () {
        var ctx = { activityType: this.options.type };
        if (this.collection.loaded && this.collection.pagination) {
            var page = parseInt(this.collection.pagination.page, 10);
            var total = parseInt(this.collection.pagination.total, 10);
            ctx.showMoreLink = total > page;
        } else {
            ctx.showMoreLink = false;
        }
        return ctx;
    },

    cleanupActivities:function () {
        _.each(this.activities, function (activity) {
            activity.teardown();
        });
    },

    postRender:function () {
        this.cleanupActivities();
        $(this.el).addClass(this.options.additionalClass);
        var ul = this.$("ul");
        this.activities = [];
        this.collection.each(function(model) {
            try {
                var view = new chorus.views.Activity({
                    model:model,
                    displayStyle: this.options.displayStyle,
                    isNotification: this.options.isNotification,
                    isReadOnly: this.options.isReadOnly
                });
                this.activities.push(view);
                this.registerSubView(view);
                ul.append(view.render().el);
            } catch (err) {
                chorus.log(err.message, err, "processing activity", model);
                if (chorus.isDevMode()) {
                    var action, id;
                    try {action = model.get("action");  id = model.id;} catch(err2) {}
                    chorus.toast("bad_activity", {type: action, id: id, toastOpts: {type: "error"}});
                }
            }
        }, this);
    },

    show: function() {
        _.each(this.activities, function(activity) {
            activity.show();
        });
    }
});
