class MembersController < ApplicationController
  def index
    workspace = Workspace.find(params[:workspace_id])
    authorize! :show, workspace

    present paginate WorkspaceAccess.members_for(current_user, workspace)
  end

  def create
    workspace = Workspace.find(params[:workspace_id])
    authorize! :owner, workspace

    workspace_current_members = workspace.members.map(&:id)
    workspace.update_attributes!(:member_ids => params[:member_ids], :has_added_member => true)
    workspace.solr_reindex_later

    create_events(workspace, workspace_current_members, params[:member_ids])
    present workspace.reload.members
  end

  private

  def create_events(workspace, workspace_current_members, member_ids)
    new_members = member_ids.map(&:to_i) - workspace_current_members
    unless new_members.empty?
      member = User.find(new_members.first)
      num_added = new_members.count
      member_added_event = Events::MembersAdded.by(current_user).add(:workspace => workspace, :member => member, :num_added => num_added)
      new_members.each do |new_member_id|
        Notification.create!(:recipient_id => new_member_id.to_i, :event_id => member_added_event.id)
      end
    end
  end
end
