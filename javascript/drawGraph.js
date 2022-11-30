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
      data_point = result.total_this_week_daily;  
    }else if(range =="month"){
      // data_pt_desc = "Monthly Spending";
      type = 'line';
      date_start = 1; // month always start with 1st
      date_end = result.day;
      data_point = result.total_this_month_daily;  
    }
  
    // creating column labels (day_range)
    var day_range = [];
    for(var i =date_start; i<=date_end;i++){day_range.push(i)};
  
    new Chart(ctx, {
      type: type,
      data: {
        labels: day_range,
        datasets: [{
          label: data_pt_desc,
          borderColor: '#0B6E4F',
          borderWidth: 2,
          data: data_point
        }]
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