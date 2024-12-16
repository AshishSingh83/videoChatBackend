const ACTIONS = {
    JOIN: 'join',
    LEAVE: 'leave',
    ADD_PEER: 'add-peer',
    REMOVE_PEER: 'remove-peer',
    RELAY_ICE: 'relay-ice',
    RELAY_SDP: 'relay-sdp',
    SESSION_DESCRIPTION: 'session-description',
    ICE_CANDIDATE: 'ice-candidate',
    MUTE: 'mute',
    UNMUTE: 'unmute',
    MUTE_INFO: 'mute-info',
    VIDEO_ON:"video_on",
    VIDEO_OFF:"video_off",
    START_SCREEN_SHARE:"start_screen_share",
    STOP_SCREEN_SHARE:"stop_screen_share",
};
module.exports = ACTIONS;