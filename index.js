
require("./site/index.html");
require("./site/style.css");

class analysis {

  constructor(){
    this.currency = {};
    this.content = document.getElementById("tbody");
    this.url = "ws://localhost:8011/stomp";
    this.udpateInterval = 3000;
    this.client = Stomp.client(this.url);
    this.initilizeConnection();
  }

  initilizeConnection(){
    this.client.connect({}, (resp)=>{
      this.subscribeMessage();
    }, function(error) {
      alert(error.headers.message);
    });
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
    var row = document.querySelector("#"+data.name+"-data");
      row.children[3].textContent=data.lastChangeBid;
      row.children[4].textContent=data.lastChangeAsk;
      this.generateSparkLine(data);
  }

  generateSparkLine(currencyItem){
    const el = document.getElementById(currencyItem.name);
    Sparkline.draw(el, [
      currencyItem.bestBid,
      (currencyItem.bestBid + currencyItem.bestAsk) / 2,
      currencyItem.bestBid
    ]);
  }
}

var init = new analysis();