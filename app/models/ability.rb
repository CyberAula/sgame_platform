class Ability
  include CanCan::Ability

  def initialize(user)
    user ||= User.new # guest user (not logged in)

    #Users
    can :read, User
    can :manage, User do |u|
      u.id === user.id
    end

    #Presentations, Pdfps and Documents
    can :create, [Presentation, Pdfp, Document, Scormfile]
    can :read, Presentation do |p|
      p.draft === false
    end
    can :read, [Pdfp, Document, Scormfile]
    can :manage, [Presentation, Pdfp, Document, Scormfile] do |p|
      p.owner_id === user.id
    end

  end
end
