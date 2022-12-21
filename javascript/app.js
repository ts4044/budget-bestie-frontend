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
  location.href = "spending.html";
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

  var username = cognitoUser['username'];
  // var username = "tejassateesh";
  var params = {
    username: username,
    id: null
  };

  apigClient.receiptsListGet(params, params, params).then(function (res) {
    var insertInto = document.getElementById("receipts");

    var receipts = res['data'];
    console.log(receipts);

    for (var key in receipts) {
      var receipt = receipts[key];

      insertInto.innerHTML +=
        '<div class="col">'
        + '<div class="card h-100">'
        + '<div class="card-header">Receipt #' + key + '</div>'
        + '<div class="card-img-top"> <a href="' + receipt['s3_link']
        + '"><img src="' + receipt['s3_link']
        + '" style="max-width: 100%; max-height: 200px; min-height: 100px; object-fit: scale-down; '
        + 'display: block; margin: auto"></a></div>'
        + '<div class="card-body">'
        + '<h5 class="card-title">' + receipt["title"] + '</h5>'
        + '<p class="card-text">' + receipt["description"] + '</p>'
        + '</div>'
        + '<div class="card-footer border-0">'
        + '<div class="container">'
        + '<div class="row">'
        + '<div class="col-6" style="text-align: left;">' + receipt['date'] + '</div>'
        + '<div class="col-6" style="text-align: right;">$' + receipt['total'] + '</div>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>';
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


  var path = window.location.pathname;
  var page = path.split("/").pop();

  /***** adding dashboard graph *****/
  if (page === 'dashboard.html') {
    // range can be: "day", "week", "month",default "month" for dashboard
    var range = "month";

    var stat = getDashboardStat();
    stat.then(res => {
      // range can be "day", "week", "month"
      graph_dashboard(res, range);
      graph_dashboard_activity(res);
      fill_dashboard_summary(res);
    });
    // for Recent Receipts part
    var recent_receipts = getReceiptsDashboard();
    recent_receipts.then(res => {
      fill_recent_receipts(res);
    });
  }
  /*** for Receipts page ***/
  else if (page === 'receipts.html') {
    loadReceipts();
  }
  /*** for Spending page ***/
  else if (page === 'spending.html') {
    // default showing "monthly" & "All" when loaded
    var period = 'monthly'
    var category = 'All'
    var spendingStat = getSpendingStat(period, category);
    spendingStat.then(res => {
      graph_SpendingStat(res);
    });
  }
}