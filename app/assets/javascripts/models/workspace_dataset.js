chorus.models.WorkspaceDataset = chorus.models.Dataset.include(
    chorus.Mixins.Attachment
).extend({
    constructorName: "WorkspaceDataset",

    urlTemplate: function(options) {
        options = options || {};
        if(options.download) {
            return this._super("urlTemplate", arguments);
        } else {
            return "workspaces/{{workspace.id}}/datasets/{{id}}";
        }
    },

    showUrlTemplate: function() {
        return "workspaces/{{workspace.id}}/datasets/{{id}}";
    },

    iconUrl: function() {
        var result = this._super("iconUrl", arguments);
        if (!this.hasCredentials()) {
            result = result.replace(".png", "_locked.png");
        }
        return result;
    },

    query: function() {
        return this.get("query") || this.get("content");
    },

    isSandbox: function() {
        return this.get("entitySubtype") === "SANDBOX_TABLE";
    },

    deriveChorusView: function() {
        var chorusView = new chorus.models.ChorusView({
            sourceObjectId: this.id,
            sourceObjectType: "dataset",
            workspace: this.get("workspace"),
            objectName: this.name()
        });
        chorusView.setSchema(this.schema());
        chorusView.sourceObject = this;
        return chorusView;
    },

    createDuplicateChorusView: function() {
        var attrs = _.extend({},  this.attributes, {
            objectName: t("dataset.chorusview.copy_name", { name: this.get("objectName") }),
            sourceObjectId: this.id
        });
        delete attrs.id;
        var chorusView = new chorus.models.ChorusView(attrs);
        chorusView.duplicate = true;
        chorusView.sourceObject = this;
        return chorusView;
    },

    getImports: function() {
        if (!this._datasetImports) {
            this._datasetImports = new chorus.collections.WorkspaceImportSet([], {
                datasetId: this.get("id"),
                workspaceId: this.get("workspace").id
            });
        }
        return this._datasetImports;
    },

    getImportSchedules: function() {
        if (!this._datasetImportSchedules) {
            this._datasetImportSchedules = new chorus.collections.DatasetImportScheduleSet([], {
                datasetId: this.get("id"),
                workspaceId: this.get("workspace").id
            });
            this.listenTo(this._datasetImportSchedules, "remove", this.importScheduleRemoved);
        }
        return this._datasetImportSchedules;
    },

    importScheduleRemoved: function() {
        this.unset("frequency", {silent: true});
        this.trigger('change');
    },

    importSchedule: function() {
        return this.getImportSchedules().last();
    },

    lastImport: function() {
        if(this.hasImport())
        {
            return this.getImports().first();
        }
    },

    setImport: function(datasetImport) {
        this._datasetImport = datasetImport;
    },

    importFrequency: function() {
        if (this.importSchedule()) {
            return this.importSchedule().get('frequency');
        } else {
            return this.get('frequency');
        }
    },

    columns: function(options) {
        var result = this._super('columns', arguments);
        result.attributes.workspaceId = this.get("workspace").id;
        return result;
    },

    hasOwnPage: function() {
        return true;
    },

    lastImportSource: function() {
        var importInfo = this.get("importInfo");
        if (importInfo && importInfo.sourceId) {
            return new chorus.models.WorkspaceDataset({
                id: importInfo.sourceId,
                objectName: importInfo.sourceTable,
                workspaceId: this.get("workspace").id
            });
        }
    },

    canBeImportSource: function() {
        return !this.isSandbox();
    },

    canBeImportDestination: function() {
        return true;
    },

    setWorkspace: function(workspace) {
        this.set({workspace: {id: workspace.id}});
    }
});
