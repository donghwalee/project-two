// script for the slideDown

$('.hide-at-start').hide();
$('.expand').on("click", function (e) {
  $('.hide-at-start').slideDown(500);
});
$('.collapse').on("click", function (e) {
  $('.hide-at-start').slideUp(500);
});
