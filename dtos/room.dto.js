class RoomDto {
    id;
    topic;
    roomType;
    speakers;
    ownerId;

    constructor(room) {
        this.id = room._id;
        this.topic = room.topic;
        this.roomType = room.roomType;
        this.ownerId = room.ownerId;
        this.speakers = room.speakers;
    }
}
module.exports = RoomDto;