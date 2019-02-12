/**
 * Copyright (c) 2018 Kaazing Corporation
 */
// App.js
import React, { Component } from "react";
import "./App.css";

const eventSourceUrl = "https://streams.kaazing.net/sandbox/stocks";

class Stocks extends Component {
  constructor(props) {
    super(props);

    this.state = { stocks: new Map() };

    // Connect to Kaazing.io SSE
    let eventSource = new EventSource(eventSourceUrl);

    eventSource.onmessage = e => {
      this.updateStock(JSON.parse(e.data));
    };
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
              <th className="priceHead">Mkt Cap</th>
              <th className="priceHead">Price</th>
              <th className="priceHead">Change</th>
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
                  <td className="price">${stock.marketCap} Bn</td>
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
        <h2>kaazing.io Demo - Stock Prices</h2>
        <Stocks />
      </div>
    );
  }
}

export default App;
