(function($) {
  const INTERVAL = 60 * 60 * 1000;
  const doneTypingInterval = 2000;
  let typingTimer;
  let users = [];
  try {
    users = JSON.parse(localStorage.getItem('users')) || [];
  } catch(err) {}
  const userContainer = $('.container.management');
  const addUserBox = $('#addUserBox');
  const userList = $('ul#userlist');
  const userField = $('p#user');
  const exportLink = $('a#export');
  $('span#what').text(localStorage.getItem('what') || 'Champion');
  let currentUserIndex = new Date().getDate() % users.length;

  function getExportDataString() {
    return 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      what: localStorage.getItem('what') || 'Champion',
      users
    }));
  }

  function setWhat(what) {
    localStorage.setItem('what', what);
    $('span#what').text(what);
  }

  function handleFileSelect() {
    input = document.getElementById('fileinput');
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
      file = input.files[0];
      fr = new FileReader();
      fr.onload = function() {
        try {
          const imported = JSON.parse(fr.result);
          if (imported.hasOwnProperty('what') && imported.hasOwnProperty('users') && imported.users.length > 0) {
            setWhat(imported.what);
            users = imported.users;
            localStorage.setItem('users', JSON.stringify(users));
            updateUsersList();
          }
        } catch(err) {
          console.error(err);
        }
      }
      fr.readAsText(file);
    }
  }
  window.handleFileSelect = handleFileSelect;

  userField.text(users[currentUserIndex]);
  setInterval(() => {
    currentUserIndex = new Date().getDate() % users.length;
    userField.text(users[currentUserIndex]);
  }, INTERVAL)

  updateUsersList();

  function addUser(username) {
    users.push(username);
    localStorage.setItem('users', JSON.stringify(users));
    updateUsersList();
  }

  function updateUsersList() {
    currentUserIndex = new Date().getDate() % users.length;
    $(exportLink).attr('href', getExportDataString());
    $(exportLink).attr('download', `export_who-is-it-today.json`);
    $(userList).html(users.map(user => `<li>${user} <a id='removeUser' href='#delete' data-user='${user}'><i class='material-icons'>clear</i></a></li>`));
    userField.text(users[currentUserIndex]);
    updateClickListeners();
  }

  function removeUser(username) {
    users = users.filter(user => {
      return user !== username;
    });
    localStorage.setItem('users', JSON.stringify(users));
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
      if ($('input#name').value !== '') {
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
    $('a#removeUser').click(event => {
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

})(window.jQuery);
