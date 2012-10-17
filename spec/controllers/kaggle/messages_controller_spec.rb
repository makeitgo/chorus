require 'spec_helper'

describe Kaggle::MessagesController do
  let(:user) { users(:owner) }

  before do
    log_in user
  end

  describe "#create" do
    let(:params) { {
        "reply_to" => "chorusadmin@example.com",
        "html_body" => "Example Body",
        "subject" => "Example Subject",
        "recipient_ids" => ["6732"],
        "workspace_id" => "1"
    } }
    it_behaves_like "an action that requires authentication", :post, :create

    it "returns 200 when the message sends" do
      mock(Kaggle::API).send_message(hash_including(
                                         "subject" => "Example Subject",
                                         "htmlBody" => "Example Body",
                                         "replyTo" => "chorusadmin@example.com",
                                         "userId" => ["6732"])) { true }
      post :create, params
      response.should be_success
    end

    context 'when the message send fails' do
      before do
        mock(Kaggle::API).send_message(anything) {
          raise Kaggle::API::MessageFailed.new 'This is an arbitrary error message'
        }
      end

      it "presents an error json" do
        post :create, params
        response.code.should == '422'
      end
    end
  end
end