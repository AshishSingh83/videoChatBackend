class userDto {
  _id;
  phone;
  activated;
  name;
  avatar;

  constructor(user) {
    this.id = user._id;
    this.phone = user.phone;
    this.activated = user.activated;
    this.name = user.name;
    this.avatar = user.avatar;
  }
}

module.exports = userDto;
