chorus.presenters.TabularDataSidebar = function(sidebar) {
    var keys = ["resource", "statistics", "options", "selectedColumn", "importConfiguration"];
    _.each(keys, function(key) {
        this[key] = sidebar[key];
    }, this);

    return this.makeContext();
}

_.extend(chorus.presenters.TabularDataSidebar.prototype, {
    makeContext: function() {
        var additionalContexts = ['resource', 'import', 'nextImport', 'lastImport', 'statistics', 'column', 'workspace']

        return _.reduce(additionalContexts,
            function(result, context) { return _.extend(result, this[context + "Context"]()) },
            this.initialContext(),
            this)
    },

    initialContext: function() {
        return _.extend({
            typeString: Handlebars.helpers.humanizedTabularDataType(this.resource && this.resource.attributes)
        }, this.options);
    },

    statisticsContext: function() {
        var ctx = {};

        if (!this.statistics) { return ctx; }

        ctx.statistics = this.statistics.attributes;
        if (ctx.statistics.rows === 0) {
            ctx.statistics.rows = "0"
        }

        if (ctx.statistics.columns === 0) {
            ctx.statistics.columns = "0"
        }

        return ctx;
    },

    columnContext: function() {
        return {
            column: this.selectedColumn && this.selectedColumn.attributes
        }
    },

    workspaceContext: function() {
        if (!this.options.workspace) { return {}; }

        var deleteMsgKey;
        var deleteTextKey;

        if (this.resource) {
            if (this.resource.get("type") == "CHORUS_VIEW") {
                deleteMsgKey = "delete";
                deleteTextKey = "actions.delete";
            } else if (this.resource.get("type") == "SOURCE_TABLE") {
                if (this.resource.get("objectType") == "VIEW") {
                    deleteMsgKey = "disassociate_view";
                    deleteTextKey = "actions.delete_association";
                } else {
                    deleteMsgKey = "disassociate_table";
                    deleteTextKey = "actions.delete_association";
                }
            }
        }

        return {
            canExport: this.canExport(),
            hasSandbox: this.options.workspace.sandbox(),
            workspaceId: this.options.workspace.id,
            activeWorkspace: this.options.workspace.get("active"),
            isDeleteable: this.resource && this.resource.isDeleteable() && this.options.workspace.canUpdate(),
            deleteMsgKey: deleteMsgKey,
            deleteTextKey: deleteTextKey
        }
    },

    importContext: function() {
        var ctx = {};
        if (!this.resource || !this.resource.canBeImportSourceOrDestination()) { return ctx; }

        var importConfig = this.importConfiguration;
        ctx.isImportConfigLoaded = this.isImportConfigLoaded();
        ctx.hasSchedule = importConfig.hasActiveSchedule();
        ctx.hasImport = this.hasImport();

        return ctx;
    },

    nextImportContext: function() {
        var ctx = {};
        if (!this.hasImport() || !this.importConfiguration.hasNextImport()) { return ctx; }

        var destination = this.importConfiguration.nextDestination();
        var runsAt = chorus.helpers.relativeTimestamp(this.importConfiguration.nextExecutionAt())
        ctx.nextImport = chorus.helpers.safeT("import.next_import", { nextTime: runsAt, tableLink: this._linkToModel(destination) });

        return ctx;
    },

    lastImportContext: function() {
        var ctx = {};
        var importConfig = this.importConfiguration;

        if (!this.hasImport() || !importConfig.hasLastImport()) { return ctx; }

        var ranAt = chorus.helpers.relativeTimestamp(importConfig.lastExecutionAt());

        if (importConfig.thisDatasetIsSource()) {
            var destination = importConfig.lastDestination();
            if (importConfig.isInProgress()) {
                ctx.lastImport = chorus.helpers.safeT("import.began", { timeAgo: ranAt });
                ctx.inProgressText = chorus.helpers.safeT("import.in_progress", { tableLink: this._linkToModel(destination) });
                ctx.importInProgress = true;
            } else {
                var importStatusKey;
                if (importConfig.wasSuccessfullyExecuted()) {
                    importStatusKey = "import.last_imported";
                } else {
                    importStatusKey = "import.last_import_failed";
                    ctx.importFailed = true;
                }

                ctx.lastImport = chorus.helpers.safeT(importStatusKey, { timeAgo: ranAt, tableLink: this._linkToModel(destination) });
            }
        } else if (importConfig.thisDatasetIsDestination()) {
            var source = importConfig.importSource();
            ctx.lastImport = chorus.helpers.safeT("import.last_imported_into", { timeAgo: ranAt, tableLink: this._linkToModel(source) });
        }

        return ctx;
    },

    resourceContext: function() {
        var ctx = {};
        if (!this.resource) { return ctx; }

        ctx.entityType = this.resource.entityType;

        if (!this.resource.hasCredentials()) {
            ctx.noCredentials = true;
            var addCredentialsLink = chorus.helpers.linkTo("#", t("dataset.credentials.missing.linkText"), {'class': 'add_credentials'})
            ctx.noCredentialsWarning = chorus.helpers.safeT("dataset.credentials.missing.body", {linkText: addCredentialsLink})
        }

        ctx.displayEntityType = this.resource.metaType();
        ctx.isChorusView = this.resource.isChorusView();

        return ctx;
    },

    isImportConfigLoaded: function() {
        return this.importConfiguration && this.importConfiguration.loaded;
    },

    hasImport: function() {
        return this.importConfiguration && this.importConfiguration.has("id");
    },

    canExport: function canExport() {
        return this.options.workspace.canUpdate()
            && this.resource && this.resource.hasCredentials()
            && this.isImportConfigLoaded()
            && this.resource.canBeImportSource()
    },

    // TODO: This is a foreign function... belongs in helpers? or on chorus?
    _linkToModel: function(model) {
        return chorus.helpers.linkTo(model.showUrl(), ellipsize(model.name()), {title: model.name()});

        function ellipsize(name) {
            if (!name) return "";
            var length = 15;
            return (name.length < length) ? name : name.slice(0, length) + "...";
        }
    }
});
