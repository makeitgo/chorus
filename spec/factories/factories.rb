require 'factory_girl'

FactoryGirl.define do
  factory :data_source do
    sequence(:name) { |n| "data_source#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    sequence(:host) { |n| "data_source#{n + FACTORY_GIRL_SEQUENCE_OFFSET}.emc.com" }
    sequence(:port) { |n| 5000+n }
    db_name "db_name"
    db_username "username"
    db_password "password"
    owner
  end

  factory :gpdb_data_source do
    sequence(:name) { |n| "gpdb_data_source#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    sequence(:host) { |n| "gpdb_host#{n + FACTORY_GIRL_SEQUENCE_OFFSET}.emc.com" }
    sequence(:port) { |n| 5000+n }
    db_name "postgres"
    owner
    version "9.1.2 - FactoryVersion"
    db_username 'username'
    db_password 'secret'
    after(:build) do |data_source|
      def data_source.valid_db_credentials?(account)
        true
      end
    end

    after(:create) do |data_source|
      data_source.singleton_class.send :remove_method, :valid_db_credentials?
    end
  end

  factory :oracle_data_source do
    sequence(:name) { |n| "oracle_data_source#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    sequence(:host) { |n| "oracle_host#{n + FACTORY_GIRL_SEQUENCE_OFFSET}.emc.com" }
    sequence(:port) { |n| 5000+n }
    db_name "db_name"
    owner
    db_username 'username'
    db_password 'secret'
    after(:build) do |data_source|
      def data_source.valid_db_credentials?(account)
        true
      end
    end

    after(:create) do |data_source|
      data_source.singleton_class.send :remove_method, :valid_db_credentials?
    end
  end

  factory :jdbc_data_source do
    sequence(:name) { |n| "jdbc_data_source#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    sequence(:host) { |n| "jdbc:teradata://jdbc_server#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    owner
    db_username 'username'
    db_password 'secret'
    after(:build) do |data_source|
      def data_source.valid_db_credentials?(account)
        true
      end
    end

    after(:create) do |data_source|
      data_source.singleton_class.send :remove_method, :valid_db_credentials?
    end
  end

  factory :pg_data_source, :class => PgDataSource do
    sequence(:name) { |n| "pg_data_source#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    sequence(:host) { |n| "pg_host#{n + FACTORY_GIRL_SEQUENCE_OFFSET}.my_postgres.com" }
    sequence(:port) { |n| 5000+n }
    db_name "postgres"
    owner
    version "9.1.2 - FactoryVersion"
    db_username 'username'
    db_password 'secret'
    after(:build) do |data_source|
      def data_source.valid_db_credentials?(account)
        true
      end
    end

    after(:create) do |data_source|
      data_source.singleton_class.send :remove_method, :valid_db_credentials?
    end
  end

  factory :hdfs_data_source do
    sequence(:name) { |n| "hdfs_data_source#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    sequence(:host) { |n| "host#{n + FACTORY_GIRL_SEQUENCE_OFFSET}.emc.com" }
    sequence(:port) { |n| 5000+n }
    sequence(:job_tracker_host) { |n| "job-tracker-host#{n + FACTORY_GIRL_SEQUENCE_OFFSET}.emc.com" }
    sequence(:job_tracker_port) { |n| 10000+n }
    hdfs_version "Pivotal HD 1.1"
    high_availability { false }
    owner
  end

  factory :gnip_data_source do
    sequence(:name) { |n| "gnip_data_source#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    sequence(:stream_url) { |n| "https://historical.gnip.com/stream_url#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    sequence(:username) { |n| "user#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    password "secret"
    owner
  end

  factory :data_source_account do
    sequence(:db_username) { |n| "username#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    db_password "secret"
    owner
    association :data_source, :factory => :gpdb_data_source
  end

  factory :gpdb_database do
    sequence(:name) { |n| "database#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    association :data_source, :factory => :gpdb_data_source
  end

  factory :pg_database do
    sequence(:name) { |n| "pg_database#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    association :data_source, :factory => :pg_data_source
  end

  factory :gpdb_schema do
    sequence(:name) { |n| "schema#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    association :database, :factory => :gpdb_database
    refreshed_at Time.current
  end

  factory :oracle_schema do
    sequence(:name) { |n| "oracle_schema#{n + FACTORY_GIRL_SEQUENCE_OFFSET}"}
    association :data_source, :factory => :oracle_data_source
  end

  factory :jdbc_schema do
    sequence(:name) { |n| "jdbc_schema#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    association :data_source, :factory => :jdbc_data_source
  end

  factory :pg_schema do
    sequence(:name) { |n| "pg_schema#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    association :database, :factory => :pg_database
  end

  factory :oracle_table do
    sequence(:name) { |n| "table#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    association :schema, :factory => :oracle_schema
  end

  factory :oracle_view do
    sequence(:name) { |n| "view#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    association :schema, :factory => :oracle_schema
  end

  factory :jdbc_table do
    sequence(:name) { |n| "table#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    association :schema, :factory => :jdbc_schema
  end

  factory :jdbc_view do
    sequence(:name) { |n| "view#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    association :schema, :factory => :jdbc_schema
  end

  factory :pg_table do
    sequence(:name) { |n| "table#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    association :schema, :factory => :pg_schema
  end

  factory :pg_view do
    sequence(:name) { |n| "view#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    association :schema, :factory => :pg_schema
  end

  factory :gpdb_table do
    sequence(:name) { |n| "table#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    association :schema, :factory => :gpdb_schema
  end

  factory :gpdb_view do
    sequence(:name) { |n| "view#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    association :schema, :factory => :gpdb_schema
  end

  factory :chorus_view do
    sequence(:name) { |n| "chorus_view#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    association :schema, :factory => :gpdb_schema
    association :workspace
    query "select 1;"
    after(:build) do |chorus_view|
      chorus_view.instance_variable_get(:@changed_attributes).delete("query")
    end
  end

  factory :hdfs_dataset do
    sequence(:name) { |n| "#{Faker::Company.name}_#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    hdfs_data_source
    workspace
    file_mask "/*"
  end

  factory :gpdb_dataset_column do
    sequence(:name) { |n| "column#{n}" }
    data_type "text"
    description "A nice gpdb column description"
    sequence(:ordinal_position)
  end

  factory :oracle_dataset_column do
    sequence(:name) { |n| "column#{n}" }
    data_type "text"
    description "A nice oracle column description"
    sequence(:ordinal_position)
  end

  factory :dataset_statistics do
    initialize_with do
      new({
            'table_type' => 'BASE_TABLE',
            'row_count' => '1000',
            'column_count' => '5',
            'description' => 'This is a nice table.',
            'last_analyzed' => Time.parse('2012-06-06 23:02:42.40264+00'),
            'disk_size' => 2097152,
            'partition_count' => '0',
            'definition' => "SELECT * FROM foo"
          })
    end
  end

  factory :hdfs_dataset_statistics do
    initialize_with do
      new({ 'file_mask' => 'A file mask' })
    end
  end

  factory :workspace do
    sequence(:name) { |n| "workspace#{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    owner
    project_status 'on_track'
    is_project false

    public true

    after(:create) do |workspace|
      FactoryGirl.create(:membership, :workspace => workspace, :user => workspace.owner)
    end

    factory :workspace_with_sandbox do
      association :sandbox, factory: :gpdb_schema
    end

    factory :project do
      project_status_reason { Faker::Company.catch_phrase }
      is_project true

      after(:create) do |project|
        Events::ProjectStatusChanged.by(project.owner).add(:workspace => project)
        5.times { project.milestones.create(FactoryGirl.attributes_for(:milestone)) }
      end
    end
  end

  factory :membership do
    user
    workspace
  end

  factory :milestone do
    sequence(:name) { |n| "Milestone #{n + FACTORY_GIRL_SEQUENCE_OFFSET}" }
    state { ["planned", "achieved"].sample }
    target_date { Date.today + rand(100) }
    workspace
  end

  factory :associated_dataset do
    association :dataset, :factory => :gpdb_table
    workspace
  end

  factory :tableau_workbook_publication do
    sequence(:name) { |n| "workbook#{n}" }
    project_name "Default"
    association :dataset, :factory => :gpdb_table
    workspace
  end

  factory :hdfs_entry do
    hdfs_data_source
    is_directory false
    path "/folder/subfolder/file.csv"
    modified_at 1.year.ago
  end

  factory :hdfs_entry_statistics do
    owner { Faker::Name.first_name }
    group { Faker::Name.last_name }
    modified_at { Time.current.to_s }
    accessed_at { Time.current.to_s }
    size { rand(1..100000) }
    block_size { rand(1..10000) }
    permissions 'rwx--w--r'
    replication { rand(1..4) }
  end

  factory :system_status do
    expired false
    user_count_exceeded false
  end

  factory :upload do
    user
    contents { Rack::Test::UploadedFile.new(File.expand_path('spec/fixtures/test.csv', Rails.root), 'text/csv') }
  end

  factory :hdfs_import do
    user
    hdfs_entry
    upload
  end
end

