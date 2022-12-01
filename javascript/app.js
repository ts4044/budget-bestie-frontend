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
  console.log("code =" + code);
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

window.onload = () => {
  var cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    if (document.getElementById("username_sidebar")) {
      document.getElementById("username_sidebar").innerHTML = cognitoUser["username"];
    }
  }

  /***** newly added *****/
  // range can be: "day", "week", "month"
  var range = "month";
  // returns a promise
  var stat = getDashboardStat();
  // .then to access the promise object, draw graph
  stat.then(res=>{
    // range can be "day", "week", "month", shall be input from onload
    graph_dashboard(res,range);
  });
}