function display_spending_timeframe(period){
  // update #spending_timeframe first
  document.getElementById('spending_timeframe').innerHTML = period;
  var category = document.querySelector('#spending_category').innerHTML;
  
  // active the selected timeframe

  // destory existing graph before doing a new one
  let chartStatus = Chart.getChart("spending_chart"); // <canvas id>
  if (chartStatus != undefined) {
    chartStatus.destroy();
  }
 
  // calling API (which will update the graph)
  var spendingStat = getSpendingStat(period,category);
  spendingStat.then(res=>{
    graph_SpendingStat(res);
  });
}
function display_spending_category(category,onClickId){
  // update #spending_timeframe first
  document.getElementById('spending_category').innerHTML = category;
  var period = document.querySelector('#spending_timeframe').innerHTML;

  // active the selected category
  document.querySelectorAll('.active').forEach(item=>{item.classList.remove("active")});
  let item = document.getElementById(onClickId);
  item.classList.add("active");

  // destory existing graph before doing a new one
  let chartStatus = Chart.getChart("spending_chart"); // <canvas id>
  if (chartStatus != undefined) {
    chartStatus.destroy();
  }

  // calling API (which will update the graph)
  var spendingStat = getSpendingStat(period,category);
  spendingStat.then(res=>{
    graph_SpendingStat(res);
  }); 
}

async function getSpendingStat(period, category) {
  var cognitoUser = userPool.getCurrentUser();
  var apigClient = apigClientFactory.newClient();

  var username = cognitoUser['username'];
  var params = {
    username: username,
    period: period,
    category: category
  };

  var apiCall = await apigClient.spendingStatsGet(params, params, params)
    .then(function (res) {
      var spendings = res['data'];
      console.log(spendings);
      return spendings;
  })
  return apiCall;
};

function graph_SpendingStat(result){
  console.log("Graphing spending called");
  console.log(result);
  const ctx = document.getElementById('spending_chart');
  var range = result.period;
  var category = result.category;

  // day, week, month switch
  var type, data_pt_desc="Spent", data_point, date_start, date_end;
  if (range == "daily"){
    type = 'bar';
    date_start = result.day;
    date_end = result.day;
    data_point = [result.period_stat];  
  }else if(range =="weekly"){
    type = 'line';
    date_start = Math.max((result.day -7 +1),1); // +1 to inlcude current/today
    date_end = result.day;
    if (date_end<3){type="bar"}; //just looks better when having few datapoints
    data_point = result.period_stat;  
  }else if(range =="monthly"){
    type = 'line';
    date_start = 1; // month always start with 1st
    date_end = result.day;
    if (date_end<3){type="bar"}; //just looks better when having few datapoints
    data_point = result.period_stat;  
  }

  // creating column labels (day_range)
  var day_range = [];
  for(var i =date_start; i<=date_end;i++){day_range.push(i)};
  console.log(day_range);
  console.log(data_point);
  
  var newChart = new Chart(ctx, {
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

  var period = range;
  period = period.charAt(0).toUpperCase()+period.slice(1);
  document.querySelector("#spending_title").innerHTML = `${period} ${category} Spending`;

}

// function fill_spending(result){
//   var category = result.category;
//   var period = result.period;
//   // formatting
//   period = period.charAt(0).toUpperCase()+period.slice(1);
    
//   document.querySelector("#spending_title").innerHTML = `${period} ${category} Spending`;
// }



//-------------------------------------------------------------------------
async function getReceiptsDashboard() {
  var cognitoUser = userPool.getCurrentUser();
  var apigClient = apigClientFactory.newClient();

  var username = cognitoUser['username'];
  var params = {
    username: username
  };

  var apiCall = await apigClient.receiptsListGet(params, params, params)
    .then(function (res) {
      var receipts = res['data'];
      // console.log(receipts);
      return receipts;
  })
  return apiCall;
    
};

function fill_recent_receipts(result){
  console.log(result);
  var res_size = Object.keys(result).length;
  var count = 0;
  for (i=res_size; i >= 0;i--){
    if(++count > Math.min(res_size,4)) break;
    var title = result[i].title;
    var total = result[i].total;
    // console.log(`${i}: ${title} ${total}`);

    let recepitTemplate =
      `
      <div class="d-flex flex-row mb-2">
        <div class="col-1">
          <i class="fas fa-receipt me-2" style="color: #0B6E4F"></i>
        </div>
        <div class="col-9">
          <h5 style="font-size: medium">${title}</h5>
        </div>
        <div class="col-2">
          <h5 style="font-size: medium">$${total}</h5>
        </div>
      </div>
      `
    // Concat the card here:
    document.getElementById('d_recentreceipts').innerHTML += recepitTemplate;
  }
}
//-------------------------------------------------------------------------------

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
    var day_range = ["Sun","Mon","Tue","Wed","Thur","Fri", "Sat"];
    // for(var i =date_start; i<=date_end;i++){day_range.push(i)};
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
      
    document.querySelector("#d_budget").innerHTML = budget;
    document.querySelector("#d_receipts").innerHTML = receiptsSaved;
    document.querySelector("#d_categories").innerHTML = numCategories;
    document.querySelector("#d_spendtoday").innerHTML = todaySpend;
    document.querySelector("#d_spendweek").innerHTML = weekSpend;
    document.querySelector("#d_spendmonth").innerHTML = monthSpend;
  }

