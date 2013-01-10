require 'spec_helper'

describe TaggingsController do
  let(:user) { users(:owner) }

  before do
    log_in user
  end

  describe 'create' do
    let(:workfile) { workfiles(:public) }
    let(:params) { { :entity_id => workfile.id, :entity_type => 'workfile', :tag_names => tag_names } }
    let(:tag_names) { ['alpha', 'beta'] }

    it 'sets the tags to the workfile' do
      post :create, params
      response.code.should == '201'
      workfile.reload.tags.map(&:name).should =~ tag_names
    end

    context 'with a dataset' do
      let(:dataset) { datasets(:table) }
      let(:params) { { :entity_id => dataset.id, :entity_type => 'dataset', :tag_names => tag_names } }

      it 'sets the tags to the dataset' do
        post :create, params
        response.code.should == '201'
        dataset.reload.tags.map(&:name).should =~ tag_names
      end
    end

    describe "when no tag names are provided" do
      let(:tag_names) { [] }

      it 'clears the list of tags on the model' do
        post :create, params
        response.code.should == '201'
        workfile.reload.tags.should == []
      end
    end

    context 'when the user cannot see the work file' do
      let(:user) { users(:no_collaborators) }
      let(:workfile) { workfiles(:private) }

      it 'returns unauthorized' do
        post :create, params
        response.code.should == '403'
      end
    end

    context 'when tags are more than 100 characters' do
      let(:tag_names) { ["a" * 101] }

      it 'raise a validation error' do
        post :create, params
        response.should_not be_success
        decoded_errors.fields.base.should have_key :TOO_LONG
      end
    end

    describe 'when tags differ only in case' do
      let(:tag_names) { ['AlphaNotInFixtures', 'alphaNotInFixtures'] }

      it "sets a single tag on the workfile using the first tag's case" do
        post :create, params
        response.code.should == '201'
        workfile.reload.tags.map(&:name).should == ['AlphaNotInFixtures']
      end
    end
  end
end