require 'spec_helper'

describe Hdfs::DataSourceRegistrar do
  let(:owner) { FactoryGirl.create(:user) }
  let(:hadoop_version) { "0.1.2.3" }
  let(:data_source_attributes) do
    {
      :name => "new",
      :description => "old description",
      :port => 12345,
      :host => "server.emc.com",
      :username => "hadoop",
      :group_list => "staff,team1",
      :job_tracker_host => "foobar",
      :job_tracker_port => 3333,
      :hdfs_version => "Pivotal HD 1.1"
    }
  end
  let(:is_accessible) { true }

  before do
    stub(Hdfs::QueryService).version_of(is_a(HdfsDataSource)) { hadoop_version }
    stub(Hdfs::QueryService).accessible?(is_a(HdfsDataSource)) { is_accessible }
  end

  describe ".create!" do
    context "when connection succeeds but data source is invalid" do
      it "does not save the object" do
        expect {
          Hdfs::DataSourceRegistrar.create!({}, owner)
        }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    context "when the data source is unreachable" do
      let(:is_accessible) { false }

      it "raises an api validation error" do
        expect {
          Hdfs::DataSourceRegistrar.create!(data_source_attributes, owner)
        }.to raise_error(ApiValidationError)
      end
    end

    context "when a connection is made using some hadoop version" do
      it "save the data source with right version" do
        data_source = Hdfs::DataSourceRegistrar.create!(data_source_attributes, owner)

        data_source.version.should == "0.1.2.3"
        data_source.id.should_not be_nil
        data_source.should be_valid
      end

      it "saves the hdfs data_source" do
        data_source = Hdfs::DataSourceRegistrar.create!(data_source_attributes, owner)

        data_source.should be_persisted
        data_source.host.should == data_source_attributes[:host]
        data_source.port.should == data_source_attributes[:port]
        data_source.description.should == data_source_attributes[:description]
        data_source.username.should == data_source_attributes[:username]
        data_source.group_list.should == data_source_attributes[:group_list]
        data_source.job_tracker_host.should == data_source_attributes[:job_tracker_host]
        data_source.job_tracker_port.should == data_source_attributes[:job_tracker_port]
      end

      it "makes a HdfsDataSourceCreated event" do
        data_source = Hdfs::DataSourceRegistrar.create!(data_source_attributes, owner)

        event = Events::HdfsDataSourceCreated.last
        event.hdfs_data_source.should == data_source
        event.actor.should == owner
      end
    end
  end

  describe ".update!" do
    let(:user) { FactoryGirl.create(:user) }
    let(:hdfs_data_source) { HdfsDataSource.new(data_source_attributes) }

    before do
      hdfs_data_source.owner = owner
      hdfs_data_source.save
    end

    context 'any changes to the data source are made' do
      let(:new_attributes) { data_source_attributes.merge(:port => 7000) }

      it 'checks version and accessibility with the updated attributes' do
        mock(Hdfs::QueryService).version_of(is_a HdfsDataSource) do |ds|
          ds.port.should == 7000
          hadoop_version
        end
        mock(Hdfs::QueryService).accessible?(is_a HdfsDataSource) do |ds|
          ds.port.should == 7000
          is_accessible
        end

        described_class.update!(hdfs_data_source.id, new_attributes, user)
      end
    end

    context "invalid changes to the data_source are made" do
      before do
        data_source_attributes[:name] = ''
      end

      it "raises an exception and does not create an event" do
        expect do
          expect do
            described_class.update!(hdfs_data_source.id, data_source_attributes, user)
          end.to raise_error(ActiveRecord::RecordInvalid)
        end.to_not change { Events::HdfsDataSourceChangedName.count }
      end
    end

    context "when the data source is unreachable" do
      let(:is_accessible) { false }

      it "raises an api validation error" do
        expect {
          Hdfs::DataSourceRegistrar.update!(hdfs_data_source.id, data_source_attributes, owner)
        }.to raise_error(ApiValidationError)
      end
    end

    context "valid changes to the data_source are made" do
      before do
        data_source_attributes[:username] = "another_username"
      end

      it "updates the data_source" do
        described_class.update!(hdfs_data_source.id, data_source_attributes, user)
        hdfs_data_source.reload

        hdfs_data_source.username.should == 'another_username'
      end

      context "when the name is being changed" do
        before do
          data_source_attributes[:name] = "new_data_source_name"
        end

        it "generates a HdfsDataSourceChangedName event" do
          old_name = hdfs_data_source.name

          updated_data_source = Hdfs::DataSourceRegistrar.update!(hdfs_data_source.id, data_source_attributes, user)

          event = Events::HdfsDataSourceChangedName.find_last_by_actor_id(user.id)
          event.hdfs_data_source.should == updated_data_source
          event.old_name.should == old_name
          event.new_name.should == "new_data_source_name"
        end
      end

      context "when the name is not being changed" do
        it "does not generate an event" do
          Hdfs::DataSourceRegistrar.update!(hdfs_data_source.id, data_source_attributes, user)
          Events::HdfsDataSourceChangedName.find_last_by_actor_id(owner).should be_nil
        end
      end
    end
  end
end
