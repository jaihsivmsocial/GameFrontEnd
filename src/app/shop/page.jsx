//  "use client"
//  import GameShop from "@/components/cloths/gameshop";
// export default function ShopPage() {
//   return (

//     <div
//     className="text-center text-white"
//     style={{
//       background: "linear-gradient(180deg, #0b0f19 0%, #0a1a2e 100%)",

//       width:"100%",
//     }}

//   >
//     <GameShop/>
//   </div>
//   );
// }


"use client";

import React, { Component } from "react";
import GameShop from "@/components/cloths/gameshop";
import Inventory from "@/components/cloths/inventory";
import Scene from "@/components/threeD/Scene";

export default class ShopPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: "shop",
    };
    this.handleNavigate = this.handleNavigate.bind(this); // Bind in constructor
  }

  handleNavigate(page) {
    this.setState({ currentPage: page });
  }

  render() {
    return (
      <div  className="text-center text-white"
      style={{
        background: "linear-gradient(180deg, #0b0f19 0%, #0a1a2e 100%)",
        width: "100%",
      }} >

        {this.state.currentPage === "shop" ? (
          <GameShop onNavigate={this.handleNavigate} />
        ) :this.state.currentPage === "3dview" ? ( <Scene onNavigate={this.handleNavigate}/>)
        : (
          <Inventory onNavigate={this.handleNavigate} />
        )}

      </div>
    );
  }
}