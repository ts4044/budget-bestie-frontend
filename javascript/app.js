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
  // added
    // range is temp var for testing
  var range = "month";
  var stat = getDashboardStat(range);
  console.log(stat);
}

//temp space... putting the api call here
async function getDashboardStat(range) {
  var cognitoUser = userPool.getCurrentUser();
  var apigClient = apigClientFactory.newClient();

  var body= {}
  var params = {
      'Content-Type': 'application/json',
      'x-api-key': 'uKo9wX1Uzb5JvLDsjl6ui7Gy8l4qFLe9Pl5SMigg',
      username: cognitoUser["username"],
      Accept: '*/*',
  };
  console.log(params);
  var additionalParams = {};
  console.log("getDashboardStat called");
  
  return new Promise(
    function (resolve, reject){
      var result = apigClient.dashboardStatsGet(params, body, additionalParams) 
        .then(
          function (res){
            if (res.status == 200) {
                console.log(res.data);
                // range can be "day", "week", "month", shall be input from onload
                graph_dashboard(res.data,range);
            } else {
                alert("unsuccessful dashboardStatGet call");
            }
          },
          (error)=>{
            reject(error);
          }
        )
      resolve(result);
      return result;
  });
};

