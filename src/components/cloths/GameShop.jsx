"use client"

import React from "react"

class GameShop extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      genreOpen: false,
      priceOpen: false,
      filterPanelOpen: false,
      sortBy: "",
      exclusive: "",
      selectedColor: "",
      priceRange: 30,
      selectedGenre: "ALL",
      items: [
        {
          id: 1,
          name: "Green Hoodie",
          type: "CASUAL",
          color: "green",
          price: 15,
          image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jacket-iJCfKenQRETbYm2CNmorYEOjcLVCbt.png",
          premium: false,
        },
        {
          id: 2,
          name: "Blue Tuxedo",
          type: "FORMALS",
          color: "blue",
          price: 25,
          image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/balezer-tlEYcXop4tTcFVnOODKMo5OSXbD0h5.png",
          premium: true,
        },
        {
          id: 3,
          name: "Red Jersey",
          type: "SPORTS",
          color: "red",
          price: 20,
          image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tshirt-2W4palhHwGMJBC8jxagQxeaOxklsvj.png",
          premium: false,
        },
        {
          id: 4,
          name: "Gray Jacket",
          type: "CASUAL",
          color: "gray",
          price: 18,
          image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jck-qFBUJWxiwExRQAwadiS1SPXuAb2ZG9.png",
          premium: true,
        },
      ],
    }
    // Bind all methods to this
    this.toggleGenre = this.toggleGenre.bind(this)
    this.togglePrice = this.togglePrice.bind(this)
    this.toggleFilterPanel = this.toggleFilterPanel.bind(this)
    this.handleSortChange = this.handleSortChange.bind(this)
    this.handleExclusiveChange = this.handleExclusiveChange.bind(this)
    this.handleColorSelect = this.handleColorSelect.bind(this)
    this.handlePriceChange = this.handlePriceChange.bind(this)
    this.selectGenre = this.selectGenre.bind(this)
    this.getFilteredItems = this.getFilteredItems.bind(this)
    this.goToInventory = this.goToInventory.bind(this)
  }
  handlePriceChange(event) {
    // Get the value directly from the event target
    const value = Number.parseInt(event.target.value, 10)
    console.log("Price changed to:", value)
    this.setState({ priceRange: value })
  }

  toggleGenre() {
    this.setState({
      genreOpen: !this.state.genreOpen,
      priceOpen: false,
    })
  }

  togglePrice() {
    this.setState({
      priceOpen: !this.state.priceOpen,
      genreOpen: false,
    })
  }

  toggleFilterPanel() {
    this.setState({
      filterPanelOpen: !this.state.filterPanelOpen,
      genreOpen: false,
      priceOpen: false,
    })
  }

  handleSortChange(sortOption) {
    this.setState({ sortBy: this.state.sortBy === sortOption ? "" : sortOption })
  }

  handleExclusiveChange(exclusiveOption) {
    this.setState({ exclusive: this.state.exclusive === exclusiveOption ? "" : exclusiveOption })
  }

  handleColorSelect(color) {
    this.setState({ selectedColor: this.state.selectedColor === color ? "" : color })
  }

  selectGenre(genre) {
    console.log("Genre selected:", genre)
    this.setState({
      selectedGenre: genre,
      genreOpen: false,
    })
  }

  getFilteredItems() {
    let filteredItems = [...this.state.items]

    // console.log("Filtering items with genre:", this.state.selectedGenre)
    // console.log("Filtering items with price range:", this.state.priceRange)

    // Filter by genre
    if (this.state.selectedGenre !== "ALL") {
      filteredItems = filteredItems.filter((item) => item.type === this.state.selectedGenre)
      console.log("After genre filter:", filteredItems.length, "items")
    }

    // Filter by price
    filteredItems = filteredItems.filter((item) => item.price <= this.state.priceRange)
    console.log("After price filter:", filteredItems.length, "items")

    // Filter by exclusive
    if (this.state.exclusive === "free") {
      filteredItems = filteredItems.filter((item) => !item.premium)
    } else if (this.state.exclusive === "premium") {
      filteredItems = filteredItems.filter((item) => item.premium)
    }

    // Filter by color
    if (this.state.selectedColor) {
      filteredItems = filteredItems.filter((item) => item.color === this.state.selectedColor)
    }

    // Sort items
    if (this.state.sortBy === "priceLowToHigh") {
      filteredItems.sort((a, b) => a.price - b.price)
    } else if (this.state.sortBy === "priceHighToLow") {
      filteredItems.sort((a, b) => b.price - a.price)
    } else if (this.state.sortBy === "nameAtoZ") {
      filteredItems.sort((a, b) => a.name.localeCompare(b.name))
    } else if (this.state.sortBy === "nameZtoA") {
      filteredItems.sort((a, b) => b.name.localeCompare(a.name))
    }

    console.log("Final filtered items:", filteredItems)
    return filteredItems
  }

  goToInventory() {
    if (this.props.onNavigate) {
      this.props.onNavigate("inventory")
    }
  }

  render() {
    const filteredItems = this.getFilteredItems()

    return (
      <div className="position-relative vh-100 bg-dark text-white overflow-hidden">
        <style>
          {`
            @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');
            .form-range {
              -webkit-appearance: none;
              appearance: none;
              width: 100%;
              height: 10px;
              background: #343a40;
              outline: none;
              border-radius: 5px;
            }

            .form-range::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 20px;
              height: 20px;
              background: #0dcaf0;
              cursor: pointer;
              border-radius: 50%;
              border: none;
            }

            .form-range::-moz-range-thumb {
              width: 20px;
              height: 20px;
              background: #0dcaf0;
              cursor: pointer;
              border-radius: 50%;
              border: none;
            }
            .form-range::-webkit-slider-thumb {
              background: #0dcaf0;
            }
            .form-range::-moz-range-thumb {
              background: #0dcaf0;
            }
            .form-range::-ms-thumb {
              background: #0dcaf0;
            }
            .form-range::-webkit-slider-runnable-track {
              background: #343a40;
            }
            .form-range::-moz-range-track {
              background: #343a40;
            }
            .form-range::-ms-track {
              background: #343a40;
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
          <div className="d-flex align-items-center gap-4">
            {/* Genre dropdown */}
            <div className="position-relative">
              <div className="d-flex align-items-center">
                <span className="me-2">GENRE:</span>
                <button
                  className="d-flex align-items-center gap-1 bg-transparent border-0 px-2 py-1 fs-6 fw-bold text-info"
                  onClick={this.toggleGenre}
                >
                  {this.state.selectedGenre}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ms-1"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>
              {this.state.genreOpen && (
                <div
                  className="position-absolute top-100 start-0 mt-1 bg-dark rounded shadow z-3"
                  style={{ width: "160px" }}
                >
                  <div className="p-2">
                    <div
                      className="px-3 py-1 rounded d-flex justify-content-between align-items-center cursor-pointer"
                      style={{ cursor: "pointer" }}
                      onClick={() => this.selectGenre("ALL")}
                    >
                      ALL
                      {this.state.selectedGenre === "ALL" && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                    <div
                      className="px-3 py-1 rounded d-flex justify-content-between align-items-center cursor-pointer"
                      style={{ cursor: "pointer" }}
                      onClick={() => this.selectGenre("CASUAL")}
                    >
                      CASUAL
                      {this.state.selectedGenre === "CASUAL" && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                    <div
                      className="px-3 py-1 rounded d-flex justify-content-between align-items-center cursor-pointer"
                      style={{ cursor: "pointer" }}
                      onClick={() => this.selectGenre("SPORTS")}
                    >
                      SPORTS
                      {this.state.selectedGenre === "SPORTS" && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                    <div
                      className="px-3 py-1 rounded d-flex justify-content-between align-items-center cursor-pointer"
                      style={{ cursor: "pointer" }}
                      onClick={() => this.selectGenre("FORMALS")}
                    >
                      FORMALS
                      {this.state.selectedGenre === "FORMALS" && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Price dropdown */}
            <div className="position-relative">
              <div className="d-flex align-items-center">
                <span className="me-2">PRICE:</span>
                <button
                  className="d-flex align-items-center gap-1 bg-transparent border-0 px-2 py-1 fs-6 fw-bold text-info"
                  onClick={this.togglePrice}
                >
                  ${this.state.priceRange}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ms-1"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>
              {this.state.priceOpen && (
                <div
                  className="position-absolute top-100 start-0 mt-1 bg-dark rounded shadow z-3"
                  style={{ width: "200px" }}
                >
                  <div className="p-3">
                    <div className="mb-2">RANGE</div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>$0</span>
                      <span className="text-info fw-bold">${this.state.priceRange}</span>
                      <span>$100</span>
                    </div>
                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max="100"
                      step="1"
                      value={this.state.priceRange}
                      onChange={this.handlePriceChange}
                      style={{
                        cursor: "pointer",
                        height: "20px",
                        appearance: "none",
                        backgroundColor: "transparent",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            className="d-flex align-items-center gap-2 bg-dark border border-secondary rounded px-3 py-2 fs-6 text-white"
            onClick={this.goToInventory}
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
              <path d="M19 12H5M12 19l-7-7 7-7"></path>
            </svg>
            GO TO INVENTORY
          </button>

          <div className="bg-success rounded px-3 py-2 d-flex align-items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="6" width="20" height="12" rx="2" stroke="white" strokeWidth="2" />
              <circle cx="16" cy="12" r="2" fill="white" />
            </svg>
            BALANCE: $300
          </div>
        </div>

        {/* Filters button */}
        <div className="position-absolute start-0 ms-4 mt-4 z-1" style={{ top: "60px" }}>
          {!this.state.genreOpen && (
            <button
              className="d-flex align-items-center gap-2 bg-transparent border-0 text-white fs-6"
              onClick={this.toggleFilterPanel}
              style={{ cursor: "pointer" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <line x1="4" y1="18" x2="20" y2="18"></line>
              </svg>
              FILTERS
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {this.state.filterPanelOpen && (
          <div
            className="position-absolute start-0 top-0 bottom-0 bg-dark bg-opacity-90 z-2"
            style={{ width: "200px", marginTop: "100px" }}
          >
            <div className="p-3">
              <div className="mb-4">
                <div className="fw-bold mb-2">Sort By</div>
                <div>
                  <div className="form-check mb-1">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="priceLowToHigh"
                      checked={this.state.sortBy === "priceLowToHigh"}
                      onChange={() => this.handleSortChange("priceLowToHigh")}
                    />
                    <label className="form-check-label" htmlFor="priceLowToHigh">
                      Price Low to High
                    </label>
                  </div>
                  <div className="form-check mb-1">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="priceHighToLow"
                      checked={this.state.sortBy === "priceHighToLow"}
                      onChange={() => this.handleSortChange("priceHighToLow")}
                    />
                    <label className="form-check-label" htmlFor="priceHighToLow">
                      Price High to Low
                    </label>
                  </div>
                  <div className="form-check mb-1">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="nameAtoZ"
                      checked={this.state.sortBy === "nameAtoZ"}
                      onChange={() => this.handleSortChange("nameAtoZ")}
                    />
                    <label className="form-check-label" htmlFor="nameAtoZ">
                      Name A to Z (alphabetically)
                    </label>
                  </div>
                  <div className="form-check mb-1">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="nameZtoA"
                      checked={this.state.sortBy === "nameZtoA"}
                      onChange={() => this.handleSortChange("nameZtoA")}
                    />
                    <label className="form-check-label" htmlFor="nameZtoA">
                      Name Z to A (alphabetically)
                    </label>
                  </div>
                  <div className="form-check mb-1">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="popular"
                      checked={this.state.sortBy === "popular"}
                      onChange={() => this.handleSortChange("popular")}
                    />
                    <label className="form-check-label" htmlFor="popular">
                      Popular
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="fw-bold mb-2">Exclusive</div>
                <div>
                  <div className="form-check mb-1">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="free"
                      checked={this.state.exclusive === "free"}
                      onChange={() => this.handleExclusiveChange("free")}
                    />
                    <label className="form-check-label" htmlFor="free">
                      Free
                    </label>
                  </div>
                  <div className="form-check mb-1">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="premium"
                      checked={this.state.exclusive === "premium"}
                      onChange={() => this.handleExclusiveChange("premium")}
                    />
                    <label className="form-check-label" htmlFor="premium">
                      Premium
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <div className="fw-bold mb-2">Colors</div>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    className={`rounded-circle border ${this.state.selectedColor === "red" ? "border-white border-2" : "border-0"}`}
                    style={{ width: "20px", height: "20px", backgroundColor: "red", cursor: "pointer" }}
                    onClick={() => this.handleColorSelect("red")}
                  ></button>
                  <button
                    className={`rounded-circle border ${this.state.selectedColor === "orange" ? "border-white border-2" : "border-0"}`}
                    style={{ width: "20px", height: "20px", backgroundColor: "orange", cursor: "pointer" }}
                    onClick={() => this.handleColorSelect("orange")}
                  ></button>
                  <button
                    className={`rounded-circle border ${this.state.selectedColor === "yellow" ? "border-white border-2" : "border-0"}`}
                    style={{ width: "20px", height: "20px", backgroundColor: "yellow", cursor: "pointer" }}
                    onClick={() => this.handleColorSelect("yellow")}
                  ></button>
                  <button
                    className={`rounded-circle border ${this.state.selectedColor === "lime" ? "border-white border-2" : "border-0"}`}
                    style={{ width: "20px", height: "20px", backgroundColor: "lime", cursor: "pointer" }}
                    onClick={() => this.handleColorSelect("lime")}
                  ></button>
                  <button
                    className={`rounded-circle border ${this.state.selectedColor === "cyan" ? "border-white border-2" : "border-0"}`}
                    style={{ width: "20px", height: "20px", backgroundColor: "cyan", cursor: "pointer" }}
                    onClick={() => this.handleColorSelect("cyan")}
                  ></button>
                  <button
                    className={`rounded-circle border ${this.state.selectedColor === "blue" ? "border-white border-2" : "border-0"}`}
                    style={{ width: "20px", height: "20px", backgroundColor: "blue", cursor: "pointer" }}
                    onClick={() => this.handleColorSelect("blue")}
                  ></button>
                  <button
                    className={`rounded-circle border ${this.state.selectedColor === "purple" ? "border-white border-2" : "border-0"}`}
                    style={{ width: "20px", height: "20px", backgroundColor: "purple", cursor: "pointer" }}
                    onClick={() => this.handleColorSelect("purple")}
                  ></button>
                  <button
                    className={`rounded-circle border ${this.state.selectedColor === "magenta" ? "border-white border-2" : "border-0"}`}
                    style={{ width: "20px", height: "20px", backgroundColor: "magenta", cursor: "pointer" }}
                    onClick={() => this.handleColorSelect("magenta")}
                  ></button>
                  <button
                    className={`rounded-circle border ${this.state.selectedColor === "white" ? "border-white border-2" : "border-0"}`}
                    style={{ width: "20px", height: "20px", backgroundColor: "white", cursor: "pointer" }}
                    onClick={() => this.handleColorSelect("white")}
                  ></button>
                  <button
                    className={`rounded-circle border ${this.state.selectedColor === "black" ? "border-white border-2" : "border-0"}`}
                    style={{ width: "20px", height: "20px", backgroundColor: "black", cursor: "pointer" }}
                    onClick={() => this.handleColorSelect("black")}
                  ></button>
                  <button
                    className={`rounded-circle border ${this.state.selectedColor === "indigo" ? "border-white border-2" : "border-0"}`}
                    style={{ width: "20px", height: "20px", backgroundColor: "indigo", cursor: "pointer" }}
                    onClick={() => this.handleColorSelect("indigo")}
                  ></button>
                  <button
                    className={`rounded-circle border ${this.state.selectedColor === "gold" ? "border-white border-2" : "border-0"}`}
                    style={{ width: "20px", height: "20px", backgroundColor: "gold", cursor: "pointer" }}
                    onClick={() => this.handleColorSelect("gold")}
                  ></button>
                </div>
              </div>
            </div>
          </div>
        )}

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
            {filteredItems.length > 0 ? (
              <>
                {/* Filtered Items (left side) */}
                {filteredItems.slice(0, 2).map((item, index) => (
                  <div key={item.id} className="d-flex flex-column align-items-center">
                    <div
                      className="bg-secondary rounded d-flex align-items-center justify-content-center mb-2 position-relative overflow-hidden"
                      style={{ width: "128px", height: "160px" }}
                    >
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-100 h-100 object-fit-cover"
                      />
                    </div>
                    <button className="bg-primary text-white px-4 py-1 rounded fs-6 fw-bold border-0">TRY</button>
                  </div>
                ))}

                {/* Center Character */}
                <div className="d-flex flex-column align-items-center mx-4">
                  <div
                    className="d-flex align-items-center justify-content-center position-relative"
                    style={{ width: "160px", height: "240px" }}
                  >
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bigroundimg-PGZH2TOJxV4dkq0tukmMbbl6shEKP4.png"
                      alt="Character"
                      className="w-100 h-100 object-fit-contain"
                      style={{ objectPosition: "center 30%" }}
                    />
                  </div>
                  <div className="d-flex flex-column align-items-center">
                    <button className="bg-primary text-white px-4 py-1 rounded fs-6 fw-bold border-0 mb-1">
                      INSPECT
                    </button>
                    <span className="text-secondary fs-6">Customize</span>
                  </div>
                </div>

                {/* Filtered Items (right side) */}
                {filteredItems.slice(2, 4).map((item, index) => (
                  <div key={item.id} className="d-flex flex-column align-items-center">
                    <div
                      className="bg-secondary rounded d-flex align-items-center justify-content-center mb-2 position-relative overflow-hidden"
                      style={{ width: "128px", height: "160px" }}
                    >
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-100 h-100 object-fit-cover"
                      />
                    </div>
                    <button className="bg-primary text-white px-4 py-1 rounded fs-6 fw-bold border-0">TRY</button>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center">
                <h3 className="text-white">No items match your filters</h3>
                <p className="text-secondary">Try adjusting your filters to see more items</p>
              </div>
            )}
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

        {/* Bottom purchase area */}
        <div className="position-absolute bottom-0 start-0 end-0 d-flex flex-column align-items-center pb-4 z-1">
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="bg-dark bg-opacity-50 rounded-pill px-4 py-2 d-flex align-items-center">
              <span className="text-secondary text-decoration-line-through me-2">$10</span>
              <span className="text-primary fw-bold fs-4">$5.00</span>
            </div>
            <button className="bg-success text-white px-4 py-2 rounded fw-bold fs-5 border-0">Buy Now</button>
          </div>
          <div className="fs-6">
            <span className="text-white">Limited Edition!</span>
            <span className="text-danger"> Only 2 remaining</span>
          </div>
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

export default GameShop

