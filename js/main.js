'use strict';

(function($) {
  const INTERVAL = 60 * 60 * 1000;
  const doneTypingInterval = 2000;
  let typingTimer;
  let application = {
    what: localStorage.getItem('what') || 'Champion',
    users: [],
    url: location.href,
    colors: {
      primary: localStorage.getItem('primaryColor') || '#f39c12',
      secondary: localStorage.getItem('secondaryColor') || '#9b59b6'
    },
    showBackup: localStorage.getItem('showBackup') === 'true' || false
  };
  try {
    application.users = JSON.parse(localStorage.getItem('users')) || ['Tintin', 'Mickey'];
  } catch(err) {}
  const userContainer = $('.container.management');
  const addUserBox = $('#addUserBox');
  const userList = $('div#userlist');
  const userField = $('p#user');
  const exportLink = $('a#export');
  const primaryColorPicker = $('input#primary-color-picker');
  const secondaryColorPicker = $('input#secondary-color-picker');
  const backupToggle = $('input#backupInput');
  const backupField = $('p#backup');
  const backupFieldSpan = $('p#backup #backupUser');
  backupToggle.prop("checked", application.showBackup);
  toggleBackup(application.showBackup);
  $('span#what').text(application.what);
  let currentUserIndex = new Date().getDate() % application.users.length;

  function toggleBackup(show) {
    application.showBackup = show;
    localStorage.setItem('showBackup', show);
    show === true ? backupField.removeClass('hidden') : backupField.addClass('hidden');
  }

  function setWhat(what) {
    localStorage.setItem('what', what);
    application.what = what;
    $('span#what').text(what);
  }

  function updateColors(type, color) {
    $(`.${type}`).each(function (index, item) {
      $(item).css('color', color);
    });
  }

  function setColors() {
    for (let colorType in application.colors) {
      updateColors(colorType, application.colors[colorType]);
      localStorage.setItem(`${colorType}Color`, application.colors[colorType]);
    }
    primaryColorPicker[0].value = application.colors.primary;
    secondaryColorPicker[0].value = application.colors.secondary;
  }

  function watchPrimaryColorChange(type, event) {
    application.colors[type] = event.target.value;
    localStorage.setItem(`${type}Color`, event.target.value);
    updateColors(type, event.target.value);
  }

  function getExportDataString() {
    return 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(application));
  }

  function handleFileSelect() {
    const input = document.getElementById('fileinput');
    if (!input) {
      alert("Um, couldn't find the fileinput element.");
    }
    else if (!input.files) {
      alert("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
      alert("Please select a file before clicking 'Load'");
    }
    else {
      const file = input.files[0];
      const fr = new FileReader();
      fr.onload = function() {
        try {
          const imported = JSON.parse(fr.result);
          if (imported.hasOwnProperty('what') && imported.hasOwnProperty('users') && imported.users.length > 0) {
            application = imported;
            setWhat(imported.what);
            localStorage.setItem('users', JSON.stringify(application.users));
            updateUsersList();
            toggleBackup(application.showBackup);
            setColors();
          }
        } catch(err) {
          console.error(err);
        }
      }
      fr.readAsText(file);
    }
  }
  window.handleFileSelect = handleFileSelect;

  userField.text(application.users[currentUserIndex]);
  setInterval(() => {
    currentUserIndex = new Date().getDate() % application.users.length;
    userField.text(application.users[currentUserIndex]);
    backupFieldSpan.text(application.users[currentUserIndex + 1] || application.users[0]);
  }, INTERVAL)

  updateUsersList();

  function addUser(username) {
    application.users.push(username);
    localStorage.setItem('users', JSON.stringify(application.users));
    updateUsersList();
  }

  function updateUsersList() {
    currentUserIndex = new Date().getDate() % application.users.length;
    $(exportLink).attr('href', getExportDataString());
    $(exportLink).attr('download', `export_who-is-it-today.json`);
    $(userList).html(application.users.map(user => `
      <span class="mdl-chip mdl-chip--deletable">
          <span class="mdl-chip__text">${user}</span>
          <button type="button" class="mdl-chip__action" id='removeUser' data-user='${user}'>
              <i class="material-icons">cancel</i>
          </button>
      </span>
    `));
    userField.text(application.users[currentUserIndex]);
    backupFieldSpan.text(application.users[currentUserIndex + 1] || application.users[0]);
    updateClickListeners();
  }

  function removeUser(username) {
    application.users = application.users.filter(user => {
      return user !== username;
    });
    localStorage.setItem('users', JSON.stringify(application.users));
    updateUsersList();
  }

  $('a#manage-deputies').click((event) => {
    if($(userContainer).css('display') === 'none') {
      $(userContainer).show();
    } else {
      $(userContainer).hide();
    }
  });

  $('a#addUser').click((event) => {
    if ($(addUserBox).css('display') === 'none') {
        $(addUserBox).show();
    } else {
        $(addUserBox).hide();
    }
    $('button#AddUserBtn').click((event) => {
      if ($('input#name')[0].value !== '' && $('input#name')[0].value.length > 0) {
        addUser($('input#name')[0].value);
        $('input#name')[0].value = '';
      }
    });
    $('#addUserBox button.cancel').click((event) => {
        $(addUserBox).hide();
        $('input#name')[0].value = '';
    });
  });

  function updateClickListeners(){
    $('button#removeUser').click(event => {
        removeUser($(event.currentTarget).data().user);
    });
  }

  $('body').on('focus', '[contenteditable]', function () {
    var $this = $(this);
    $this.data('before', $this.html());
    return $this;
  }).on('blur keyup paste input', '[contenteditable]', function () {
    var $this = $(this);
    if ($this.data('before') !== $this.html()) {
      $this.data('before', $this.html());
      $this.trigger('change');
    }
    return $this;
  });

  $('span#what').on('change', event => {
    clearTimeout(typingTimer);
    if ($($(event.target)).html()) {
      typingTimer = setTimeout(updateSubject, doneTypingInterval);
    }
  });

  function updateSubject() {
    const subject = $('span#what').html();
    if(subject != '') {
      setWhat(subject);
    }
  }

  setColors();

  primaryColorPicker.on('change', (event) => {
    watchPrimaryColorChange('primary', event);
  });
  secondaryColorPicker.on('change', (event) => {
    watchPrimaryColorChange('secondary', event);
  });

  backupToggle.on('change', (event) => {
    toggleBackup(event.target.checked);
  });

})(window.jQuery);
