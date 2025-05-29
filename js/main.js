// 메인 스크립트 (화면 전환, 초기화)
$(document).ready(function() {
    const $mainScreen = $('#main');
    const $gameScreen = $('#game');
    const $startGameBtn = $('#start-game-btn');

    $startGameBtn.on('click', function() {
        $mainScreen.hide();
        $gameScreen.show();
    });

    // Sound control bar logic
    const $optionsBtn = $('#options-btn');
    const $soundBar = $('#sound-control-bar');
    const $mainBgm = $('#main-bgm');
    const $mainVolume = $('#main-volume-range');

    // Initialize audio with 50% volume
    const initialVolume = 0.5; // 50% volume
    $mainBgm[0].volume = initialVolume;
    $mainVolume.val(initialVolume * 100); // Convert to percentage for the slider (0-100)

    $optionsBtn.on('click', function() {
        $soundBar.toggle(); // Show/hide the sound bar
    });

    // Volume slider logic
    $mainVolume.on('input', function() {
        const volume = $mainVolume.val() / 100;
        $mainBgm[0].volume = volume;
        console.log('Volume set to:', Math.round(volume * 100) + '%');
    });

    // Enable music on any user interaction
    function tryPlayMusic() {
        console.log('Attempting to play music...');
        $mainBgm[0].play()
            .then(() => {
                console.log('Music started playing successfully');
                // Remove the event listeners once music starts playing
                $(window).off('mousemove click keydown', tryPlayMusic);
            })
            .catch((error) => {
                // Only log errors if they're not related to user interaction
                if (!error.message.includes('user didn\'t interact')) {
                    console.error('Failed to play music:', error);
                }
            });
    }

    // Try to play music on any user interaction
    $(window).on('mousemove click keydown', tryPlayMusic);
});
