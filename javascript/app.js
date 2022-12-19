var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

const navToIndex = () => {
  location.href = "index.html";
};

const navTosignUp = () => {
  location.href = "signup.html";
};

const navToDashboard = () => {
  location.href = "dashboard.html";
};

const navToReceipts = () => {
  location.href = "receipts.html";
};

const navToSpendings = () => {
  location.href = "dashboard.html";
};

const navTosignIn = () => {
  var cognitoUser = userPool.getCurrentUser();
  if (cognitoUser !== null) {
    location.href = "dashboard.html";
  } else {
    location.href = "signin.html";
  }
};

const signUp = () => {
  event.preventDefault();
  const username = document.querySelector("#username").value;
  const emailadd = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

  var email = new AmazonCognitoIdentity.CognitoUserAttribute({
    Name: "email",
    Value: emailadd,
  });

  userPool.signUp(username, password, [email], null, function (err, result) {
    if (err) {
      alert(err);
    } else {
      location.href = "confirm.html#" + username;
    }
  });
};

const confirmCode = () => {
  event.preventDefault();
  const username = location.hash.substring(1);
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
    Username: username,
    Pool: userPool,
  });
  const code = document.querySelector("#confirm").value;

  cognitoUser.confirmRegistration(code, true, function (err, results) {
    if (err) {
      alert(err);
    } else {
      location.href = "signin.html";
    }
  });
};

const signIn = () => {
  event.preventDefault();
  const username = document.querySelector("#username").value;
  const password = document.querySelector("#password").value;

  let authenticationData = {
    Username: username,
    Password: password,
  };

  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
    authenticationData
  );
  var userData = {
    Username: username,
    Pool: userPool,
  };

  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function () {
      location.href = "dashboard.html";
    },
    onFailure: function (err) {
      alert(JSON.stringify(err));
    },
  });
};

const signOut = () => {
  event.preventDefault();
  var cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
    location.href = "index.html";
  }
};

const loadReceipts = () => {
  var cognitoUser = userPool.getCurrentUser();
  var apigClient = apigClientFactory.newClient();

  // var username = cognitoUser['username'];
  var username = "tejassateesh";
  var params = {
    username: username
  };

  apigClient.receiptsListGet(params, params, params).then(function (res) {
    var insertInto = document.getElementById("receipts");

    var receipts = res['data'];

    for (var key in receipts) {
      var receipt = receipts[key];

      insertInto.innerHTML +=
        '<div class="col">'
        + '<div class="card h-100">'
        + '<div class="card-header bg-transparent">Receipt #' + key + '</div>'
        + '<div class="card-img-top" id=receiptimg' + key + '> </div>'
        + '<div class="card-body">'
        + '<h5 class="card-title">' + receipt["title"] + '</h5>'
        + '<p class="card-text">' + receipt["description"] + '</p>'
        + '</div>'
        + '<div class="card-footer border-0 bg-transparent">'
        + '<div class="text-start">' + receipt['date'] + '</div>'
        + '<div class="text-end">$' + receipt['total'] + '</div>'
        + '</div>'
        + '</div>'
        + '</div>';

      // Get Image data
      var request = new XMLHttpRequest();
      request.open('GET', receipt['s3_link'], true);
      request.responseType = 'blob';
      let i = key;
      request.onload = function () {
        var newDiv = document.getElementById("receiptimg" + i);
        var newimg = document.createElement("img");
        var reader = new FileReader();
        reader.onload = function (e) {
          newimg.src = 'data:image/*;base64, ' + (e.target.result);
        };
        reader.readAsText(this.response, 'base64');
        newDiv.appendChild(newimg);
      }
      request.send();
    }
  });
}

window.onload = () => {
  var cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    if (document.getElementById("username_sidebar")) {
      document.getElementById("username_sidebar").innerHTML = cognitoUser["username"];
    }
  }
  loadReceipts();
}

