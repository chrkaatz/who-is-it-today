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
  $('span#what').text(localStorage.getItem('what') || 'Champion');
  let currentUserIndex = new Date().getDate() % users.length;

  userField.text(users[currentUserIndex]);
  setInterval(() => {
    currentUserIndex = new Date().getDate() % users.length;
    userField.text(users[currentUserIndex]);
  }, INTERVAL)

  updateDeputyList();

  function addUser(username) {
    users.push(username);
    localStorage.setItem('users', JSON.stringify(users));
    updateDeputyList();
  }

  function updateDeputyList() {
    $(userList).html(users.map(user => `<li>${user} <a id="removeUser" href="#delete" data-user="${user}"><i class="material-icons">clear</i></a></li>`));
    updateClickListeners();
  }

  function removeUser(username) {
    users = users.filter(user => {
      return user !== username;
    });
    localStorage.setItem('users', JSON.stringify(users));
    updateDeputyList();
  }

  $('a#manage-deputies').click((event) => {
    if($(userContainer).css('display') === 'none') {
      $(userContainer).show();
    } else {
      $(userContainer).hide();
    }
  });

  $('a#addDeputy').click((event) => {
    if ($(addUserBox).css('display') === 'none') {
        $(addUserBox).show();
    } else {
        $(addUserBox).hide();
    }
    $('button#AddUserBtn').click((event) => {
      if ($('input#name').value !== '') {
        addUser($('input#name')[0].value);
        $('input#name')[0].value = "";
      }
    });
    $('button#CancelDebutyBtn').click((event) => {
        $(addUserBox).hide();
        $('input#name')[0].value = "";
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
      localStorage.setItem('what', subject);
    }
  }

})(window.jQuery);
