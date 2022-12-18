
async function getDashboardStat() {
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

  var apiCall = await apigClient.dashboardStatsGet(params, body, additionalParams) 
    .then(function(res) {
      if(res.status == 200){
        console.log("getDashboardStat: ");
        console.log(res.data);
        // return only the meat of the response: data
        return res.data;
      }else{
        alert("unsuccessful dashboardStatGet call");
      }}
    );
  return apiCall;  
};

function graph_dashboard(result,range){
    console.log("Graphing func called");
    console.log(result);
    const ctx = document.getElementById('dashboard_chart');
  
    // day, week, month switch
    var type, data_pt_desc="Spent", data_point, date_start, date_end;
    if (range == "day"){
      // data_pt_desc = "Today Spending";
      type = 'bar';
      date_start = result.day; // month always start with 1st
      date_end = result.day;
      data_point = result.total_today;  
    }else if(range =="week"){
      // data_pt_desc = "Weekly Spending";
      type = 'line';
      date_start = Math.max((result.day -7 +1),1); // +1 to inlcude current/today
      date_end = result.day;
      if (date_end<3){type="bar"}; //just looks better when having few datapoints
      data_point = result.total_this_week_daily;  
    }else if(range =="month"){
      // data_pt_desc = "Monthly Spending";
      type = 'line';
      date_start = 1; // month always start with 1st
      date_end = result.day;
      if (date_end<3){type="bar"}; //just looks better when having few datapoints
      data_point = result.total_this_month_daily;  
    }
  
    // creating column labels (day_range)
    var day_range = [];
    for(var i =date_start; i<=date_end;i++){day_range.push(i)};
    // console.log(data_point);
  
    new Chart(ctx, {
      type: type,
      data: {
        labels: day_range,
        datasets: [{
          label: data_pt_desc,
          borderColor: '#0B6E4F',
          borderWidth: 2,
          data: data_point
        }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    }); 
  }

  function graph_dashboard_activity(result){
    const ctx = document.getElementById('dashboard_activity');
  
    // day, week, month switch
    var type, data_pt_desc="Activity", data_point, date_start, date_end;
      // data_pt_desc = "Weekly Spending";
      type = 'bar';
      date_start = Math.max((result.day -7 +1),1); // +1 to inlcude current/today
      date_end = result.day;
      data_point = result.total_this_week_daily;  
  
    // creating column labels (day_range)
    var day_range = [];
    for(var i =date_start; i<=date_end;i++){day_range.push(i)};
    // console.log(day_range);
  
    new Chart(ctx, {
      type: type,
      data: {
        labels: day_range,
        datasets: [{
          label: data_pt_desc,
          borderColor: '#0B6E4F',
          borderWidth: 2,
          data: data_point
        }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  function fill_dashboard_summary(result){
    var budget = result.budget_amt;
    var receiptsSaved = result.num_receipts;
    var numCategories = result.num_categories;
    var todaySpend = result.total_today;
    var weekSpend = result.total_this_week;
    var monthSpend = result.total_this_month;
    console.log("summary: ", budget, receiptsSaved, numCategories,todaySpend, weekSpend, monthSpend );

    if (budget != "N/A"){
      budget = budget - monthSpend;
    }
      

  }
