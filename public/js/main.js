//Initial variable declarations
var currentRate,
    currentSubIndex,
    editSub,
    firstScriptTag,
    nextSub,
    player,
    prevSub,
    rateIndex,
    rates,
    re = /=(.+)/,
    startCaption,
    sub,
    subtitleChangeInterval,
    subtitles,
    tag,
    timeEnd,
    timeStart,
    urlValue,
    videoData,
    videoDuration,
    videoID = '';

//Standard YouTube player creation on ready
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '340',
    width: '560',
    videoId: videoID,
    playerVars: {
      'cc_load_policy': 1,
      'controls': 0
    },
    events: {
      'onReady': onPlayerReady,
    }
  });
}

//Call once Player ready
function onPlayerReady(event) {
  rates = player.getAvailablePlaybackRates();
  currentRate = player.getPlaybackRate();
  rateIndex = rates.indexOf(currentRate);
  subtitleChangeInterval = setInterval(subtitleRefresh, 100);
  console.log(player.getDuration());
  $.getJSON('/video/youtube' + videoID, function(data) {
    videoData = data;
    subtitles = videoData.captions;
    $('.search-bar').hide();
    $('.main-button').hide();
    $('.shortcuts').fadeIn();
    $('.video-main').show();
    $('#player').show();
    $('#current-player-time').show();
    $('#overlay').show();
    $('#subtitles').show();
    $('.sub-prev').show();
    $('.sub-edit').show();
    $('.sub-next').show();
    $('.prev-head').show();
    $('.edit-head').show();
    $('.next-head').show();
    event.target.playVideo();
  });

  $('.sub-edit').focus(function() {
    player.pauseVideo();
  });
}

function pauseVideo() {
  if (player.getPlayerState() === 1) {
    player.pauseVideo();
  }
  else {
    player.playVideo();
  }
}

function slowdownVideo() {
  if (rateIndex > 0) {
    player.setPlaybackRate(rates[rateIndex-1]);
    rateIndex -= 1;
  }
}

function speedupVideo() {
  if (rateIndex < rates.length -1) {
    player.setPlaybackRate(rates[rateIndex+1]);
    rateIndex += 1;
  }
}

function rewindVideo() {
  player.seekTo((player.getCurrentTime()-2), true);
  player.playVideo();
  console.log(player.getCurrentTime());
}

function forwardVideo() {
  player.seekTo((player.getCurrentTime()+2), true);
  player.playVideo();
  console.log(player.getCurrentTime());
}

// Mousetrap.bind('ctrl+1', pauseVideo);
Mousetrap.bind('ctrl+1', function(e) {
  pauseVideo();
  return false;
});

// Mousetrap.bind('ctrl+4', slowdownVideo);
Mousetrap.bind('ctrl+4', function(e) {
  slowdownVideo();
  return false;
});
// Mousetrap.bind('ctrl+5', speedupVideo);
Mousetrap.bind('ctrl+5', function(e) {
  speedupVideo();
  return false;
});
// Mousetrap.bind('ctrl+2', rewindVideo);
Mousetrap.bind('ctrl+2', function(e) {
  rewindVideo();
  return false;
});
// Mousetrap.bind('ctrl+3', forwardVideo);
Mousetrap.bind('ctrl+3', function(e) {
  forwardVideo();
  return false;
});
// Mousetrap.bind('ctrl+shift+s', saveCaption);
Mousetrap.bind('ctrl+shift+s', function(e) {
  saveCaption();
  return false;
});
// Mousetrap.bind('ctrl+shift+a', addCaption);
Mousetrap.bind('ctrl+shift+a', function(e) {
  addCaption();
  return false;
});
// Mousetrap.bind('ctrl+shift+d', deleteCaption);
Mousetrap.bind('ctrl+shift+d', function(e) {
  deleteCaption();
  return false;
});

function subtitleRefresh() {
  console.log(player.getCurrentTime());
  $('#player-time').text(parseFloat(player.getCurrentTime()).toFixed(2));

  if (player.getPlayerState() === 1) {
    if (player.getCurrentTime() > (subtitles[subtitles.length-1].start + subtitles[subtitles.length-1].dur)) {
      $('.sub-edit').val('');
      $('.edit-start').val('');
      $('.edit-end').val('');
      $('.sub-next').val('');
      $('.next-start').val('');
      $('.next-end').val('');
      $('.sub-prev').val(subtitles[subtitles.length-1].value);
      $('.prev-start').val(subtitles[subtitles.length-1].start);
      $('.prev-end').val(subtitles[subtitles.length-1].start + subtitles[subtitles.length-1].dur);
      $('#subtitles h3').text('');
      return false;
    }

    if (player.getCurrentTime() < subtitles[0].start) {
      $('.sub-edit').val('');
      $('.edit-start').val('');
      $('.edit-end').val('');
      $('.sub-next').val(subtitles[0].value);
      $('.next-start').val(subtitles[0].start);
      $('.next-end').val(subtitles[0].start + subtitles[0].dur);
      $('.sub-prev').val('');
      $('.prev-start').val('');
      $('.prev-end').val('');
      $('#subtitles h3').text('');
      return false;
    }
    for (sub in subtitles) {
      timeStart = subtitles[sub].start;
      timeEnd = subtitles[sub].start + subtitles[sub].dur;

      if (player.getCurrentTime() >= timeStart && player.getCurrentTime() <= timeEnd) {
        currentSubIndex = sub;
        editSub = subtitles[sub];
        prevSub = subtitles[parseInt(sub)-1];
        nextSub = subtitles[parseInt(sub)+1];
        console.log(currentSubIndex);
        if (nextSub && prevSub) {
          $('#subtitles h3').text(editSub.value);
          $('.sub-edit').val(editSub.value);
          $('.edit-start').val(editSub.start);
          $('.edit-end').val(editSub.start + editSub.dur);
          $('.sub-next').val(nextSub.value);
          $('.next-start').val(nextSub.start);
          $('.next-end').val(nextSub.start + nextSub.dur);
          $('.sub-prev').val(prevSub.value);
          $('.prev-start').val(prevSub.start);
          $('.prev-end').val(prevSub.start + prevSub.dur);
          return false;
        }
        else if (!prevSub && !nextSub) {
          $('#subtitles h3').text(editSub.value);
          $('.sub-edit').val(editSub.value);
          $('.edit-start').val(editSub.start);
          $('.edit-end').val(editSub.start + editSub.dur);
          $('.sub-next').val('');
          $('.next-start').val('');
          $('.next-end').val('');
          $('.sub-prev').val('');
          $('.prev-start').val('');
          $('.prev-end').val('');
          return false;
        }
        else if (!prevSub && nextSub) {
          $('#subtitles h3').text(editSub.value);
          $('.sub-edit').val(editSub.value);
          $('.edit-start').val(editSub.start);
          $('.edit-end').val(editSub.start + editSub.dur);
          $('.sub-next').val(nextSub.value);
          $('.next-start').val(nextSub.start);
          $('.next-end').val(nextSub.start + nextSub.dur);
          $('.sub-prev').val('');
          $('.prev-start').val('');
          $('.prev-end').val('');
          return false;
        }
        else {
          $('#subtitles h3').text(editSub.value);
          $('.sub-edit').val(editSub.value);
          $('.edit-start').val(editSub.start);
          $('.edit-end').val(editSub.start + editSub.dur);
          $('.sub-next').val('');
          $('.next-start').val('');
          $('.next-end').val('');
          $('.sub-prev').val(prevSub.value);
          $('.prev-start').val(prevSub.start);
          $('.prev-end').val(prevSub.start + prevSub.dur);
          return false;          
        }
      }
    }
  }
}

function deleteCaption() {
  videoData.captions.splice(currentSubIndex, 1);
  $.ajax({
    url: '/video/' + videoID,
    type: 'POST',
    data: JSON.stringify(videoData),
    contentType: 'application/json; charset=utf-8',
    dataType: 'json'
  });
  subtitles = videoData.captions;
  $('#subtitles h3').text('');
  $('.sub-edit').val('');
  $('.edit-start').val('');
  $('.edit-end').val('');
  rewindVideo();
  player.playVideo();
}

function addCaption() {
  if (player.getPlayerState() === 1) {
    pauseVideo();
  }
  if (currentSubIndex) {
    startCaption = 
    {
      'start': player.getCurrentTime(),
      'dur': 2.0,
      'value': 'Add caption text and change beginning and ending times',
      'extra_data': []
    };
    videoData.captions.splice(parseInt(currentSubIndex) + 1, 0, startCaption);
    currentSubIndex = parseInt(currentSubIndex) + 1;
    subtitles = videoData.captions;
    editSub = subtitles[currentSubIndex];
    prevSub = subtitles[parseInt(currentSubIndex)-1];
    nextSub = subtitles[parseInt(currentSubIndex)+1];
    $('#subtitles h3').text(editSub.value);
    $('.sub-edit').val(editSub.value);
    $('.edit-start').val(editSub.start);
    $('.edit-end').val(editSub.start + editSub.dur);
    $('.sub-next').val(nextSub.value);
    $('.next-start').val(nextSub.start);
    $('.next-end').val(nextSub.start + nextSub.dur);
    $('.sub-prev').val(prevSub.value);
    $('.prev-start').val(prevSub.start);
    $('.prev-end').val(prevSub.start + prevSub.dur);
  }
  else {
    currentSubIndex = videoData.captions.length >= 1 ? videoData.captions[videoData.captions.length] : 0;
    startCaption = 
    {
      'start': player.getCurrentTime(),
      'dur': 2.0,
      'value': 'Add caption text and change beginning and ending times', 
      'extra_data': []
    };
    videoData.captions.push(startCaption);
    subtitles = videoData.captions;
    console.log(subtitles);
    editSub = subtitles[currentSubIndex];
    console.log(editSub);
    console.log(editSub.value)
    $('#subtitles h3').text(editSub.value);
    $('.sub-edit').val(editSub.value);
    $('.edit-start').val(editSub.start);
    $('.edit-end').val(editSub.start + editSub.dur);
  }
}

function saveCaption() {
  console.log(currentSubIndex);
  videoData.captions[currentSubIndex].value = $('.sub-edit').val();
  videoData.captions[currentSubIndex].start = parseFloat($('.edit-start').val());
  videoData.captions[currentSubIndex].dur = parseFloat($('.edit-end').val()) - parseFloat($('.edit-start').val());
  if (currentSubIndex > 0) {
    videoData.captions[parseInt(currentSubIndex)-1].start = parseFloat($('.prev-start').val());
    videoData.captions[parseInt(currentSubIndex)-1].dur = parseFloat($('.prev-end').val()) - parseFloat($('.prev-start').val());    
  }
  if (currentSubIndex < videoData.captions.length-1) {
    videoData.captions[parseInt(currentSubIndex)+1].start = parseFloat($('.next-start').val());
    videoData.captions[parseInt(currentSubIndex)+1].dur = parseFloat($('.next-end').val()) - parseFloat($('.next-start').val());    
  }
  subtitles = videoData.captions;

  $.ajax({
    url: '/video/' + videoID,
    type: 'POST',
    data: JSON.stringify(videoData),
    contentType: 'application/json; charset=utf-8',
    dataType: 'json'
  });
  rewindVideo();
  player.playVideo();
}

$(document).ready(function() {
  $(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })
  document.getElementById('link-value').addEventListener('keypress', function(event) {
          if (event.keyCode == 13) {
            document.getElementById('the-button').click();
          }
  });

  $('#the-button').click(function() {
    urlValue = $('#link-value').val();
    tag = document.createElement('script');
    firstScriptTag = document.getElementsByTagName('script')[0];
    
    if (urlValue.length > 11) {
      videoID = urlValue.match(re)[1].trim();
    }
    else {
      videoID = urlValue.trim();
    }

    tag.src = "https://www.youtube.com/iframe_api";
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  });

  $(window).scroll(
    {
        previousTop: 0
    }, 
    function () {
    var currentTop = $(window).scrollTop();
    if (currentTop < this.previousTop) {
        $(".navbar-fixed-top").fadeIn("slow");
    } else {
        $(".navbar-fixed-top").fadeOut("slow");
    }
    this.previousTop = currentTop;
  });

  $( "#transcript-upload").change(function() {
    console.log("photo file has been chosen")
  });
});
//Test Videos
//https://www.youtube.com/watch?v=MftOONlDQac
//https://www.youtube.com/watch?v=fPloDzu_wcI
//https://www.youtube.com/watch?v=poL7l-Uk3I8
//https://www.youtube.com/watch?v=hjfogiltO80
