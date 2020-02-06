
require("./site/index.html");
require("./site/style.css");

class analysis {

  constructor(){
    this.currency = {};
    this.sparkLine = {};
    this.content = document.getElementById("tbody");
    this.url = "ws://localhost:8011/stomp";
    this.udpateInterval = 30000; //Update sparkline after 30 seconds.
    this.client = Stomp.client(this.url);
    this.initilizeConnection();
  }

  initilizeConnection(){
    this.client.connect({}, (resp)=>{
      this.subscribeMessage();
      this.addEventListeners();
    }, function(error) {
      alert(error.headers.message);
    });
  }

  addEventListeners(){
    document.querySelector("#changeHandler").addEventListener("change", (ev)=>{this.sortTable(ev.target.value)});
  }

  
  subscribeMessage(){
    this.client.subscribe("/fx/prices", (message)=>{
      if (message.body) {
        const data = JSON.parse(message.body);
        if(!this.currency[data.name]){
          this.currency[data.name] = data;
          this.createRow(this.currency[data.name]);
        } else {
          setTimeout(()=>{
          this.updateRow(data);
        },this.udpateInterval);
        }
      } else {
        alert("got empty message");
      }
    }, { id: "data" });
  }

  createRow(item){
    let rowTemplate = [];
        rowTemplate.push("<tr id="+item.name+"-data>");
        rowTemplate.push("<td>" + item.name + "</td>");
        rowTemplate.push("<td>" + item.bestBid + "</td>");
        rowTemplate.push("<td>" + item.bestAsk + "</td>");
        rowTemplate.push("<td>" + item.lastChangeBid + "</td>");
        rowTemplate.push("<td>" + item.lastChangeAsk + "</td>");
        rowTemplate.push("<td><span id=" + item.name + ">0</span></td>");
        rowTemplate.push("</tr>");
    this.content.innerHTML += rowTemplate.join("");
   
    Object.values(this.currency).map(item=>{
      this.generateSparkLine(item);
    })
  }

  updateRow(data){
      this.generateSparkLine(data);
  }

  generateSparkLine(currencyItem){
   let el = document.getElementById(currencyItem.name);
   if(!this.sparkLine[currencyItem.name]){
    this.sparkLine[currencyItem.name] = {};
    this.sparkLine[currencyItem.name]["values"] = []; 
    this.sparkLine[currencyItem.name]["spark"] = new Sparkline(el)
   }

   const d = (currencyItem.bestBid + currencyItem.bestAsk) / 2;
   this.sparkLine[currencyItem.name]["values"].push(d);
   Sparkline.draw(el, this.sparkLine[currencyItem.name]["values"]);
  }

  sortTable(n) {
    //console.log(even)
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("myTable2");
    switching = true;
    // Set the sorting direction to ascending:
    dir = "asc";
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
      // Start by saying: no switching is done:
      switching = false;
      rows = table.rows;
      /* Loop through all table rows (except the
      first, which contains table headers): */
      for (i = 1; i < (rows.length - 1); i++) {
        // Start by saying there should be no switching:
        shouldSwitch = false;
        /* Get the two elements you want to compare,
        one from current row and one from the next: */
        x = rows[i].getElementsByTagName("TD")[n];
        y = rows[i + 1].getElementsByTagName("TD")[n];
        /* Check if the two rows should switch place,
        based on the direction, asc or desc: */
        if (dir == "asc") {
          if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        } else if (dir == "desc") {
          if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        /* If a switch has been marked, make the switch
        and mark that a switch has been done: */
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        // Each time a switch is done, increase this count by 1:
        switchcount ++;
      } else {
        /* If no switching has been done AND the direction is "asc",
        set the direction to "desc" and run the while loop again. */
        if (switchcount == 0 && dir == "asc") {
          dir = "desc";
          switching = true;
        }
      }
    }
  }
}

var init = new analysis();