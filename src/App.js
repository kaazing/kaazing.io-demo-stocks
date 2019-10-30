import React, { Component } from "react";
import "./App.css";

// NOTE: Replace this URL with a valid URL from the nten.cloud console, from the sandbox configuration.
const eventSourceUrl =
  "https://2cpthvt3.streaming.nten.cloud/topic/sandbox.stocks";

class Stocks extends Component {
  constructor(props) {
    super(props);

    this.state = { stocks: new Map() };

    if (eventSourceUrl.length > 0) {
      let eventSource = new EventSource(eventSourceUrl);

      eventSource.onmessage = e => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed.hasOwnProperty("symbol")) {
            messageCount++;
            this.updateStock(parsed);
          }
        } catch {}
      };

      const startTime = new Date();
      let messageCount = 0;
      setInterval(() => {
        const now = new Date();
        const diff = (now.getTime() - startTime.getTime()) / 1000;
        const rate = (messageCount / diff).toFixed(1);
        console.log(`rate: ${rate}`);
      }, 1000);
    }
  }

  updateStock = stock => {
    var stocksMap = this.state.stocks;
    //Calculate change from last price
    if (stocksMap.has(stock.symbol)) {
      stock.change = (stocksMap.get(stock.symbol).price - stock.price).toFixed(
        2
      );
      stock.timestamp = new Date().getTime();
      stock.priceIsHigher = stock.change > 0;
    } else {
      stock.change = "";
    }
    stocksMap.set(stock.symbol, stock);
    this.setState(stocksMap);
  };

  render() {
    let now = new Date().getTime();
    return (
      <div className="tableContainer">
        <table>
          <thead>
            <tr>
              <th className="symbolHead">Symbol</th>
              <th className="nameHead">Name</th>
              <th className="priceHead">Price</th>
              <th className="priceHead">Change</th>
              <th className="priceHead">Mkt Cap</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(this.state.stocks.values())
              .sort(function(a, b) {
                if (a.symbol < b.symbol) {
                  return -1;
                } else if (a.symbol > b.symbol) {
                  return 1;
                } else return 0;
              })
              .map((stock, index) => (
                <tr
                  key={stock.symbol}
                  className={
                    stock.timestamp > now - 50
                      ? stock.priceIsHigher
                        ? "changedUp"
                        : "changedDown"
                      : ""
                  }
                >
                  <td>{stock.symbol}</td>
                  <td>{stock.name}</td>
                  <td className="price">${stock.price.toFixed(2) || 0.0}</td>
                  {stock.change === "" ? (
                    <td />
                  ) : (
                    <td
                      className={
                        stock.priceIsHigher
                          ? "higherPrice greenArrow"
                          : "lowerPrice redArrow"
                      }
                    >
                      {stock.change}
                      <span>{stock.priceIsHigher ? "\u25B2" : "\u25BC"}</span>
                    </td>
                  )}
                  <td className="price">${stock.marketCap} Bn</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="container">
        <h2>n10.cloud demo - stock prices</h2>
        <Stocks />
      </div>
    );
  }
}

export default App;
