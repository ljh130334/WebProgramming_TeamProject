// 난이도 설정 로직

$(document).on('click', '#difficulty-select .difficulty-img', function() {
    const difficulty = $(this).attr('alt'); // 'Easy', 'Normal', 'Hard'
    window.selectedDifficulty = difficulty;
    console.log('Selected difficulty:', window.selectedDifficulty);
    $('#difficulty-select').hide();
    $('#game').show();
});
