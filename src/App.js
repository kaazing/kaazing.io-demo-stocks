// App.js
import React, { Component } from 'react';
import './App.css';

class Stocks extends Component {
  constructor(props) {
    super(props);
    
    this.state = {stocks: new Map()};
    
    // Connect to Kaazing.io SSE
    let eventSource = new EventSource("https://a8uofb8l.streaming.kaazing.io/topic/sandbox.stocks");

    eventSource.onmessage = (e) => {
        this.updateStock(JSON.parse(e.data));
    }
  }

  updateStock = (stock) => {
    var stocksMap = this.state.stocks;
    //Calculate change from last price
    if (stocksMap.has(stock.symbol)) {
      stock.change = (stocksMap.get(stock.symbol).price - stock.price).toFixed(2);
      stock.timestamp = new Date().getTime();
    }
    else {
      stock.change = "";
    }
    stocksMap.set(stock.symbol,stock);
    this.setState(stocksMap);
  }

  componentDidMount() {
    console.log("App.js componentDidMount()");
  }

  render() {
    let now = new Date().getTime();
    return (
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Name</th>
            <th>Mkt Cap</th>
            <th>Price</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          {Array.from(this.state.stocks.values())
          .sort(function (a, b) {
            if (a.symbol < b.symbol) {return -1;}
            else if (a.symbol > b.symbol) {return 1;}
            else return 0;
          })
          .map((stock, index) =>
              <tr key={stock.symbol} className={stock.timestamp > now-50 ? "changed" : ""}> 
                <td>{stock.symbol}</td>
                <td>{stock.name}</td>
                <td class="price">${stock.marketCap} Bn</td>
                <td class="price">${stock.price.toFixed(2) || 0.0}</td>
                {stock.change === ""
                  ?
                  <td></td>
                  :
                  <td className={stock.change > 0 ? "higherPrice" : "lowerPrice"}>
                    {stock.change}
                    <span>
                    {stock.change > 0 
                      ? 
                      "\u25B2"
                      : 
                      "\u25BC"
                    }
                    </span>
                  </td>
                }
              </tr>
          )}
        </tbody>
      </table>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="container">
        <h2>Kaazing.io Demo - Stock Prices</h2>
        <Stocks/>
      </div>
    );
  }
}

export default App;
