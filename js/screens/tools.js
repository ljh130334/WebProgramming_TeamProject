// 조리도구 설정 로직

$(document).on('click', '#tool-select .tool', function() {
  if ($(this).hasClass('disabled')) return;
  // Get tool name from data-tool attribute
  const toolName = $(this).data('tool');
  window.selectedTool = toolName;
  // Hide tool-select, show game
  $('#tool-select').hide();
  $('#difficulty-select').show();
});
