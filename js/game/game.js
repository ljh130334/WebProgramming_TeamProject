// 게임 로직

console.log('game.js loaded');

// Global variable for game mode
window.game_mode = null;

// Black/White selection logic
$(document).on('click', '.blackwhite-half.blackwhite-left', function() {
    console.log('clicked left');
    window.game_mode = 'black';
    console.log('game_mode', window.game_mode);
    $('#black-white').hide();
    $('#tool-select').show();
});
$(document).on('click', '.blackwhite-half.blackwhite-right', function() {
    console.log('clicked right');
    window.game_mode = 'white';
    console.log('game_mode', window.game_mode);
    $('#black-white').hide();
    $('#tool-select').show();
});
