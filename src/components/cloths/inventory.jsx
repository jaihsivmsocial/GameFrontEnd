"use client"

import React from "react"

class Inventory extends React.Component {
  constructor(props) {
    super(props)

    // Define items first so we can use them to initialize inspectedItem
    const items = [
      {
        id: 1,
        name: "Green Hoodie",
        type: "CASUAL",
        color: "green",
        price: 15,
        modelPath: "/assets/img/cloth/ClothsAndCharacter/Cloth1/Model/TShirt1.fbx",
        image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jacket-iJCfKenQRETbYm2CNmorYEOjcLVCbt.png",
        premium: false,
      },
      {
        id: 2,
        name: "Blue Tuxedo",
        type: "FORMALS",
        color: "blue",
        price: 25,
        modelPath: "/assets/img/cloth/ClothsAndCharacter/Cloth1/Model/TShirt1.fbx",
        image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/balezer-tlEYcXop4tTcFVnOODKMo5OSXbD0h5.png",
        premium: true,
      },
      {
        id: 3,
        name: "Red Jersey",
        type: "SPORTS",
        color: "red",
        price: 20,
        modelPath: "/assets/img/cloth/ClothsAndCharacter/Cloth1/Model/TShirt1.fbx",
        image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tshirt-2W4palhHwGMJBC8jxagQxeaOxklsvj.png",
        premium: false,
      },
      {
        id: 4,
        name: "Gray Jacket",
        type: "CASUAL",
        color: "gray",
        price: 18,
        modelPath: "/assets/img/cloth/ClothsAndCharacter/Cloth1/Model/TShirt1.fbx",
        image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jck-qFBUJWxiwExRQAwadiS1SPXuAb2ZG9.png",
        premium: true,
      },
    ]

    this.state = {
      items,
      equippedItem: null,
      viewerError: false,
      inspectMode: false,
      wearingItem: null,
    }

    this.goToShop = this.goToShop.bind(this)
    this.handleViewerError = this.handleViewerError.bind(this)
    this.toggleInspectMode = this.toggleInspectMode.bind(this)
    this.tryItem = this.tryItem.bind(this)
    this.equipItem = this.equipItem.bind(this)
  }

  goToShop() {
    if (this.props.onNavigate) {
      this.props.onNavigate("shop")
    }
  }

  handleViewerError() {
    console.log("Viewer error detected, switching to fallback")
    this.setState({ viewerError: true })
  }

  toggleInspectMode() {

    if (this.props.onNavigate) {
      this.props.onNavigate("3dview")
    }

    // this.setState((prevState) => ({
    //   inspectMode: !prevState.inspectMode,
    // }))
  }

  tryItem(item) {
    // Put the item on the character
    this.setState({ wearingItem: item })
  }

  equipItem() {
    // Remove the item from the character
    this.setState({ wearingItem: null })
  }

  render() {
    const { wearingItem, inspectMode, items } = this.state

    return (
      <div className="position-relative vh-100 bg-dark text-white overflow-hidden">
        <style>
          {`
            @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');
            .item-platform {
              position: relative;
              width: 128px;
              height: 160px;
              border-radius: 50%;
              background: radial-gradient(circle, rgba(0,150,150,0.3) 0%, rgba(0,0,0,0) 70%);
              display: flex;
              justify-content: center;
              align-items: center;
              margin-bottom: 10px;
              transition: all 0.5s ease;
            }
            .item-platform::after {
              content: '';
              position: absolute;
              bottom: 0;
              width: 80%;
              height: 5px;
              background: rgba(0,255,255,0.5);
              border-radius: 50%;
              filter: blur(3px);
            }
            .item-platform.floating {
              transform: translateY(-20px);
              box-shadow: 0 10px 20px rgba(0,255,255,0.2);
            }
            .item-platform.floating::after {
              opacity: 0.7;
              filter: blur(5px);
            }
            .try-button {
              background-color: #0dcaf0;
              color: white;
              border: none;
              border-radius: 4px;
              padding: 5px 15px;
              font-weight: bold;
              font-size: 14px;
              cursor: pointer;
              text-transform: uppercase;
            }
            .inspect-button {
              background-color: #0dcaf0;
              color: white;
              border: none;
              border-radius: 4px;
              padding: 8px 25px;
              font-weight: bold;
              font-size: 16px;
              cursor: pointer;
              text-transform: uppercase;
            }
            .equip-button {
              background-color: #0dcaf0;
              color: white;
              border: none;
              border-radius: 4px;
              padding: 10px 30px;
              font-weight: bold;
              font-size: 18px;
              cursor: pointer;
              text-transform: uppercase;
            }
            .item-image {
              height: 100%;
              object-fit: contain;
              transition: all 0.5s ease;
            }
            .item-image.floating {
              animation: float 3s ease-in-out infinite;
            }
            @keyframes float {
              0% {
                transform: translateY(0px) rotate(0deg);
              }
              50% {
                transform: translateY(-10px) rotate(5deg);
              }
              100% {
                transform: translateY(0px) rotate(0deg);
              }
            }
            .item-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              transition: all 0.5s ease;
            }
            .item-container:nth-child(odd).floating {
              animation: floatLeft 4s ease-in-out infinite;
            }
            .item-container:nth-child(even).floating {
              animation: floatRight 4s ease-in-out infinite;
            }
            @keyframes floatLeft {
              0% {
                transform: translateY(0px) translateX(0px);
              }
              50% {
                transform: translateY(-15px) translateX(-10px);
              }
              100% {
                transform: translateY(0px) translateX(0px);
              }
            }
            @keyframes floatRight {
              0% {
                transform: translateY(0px) translateX(0px);
              }
              50% {
                transform: translateY(-15px) translateX(10px);
              }
              100% {
                transform: translateY(0px) translateX(0px);
              }
            }
            .character-container {
              position: relative;
              width: 160px;
              height: 240px;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .character-image {
              width: 100%;
              height: 100%;
              object-fit: contain;
              object-position: center 30%;
              z-index: 1;
            }
            .clothing-overlay {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              z-index: 2;
              animation: fadeIn 0.5s ease-in-out;
            }
            .clothing-image {
              max-width: 90%;
              max-height: 90%;
              object-fit: contain;
              filter: drop-shadow(0 0 5px rgba(0, 200, 255, 0.5));
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .notification {
              position: absolute;
              top: 10px;
              left: 50%;
              transform: translateX(-50%);
              background-color: rgba(13, 202, 240, 0.8);
              color: white;
              padding: 8px 16px;
              border-radius: 4px;
              font-weight: bold;
              z-index: 100;
              animation: fadeInOut 2s ease-in-out forwards;
            }
            @keyframes fadeInOut {
              0% { opacity: 0; transform: translate(-50%, -20px); }
              20% { opacity: 1; transform: translate(-50%, 0); }
              80% { opacity: 1; transform: translate(-50%, 0); }
              100% { opacity: 0; transform: translate(-50%, -20px); }
            }
          `}
        </style>

        {/* Background image - space/galaxy effect */}
        <div
          className="position-absolute top-0 start-0 end-0 bottom-0 bg-opacity-30 z-0"
          style={{
            backgroundImage:
              "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bigroundimg-PGZH2TOJxV4dkq0tukmMbbl6shEKP4.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        {/* Top navigation bar */}
        <div className="position-relative d-flex justify-content-between align-items-center p-3 z-1">
          <button className="d-flex align-items-center gap-2 bg-dark border border-secondary rounded px-3 py-2 fs-6 text-white">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
            FILTERS
          </button>

          <button
            className="d-flex align-items-center gap-2 bg-dark border border-secondary rounded px-3 py-2 fs-6 text-white"
            onClick={this.goToShop}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
            GO TO SHOP
          </button>

          <div className="bg-success rounded px-3 py-2 d-flex align-items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="6" width="20" height="12" rx="2" stroke="white" strokeWidth="2" />
              <circle cx="16" cy="12" r="2" fill="white" />
            </svg>
            BALANCE: $300
            <div className="ms-1 text-white-50 small">
              <a href="#" className="text-decoration-none text-white-50">
                Last Transactions History
              </a>
            </div>
          </div>
        </div>

        {/* Notification when trying on or equipping */}
        {wearingItem && <div className="notification">Trying on {wearingItem.name}</div>}

        {/* Main content area with items */}
        <div
          className="position-relative d-flex justify-content-center align-items-center z-1"
          style={{ height: "calc(100vh - 180px)", marginTop: "20px" }}
        >
          {/* Left navigation arrow */}
          <button className="position-absolute start-0 top-50 translate-middle-y ms-4 bg-primary rounded-circle p-2 text-white border-0">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          {/* Items display */}
          <div className="d-flex align-items-end justify-content-center gap-4 w-100 px-5">
            {/* Items (left side) */}
            {this.state.items.slice(0, 2).map((item) => (
              <div key={item.id} className={`item-container ${inspectMode ? "floating" : ""}`}>
                <div className={`item-platform ${inspectMode ? "floating" : ""}`}>
                  <img
                    src={item.image || `/placeholder.svg?height=150&width=100&text=${item.name}`}
                    alt={item.name}
                    className={`item-image ${inspectMode ? "floating" : ""}`}
                  />
                </div>
                <button className="try-button" onClick={() => this.tryItem(item)}>
                  TRY IT
                </button>
              </div>
            ))}

            {/* Center Character */}
            <div className="d-flex flex-column align-items-center mx-4">
              <div className="d-flex flex-column align-items-center mb-2">
                <button className="inspect-button mb-1" onClick={this.toggleInspectMode}>
                  INSPECT from invertery
                </button>
                <span className="text-secondary fs-6">Customize</span>
              </div>
              <div className="character-container">
                {/* Base character */}
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Character%201-VmkchxaaWuEChAOLYY0OeOhX2IRdMq.png"
                  alt="Character"
                  className="character-image"
                />

                {/* Clothing overlay */}
                {wearingItem && (
                  <div className="clothing-overlay">
                    <img
                      src={wearingItem.image || "/placeholder.svg"}
                      alt={wearingItem.name}
                      className="clothing-image"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Items (right side) */}
            {this.state.items.slice(2, 4).map((item) => (
              <div key={item.id} className={`item-container ${inspectMode ? "floating" : ""}`}>
                <div className={`item-platform ${inspectMode ? "floating" : ""}`}>
                  <img
                    src={item.image || `/placeholder.svg?height=150&width=100&text=${item.name}`}
                    alt={item.name}
                    className={`item-image ${inspectMode ? "floating" : ""}`}
                  />
                </div>
                <button className="try-button" onClick={() => this.tryItem(item)}>
                  TRY IT
                </button>
              </div>
            ))}
          </div>

          {/* Right navigation arrow */}
          <button className="position-absolute end-0 top-50 translate-middle-y me-4 bg-primary rounded-circle p-2 text-white border-0">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        {/* Equip button */}
        <div className="position-absolute bottom-0 start-0 end-0 d-flex justify-content-center pb-4 z-1">
          <button
            className="equip-button"
            onClick={this.equipItem}
            disabled={!wearingItem}
            style={{ opacity: wearingItem ? 1 : 0.5 }}
          >
            {wearingItem ? "REMOVE" : "EQUIP"}
          </button>
        </div>

        {/* Bottom left help button */}
        <button
          className="position-absolute start-0 bottom-0 ms-4 mb-4 bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white border-0 z-1"
          style={{ width: "32px", height: "32px" }}
        >
          <span className="fw-bold">?</span>
        </button>

        {/* Bottom right controls */}
        <div className="position-absolute end-0 bottom-0 me-4 mb-4 d-flex align-items-center gap-2 z-1">
          <button
            className="bg-secondary rounded-circle d-flex align-items-center justify-content-center border-0"
            style={{ width: "32px", height: "32px" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
          <button
            className="bg-secondary rounded-circle d-flex align-items-center justify-content-center border-0"
            style={{ width: "32px", height: "32px" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
            </svg>
          </button>
        </div>
      </div>
    )
  }
}

export default Inventory

