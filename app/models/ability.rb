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
    can :create, [Presentation, Pdfp, Document]
    can :read, Presentation do |p|
      p.draft === false
    end
    can :read, [Pdfp, Document]
    can :manage, [Presentation, Pdfp, Document] do |p|
      p.owner_id === user.id
    end

  end
end
