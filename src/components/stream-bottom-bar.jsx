"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import "bootstrap/dist/css/bootstrap.min.css"
import AuthHeaderButtons from "../components/register/SignupLogin"
import PaymentModal from "../components/subscribes/PaymentModal"

export default function StreamBottomBar() {
    const [donationAmount, setDonationAmount] = useState("")
    const [betAmount, setBetAmount] = useState("100")
    const [giftToPlayer, setGiftToPlayer] = useState(false)
    const [addToPrizepool, setAddToPrizepool] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [initialAuthView, setInitialAuthView] = useState(null)
    const [activeMobileSection, setActiveMobileSection] = useState(null) // 'donate', 'bet', or null
    const [isMobile, setIsMobile] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false) // New state for payment modal

    // Check if user is logged in on component mount
    useEffect(() => {
        const token = localStorage.getItem("authToken")
        if (token) {
            setIsLoggedIn(true)
        }

        // Check if mobile
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768)
        }

        checkMobile()
        window.addEventListener("resize", checkMobile)

        return () => {
            window.removeEventListener("resize", checkMobile)
        }
    }, [])

    // Handle auth state changes from the AuthHeaderButtons component
    const handleAuthStateChange = (loggedIn, userData) => {
        setIsLoggedIn(loggedIn)
        if (showAuthModal) {
            setShowAuthModal(false)
        }
    }

    // Handle signup button click
    const handleSignupClick = () => {
        setInitialAuthView("signup")
        setShowAuthModal(true)
    }

    // Handle subscribe button click
    const handleSubscribeClick = () => {
        setShowPaymentModal(true)
    }

    // Render donation section for mobile
    const renderDonationSection = () => {
        return (
            <div
                style={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    padding: "15px",
                    borderRadius: "16px 16px 0 0",
                    position: "fixed",
                    bottom: "60px",
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    boxShadow: "0px -4px 20px rgba(0, 0, 0, 0.5)",
                    maxHeight: "60vh",
                    overflowY: "auto",
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ color: "#06b6d4", fontWeight: "bold", fontSize: "16px" }}>Donate</span>
                    <button
                        onClick={() => setActiveMobileSection(null)}
                        style={{
                            background: "none",
                            border: "none",
                            color: "white",
                            fontSize: "20px",
                            cursor: "pointer",
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <span style={{ fontSize: "14px", color: "#06b6d4", fontWeight: "bold" }}>Want to donate?</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "#1e293b",
                            borderRadius: "4px",
                            marginRight: "5px",
                            position: "relative",
                            height: "40px",
                            flex: 1,
                        }}
                    >
                        <span style={{ color: "#06b6d4", marginLeft: "8px", marginRight: "5px" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.31 11.14C10.54 10.69 9.97 10.2 9.97 9.47C9.97 8.63 10.76 8.04 12.07 8.04C13.45 8.04 13.97 8.7 14.01 9.68H15.72C15.67 8.34 14.85 7.11 13.23 6.71V5H10.9V6.69C9.39 7.01 8.18 7.99 8.18 9.5C8.18 11.29 9.67 12.19 11.84 12.71C13.79 13.17 14.18 13.86 14.18 14.58C14.18 15.11 13.79 15.97 12.08 15.97C10.48 15.97 9.85 15.25 9.76 14.33H8.04C8.14 16.03 9.4 16.99 10.9 17.3V19H13.24V17.33C14.76 17.04 15.96 16.17 15.97 14.56C15.96 12.36 14.07 11.6 12.31 11.14Z"
                                    fill="#06b6d4"
                                />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Enter amount here..."
                            value={donationAmount}
                            onChange={(e) => setDonationAmount(e.target.value)}
                            style={{
                                backgroundColor: "transparent",
                                border: "none",
                                color: "white",
                                padding: "0",
                                width: "calc(100% - 60px)",
                                fontSize: "14px",
                                outline: "none",
                            }}
                        />
                        <span
                            style={{
                                position: "absolute",
                                right: "8px",
                                color: "#9ca3af",
                                fontSize: "10px",
                                cursor: "pointer",
                            }}
                            onClick={() => setDonationAmount("")}
                        >
                            CLEAR
                        </span>
                    </div>

                    <button
                        style={{
                            backgroundColor: "#06b6d4",
                            border: "none",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "40px",
                            height: "40px",
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 5L19 12L12 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                    <button
                        style={{
                            backgroundColor: "#1e293b",
                            border: "none",
                            borderRadius: "4px",
                            color: "#06b6d4",
                            padding: "8px 12px",
                            fontSize: "14px",
                            flex: 1,
                        }}
                        onClick={() => setDonationAmount((prev) => (Number.parseFloat(prev) || 0) + 1 + "")}
                    >
                        +1.00
                    </button>

                    <button
                        style={{
                            backgroundColor: "#1e293b",
                            border: "none",
                            borderRadius: "4px",
                            color: "#06b6d4",
                            padding: "8px 12px",
                            fontSize: "14px",
                            flex: 1,
                        }}
                        onClick={() => setDonationAmount((prev) => (Number.parseFloat(prev) || 0) + 5 + "")}
                    >
                        +5.00
                    </button>

                    <button
                        style={{
                            backgroundColor: "#1e293b",
                            border: "none",
                            borderRadius: "4px",
                            color: "#06b6d4",
                            padding: "8px 12px",
                            fontSize: "14px",
                            flex: 1,
                        }}
                        onClick={() => setDonationAmount((prev) => (Number.parseFloat(prev) || 0) + 10 + "")}
                    >
                        +10.00
                    </button>
                </div>

                <div style={{ display: "flex", marginBottom: "15px" }}>
                    <div style={{ display: "flex", alignItems: "center", marginRight: "20px" }}>
                        <input
                            type="checkbox"
                            id="giftToPlayerMobile"
                            checked={giftToPlayer}
                            onChange={() => setGiftToPlayer(!giftToPlayer)}
                            style={{ marginRight: "5px", width: "16px", height: "16px" }}
                        />
                        <label htmlFor="giftToPlayerMobile" style={{ fontSize: "14px", margin: 0, color: "white" }}>
                            Gift to Player
                        </label>
                    </div>

                    <div style={{ display: "flex", alignItems: "center" }}>
                        <input
                            type="checkbox"
                            id="addToPrizepoolMobile"
                            checked={addToPrizepool}
                            onChange={() => setAddToPrizepool(!addToPrizepool)}
                            style={{ marginRight: "5px", width: "16px", height: "16px" }}
                        />
                        <label htmlFor="addToPrizepoolMobile" style={{ fontSize: "14px", margin: 0, color: "white" }}>
                            Add to Prizepool
                        </label>
                    </div>
                </div>

                <div
                    style={{
                        borderTop: "1px dashed #475569",
                        borderBottom: "1px dashed #475569",
                        paddingTop: "8px",
                        paddingBottom: "8px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "5px",
                    }}
                >
                    <span style={{ color: "#06b6d4", fontSize: "14px" }}>$5 shows up on stream</span>
                    <span style={{ color: "#9ca3af", fontSize: "14px" }}>$50 fireworks</span>
                </div>
            </div>
        )
    }

    // Render betting section for mobile
    const renderBettingSection = () => {
        return (
            <div
                style={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    padding: "15px",
                    borderRadius: "16px 16px 0 0",
                    position: "fixed",
                    bottom: "60px",
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    boxShadow: "0px -4px 20px rgba(0, 0, 0, 0.5)",
                    maxHeight: "60vh",
                    overflowY: "auto",
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ color: "#06b6d4", fontWeight: "bold", fontSize: "16px" }}>Place a Bet</span>
                    <button
                        onClick={() => setActiveMobileSection(null)}
                        style={{
                            background: "none",
                            border: "none",
                            color: "white",
                            fontSize: "20px",
                            cursor: "pointer",
                        }}
                    >
                        ×
                    </button>
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "15px",
                        position: "relative",
                    }}
                >
                    <div>
                        <span style={{ fontSize: "16px", color: "white" }}>Will </span>
                        <span style={{ color: "#06b6d4", fontSize: "16px" }}>James5423</span>
                        <span style={{ fontSize: "16px", color: "white" }}> survive the full 5 minutes?</span>
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            right: "0",
                            backgroundColor: "#7f1d1d",
                            border: "1px solid #b91c1c",
                            borderRadius: "4px",
                            color: "white",
                            padding: "2px 8px",
                            fontSize: "14px",
                        }}
                    >
                        00:36
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    {/* Updated YES button with centered percentage */}
                    <div style={{ position: "relative", width: "100px", height: "40px" }}>
                        <button
                            style={{
                                width: "100%",
                                height: "100%",
                                backgroundColor: "#0e4429",
                                border: "1px solid #15803d",
                                borderRadius: "4px",
                                color: "#22c55e",
                                padding: "8px 15px",
                                fontSize: "16px",
                                fontWeight: "bold",
                                textAlign: "left",
                            }}
                        >
                            YES
                        </button>
                        <div
                            style={{
                                position: "absolute",
                                right: "0",
                                top: "0",
                                bottom: "0",
                                backgroundColor: "#166534",
                                borderTopRightRadius: "4px",
                                borderBottomRightRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "40px",
                                color: "white",
                                fontSize: "14px",
                                fontWeight: "bold",
                            }}
                        >
                            52%
                        </div>
                    </div>

                    {/* Updated NO button with centered percentage */}
                    <div style={{ position: "relative", width: "100px", height: "40px" }}>
                        <button
                            style={{
                                width: "100%",
                                height: "100%",
                                backgroundColor: "#7f1d1d",
                                border: "1px solid #b91c1c",
                                borderRadius: "4px",
                                color: "#ef4444",
                                padding: "8px 15px",
                                fontSize: "16px",
                                fontWeight: "bold",
                                textAlign: "left",
                            }}
                        >
                            NO
                        </button>
                        <div
                            style={{
                                position: "absolute",
                                right: "0",
                                top: "0",
                                bottom: "0",
                                backgroundColor: "#b91c1c",
                                borderTopRightRadius: "4px",
                                borderBottomRightRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "40px",
                                color: "white",
                                fontSize: "14px",
                                fontWeight: "bold",
                            }}
                        >
                            48%
                        </div>
                    </div>

                    {/* Improved bet amount input with buttons in a single row */}
                    <div style={{ display: "flex", flexDirection: "column", width: "280px" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                backgroundColor: "#1e293b",
                                borderRadius: "4px",
                                height: "40px",
                                width: "100%",
                                marginBottom: "8px",
                            }}
                        >
                            <span style={{ color: "#06b6d4", marginLeft: "10px", marginRight: "5px" }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.31 11.14C10.54 10.69 9.97 10.2 9.97 9.47C9.97 8.63 10.76 8.04 12.07 8.04C13.45 8.04 13.97 8.7 14.01 9.68H15.72C15.67 8.34 14.85 7.11 13.23 6.71V5H10.9V6.69C9.39 7.01 8.18 7.99 8.18 9.5C8.18 11.29 9.67 12.19 11.84 12.71C13.79 13.17 14.18 13.86 14.18 14.58C14.18 15.11 13.79 15.97 12.08 15.97C10.48 15.97 9.85 15.25 9.76 14.33H8.04C8.14 16.03 9.4 16.99 10.9 17.3V19H13.24V17.33C14.76 17.04 15.96 16.17 15.97 14.56C15.96 12.36 14.07 11.6 12.31 11.14Z"
                                        fill="#06b6d4"
                                    />
                                </svg>
                            </span>
                            <span style={{ color: "#06b6d4", fontSize: "16px", fontWeight: "bold" }}>{betAmount}</span>
                            <div style={{ marginLeft: "auto", display: "flex" }}>
                                <span
                                    style={{
                                        color: "#9ca3af",
                                        fontSize: "12px",
                                        cursor: "pointer",
                                        padding: "0 10px",
                                    }}
                                    onClick={() => setBetAmount("")}
                                >
                                    CLEAR
                                </span>
                                <button
                                    style={{
                                        backgroundColor: "#1e293b",
                                        border: "none",
                                        borderLeft: "1px solid #334155",
                                        color: "#06b6d4",
                                        padding: "0 10px",
                                        fontSize: "14px",
                                        height: "40px",
                                    }}
                                    onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) || 0) + 1 + "")}
                                >
                                    +1.00
                                </button>
                                <button
                                    style={{
                                        backgroundColor: "#1e293b",
                                        border: "none",
                                        borderLeft: "1px solid #334155",
                                        color: "#06b6d4",
                                        padding: "0 10px",
                                        fontSize: "14px",
                                        height: "40px",
                                        borderTopRightRadius: "4px",
                                        borderBottomRightRadius: "4px",
                                    }}
                                    onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) || 0) + 5 + "")}
                                >
                                    +5.00
                                </button>
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center" }}>
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ marginRight: "6px" }}
                            >
                                <path
                                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M12 6V12L16 14"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <span style={{ color: "#9ca3af", fontSize: "13px" }}>Potential Payout:</span>
                            <span style={{ color: "#06b6d4", fontSize: "13px", marginLeft: "4px" }}> $187</span>
                        </div>
                    </div>

                    <button
                        style={{
                            backgroundColor: "#06b6d4",
                            border: "none",
                            borderRadius: "4px",
                            color: "black",
                            padding: "8px 15px",
                            fontSize: "14px",
                            fontWeight: "bold",
                            height: "40px",
                            width: "120px",
                        }}
                    >
                        PLACE BET
                    </button>
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "#1e293b",
                            borderRadius: "8px",
                            position: "relative",
                            height: "50px",
                            width: "100%",
                            marginBottom: "10px",
                        }}
                    >
                        <span style={{ color: "#06b6d4", marginLeft: "15px", marginRight: "10px" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.31 11.14C10.54 10.69 9.97 10.2 9.97 9.47C9.97 8.63 10.76 8.04 12.07 8.04C13.45 8.04 13.97 8.7 14.01 9.68H15.72C15.67 8.34 14.85 7.11 13.23 6.71V5H10.9V6.69C9.39 7.01 8.18 7.99 8.18 9.5C8.18 11.29 9.67 12.19 11.84 12.71C13.79 13.17 14.18 13.86 14.18 14.58C14.18 15.11 13.79 15.97 12.08 15.97C10.48 15.97 9.85 15.25 9.76 14.33H8.04C8.14 16.03 9.4 16.99 10.9 17.3V19H13.24V17.33C14.76 17.04 15.96 16.17 15.97 14.56C15.96 12.36 14.07 11.6 12.31 11.14Z"
                                    fill="#06b6d4"
                                />
                            </svg>
                        </span>
                        <span style={{ color: "#06b6d4", fontSize: "18px", fontWeight: "bold" }}>{betAmount}</span>
                        <span
                            style={{
                                position: "absolute",
                                right: "15px",
                                color: "#9ca3af",
                                fontSize: "12px",
                                cursor: "pointer",
                            }}
                            onClick={() => setBetAmount("")}
                        >
                            CLEAR
                        </span>
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                        <button
                            style={{
                                backgroundColor: "#1e293b",
                                border: "none",
                                borderRadius: "8px",
                                color: "#06b6d4",
                                padding: "10px",
                                fontSize: "14px",
                                flex: 1,
                            }}
                            onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) || 0) + 1 + "")}
                        >
                            +1.00
                        </button>

                        <button
                            style={{
                                backgroundColor: "#1e293b",
                                border: "none",
                                borderRadius: "8px",
                                color: "#06b6d4",
                                padding: "10px",
                                fontSize: "14px",
                                flex: 1,
                            }}
                            onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) || 0) + 5 + "")}
                        >
                            +5.00
                        </button>

                        <button
                            style={{
                                backgroundColor: "#1e293b",
                                border: "none",
                                borderRadius: "8px",
                                color: "#06b6d4",
                                padding: "10px",
                                fontSize: "14px",
                                flex: 1,
                            }}
                            onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) || 0) + 10 + "")}
                        >
                            +10.00
                        </button>
                    </div>
                </div>

                <button
                    style={{
                        backgroundColor: "#06b6d4",
                        border: "none",
                        borderRadius: "8px",
                        color: "white",
                        padding: "12px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        width: "100%",
                        marginBottom: "10px",
                    }}
                >
                    PLACE BET
                </button>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "12px",
                        color: "#9ca3af",
                    }}
                >
                    <div>
                        <span>Total Bets:</span>
                        <span style={{ color: "#06b6d4" }}> $3,560</span>
                    </div>

                    <div>
                        <span>Potential Payout:</span>
                        <span style={{ color: "#06b6d4" }}> $187</span>
                    </div>
                </div>
            </div>
        )
    }

    // Mobile bottom bar with buttons that open the sections
    const renderMobileBottomBar = () => {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                }}
            >
                <button
                    onClick={() => setActiveMobileSection("donate")}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        background: "none",
                        border: "none",
                        color: "white",
                        padding: "5px 0",
                        width: "20%",
                    }}
                >
                    <img src="/assets/img/mobile/donate.png" alt="donate" width={24} height={24} />
                    <span style={{ fontSize: "12px", marginTop: "2px" }}>Donate</span>
                </button>

                <button
                    onClick={() => setActiveMobileSection("bet")}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        background: "none",
                        border: "none",
                        color: "white",
                        padding: "5px 0",
                        width: "20%",
                    }}
                >
                    <img src="/assets/img/mobile/bet.png" alt="Bet" width={24} height={24} />
                    <span style={{ fontSize: "12px", marginTop: "2px" }}>Bet</span>
                </button>

                <button
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        background: "none",
                        border: "none",
                        color: "white",
                        padding: "5px 0",
                        width: "20%",
                    }}
                >
                    <img src="/assets/img/mobile/shop.png" alt="Bet" width={24} height={24} />
                    <span style={{ fontSize: "12px", marginTop: "2px" }}>Shop</span>
                </button>

                <button
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        background: "none",
                        border: "none",
                        color: "white",
                        padding: "5px 0",
                        width: "20%",
                    }}
                >
                    <img src="/assets/img/mobile/video-play.png" alt="Bet" width={24} height={24} />
                    <span style={{ fontSize: "12px", marginTop: "2px" }}>Clips</span>
                </button>
                <button
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        background: "none",
                        border: "none",
                        color: "white",
                        padding: "5px 0",
                        width: "20%",
                    }}
                >
                    <img src="/assets/img/iconImage/settings 1.png" alt="Settings" style={{ width: "24px", height: "24px" }} />
                    <span style={{ fontSize: "12px", marginTop: "2px" }}>Settings</span>
                </button>
            </div>
        )
    }

    return (
        <>
            {/* Desktop version */}
            {!isMobile && (
                <div
                    style={{
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "linear-gradient(to bottom, #071323, #071226)",
                        color: "white",
                        padding: "10px 16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        zIndex: 9999,
                        borderTop: "1px solid #1e293b",
                        height: "100%",
                        position: "relative",
                    }}
                >
                    {/* Left Section - Donation */}
                    <div style={{ width: "30%", padding: "0 20px", borderRight: "1px solid #1e293b" }}>
                        <div style={{ marginBottom: "10px" }}>
                            <span style={{ fontSize: "16px", color: "#00d9ff", fontWeight: "bold" }}>Want to donate?</span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    backgroundColor: "#1e293b",
                                    borderRadius: "4px",
                                    marginRight: "5px",
                                    position: "relative",
                                    height: "36px",
                                    flex: "1",
                                }}
                            >
                                <span style={{ color: "#06b6d4", marginLeft: "10px", marginRight: "5px" }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.31 11.14C10.54 10.69 9.97 10.2 9.97 9.47C9.97 8.63 10.76 8.04 12.07 8.04C13.45 8.04 13.97 8.7 14.01 9.68H15.72C15.67 8.34 14.85 7.11 13.23 6.71V5H10.9V6.69C9.39 7.01 8.18 7.99 8.18 9.5C8.18 11.29 9.67 12.19 11.84 12.71C13.79 13.17 14.18 13.86 14.18 14.58C14.18 15.11 13.79 15.97 12.08 15.97C10.48 15.97 9.85 15.25 9.76 14.33H8.04C8.14 16.03 9.4 16.99 10.9 17.3V19H13.24V17.33C14.76 17.04 15.96 16.17 15.97 14.56C15.96 12.36 14.07 11.6 12.31 11.14Z"
                                            fill="#06b6d4"
                                        />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Enter amount here"
                                    value={donationAmount}
                                    onChange={(e) => setDonationAmount(e.target.value)}
                                    style={{
                                        backgroundColor: "transparent",
                                        border: "none",
                                        color: "white",
                                        padding: "0",
                                        width: "calc(100% - 80px)",
                                        fontSize: "14px",
                                        outline: "none",
                                    }}
                                />
                                <span
                                    style={{
                                        position: "absolute",
                                        right: "10px",
                                        color: "#9ca3af",
                                        fontSize: "12px",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => setDonationAmount("")}
                                >
                                    CLEAR
                                </span>
                            </div>

                            <button
                                style={{
                                    backgroundColor: "#1e293b",
                                    border: "none",
                                    borderRadius: "4px",
                                    color: "#06b6d4",
                                    padding: "8px 10px",
                                    marginRight: "5px",
                                    fontSize: "14px",
                                    height: "36px",
                                    minWidth: "60px",
                                }}
                                onClick={() => setDonationAmount((prev) => (Number.parseFloat(prev) || 0) + 1 + "")}
                            >
                                +1.00
                            </button>

                            <button
                                style={{
                                    backgroundColor: "#1e293b",
                                    border: "none",
                                    borderRadius: "4px",
                                    color: "#06b6d4",
                                    padding: "8px 10px",
                                    marginRight: "5px",
                                    fontSize: "14px",
                                    height: "36px",
                                    minWidth: "60px",
                                }}
                                onClick={() => setDonationAmount((prev) => (Number.parseFloat(prev) || 0) + 5 + "")}
                            >
                                +5.00
                            </button>

                            <button
                                style={{
                                    backgroundColor: "#06b6d4",
                                    border: "none",
                                    borderRadius: "4px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "36px",
                                    height: "36px",
                                }}
                            >
                                <Check size={20} color="white" />
                            </button>
                        </div>

                        <div style={{ display: "flex", marginBottom: "10px" }}>
                            <div style={{ display: "flex", alignItems: "center", marginRight: "20px" }}>
                                <input
                                    type="checkbox"
                                    id="giftToPlayer"
                                    checked={giftToPlayer}
                                    onChange={() => setGiftToPlayer(!giftToPlayer)}
                                    style={{ marginRight: "8px", width: "14px", height: "14px" }}
                                />
                                <label htmlFor="giftToPlayer" style={{ fontSize: "13px", margin: 0, color: "#fff" }}>
                                    Gift to Player
                                </label>
                            </div>

                            <div style={{ display: "flex", alignItems: "center" }}>
                                <input
                                    type="checkbox"
                                    id="addToPrizepool"
                                    checked={addToPrizepool}
                                    onChange={() => setAddToPrizepool(!addToPrizepool)}
                                    style={{ marginRight: "8px", width: "14px", height: "14px" }}
                                />
                                <label htmlFor="addToPrizepool" style={{ fontSize: "13px", margin: 0, color: "#fff" }}>
                                    Add to Prizepool
                                </label>
                            </div>
                        </div>

                        <div
                            style={{
                                borderTop: "1px dashed #475569",
                                borderBottom: "1px dashed #475569",
                                paddingTop: "8px",
                                paddingBottom: "8px",
                                display: "flex",
                            }}
                        >
                            <span style={{ color: "#06b6d4", fontSize: "13px", marginRight: "20px" }}>$5 shows up on stream</span>
                            <span style={{ color: "#9ca3af", fontSize: "13px" }}>$50 fireworks</span>
                        </div>
                    </div>

                    {/* Center Section - Betting */}
                    <div style={{ width: "45%", padding: "0 20px", borderRight: "1px solid #1e293b" }}>
                        <div style={{ textAlign: "center" }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "12px",
                                    position: "relative",
                                }}
                            >
                                <div style={{ fontSize: "16px" }}>
                                    <span style={{ color: "white" }}>Will </span>
                                    <span style={{ color: "#06b6d4" }}>James5423</span>
                                    <span style={{ color: "white" }}> survive the full 5 minutes?</span>
                                </div>
                                <div
                                    style={{
                                        position: "absolute",
                                        right: "0",
                                        backgroundColor: "#7f1d1d",
                                        border: "1px solid #b91c1c",
                                        borderRadius: "4px",
                                        color: "white",
                                        padding: "2px 8px",
                                        fontSize: "14px",
                                    }}
                                >
                                    00:36
                                </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                                <button
                                    style={{
                                        backgroundColor: "#166534",
                                        border: "1px solid #15803d",
                                        borderRadius: "4px",
                                        color: "#22c55e",
                                        padding: "8px 15px",
                                        fontSize: "16px",
                                        fontWeight: "bold",
                                        position: "relative",
                                        height: "40px",
                                        width: "100px",
                                    }}
                                >
                                    YES
                                    <span
                                        style={{
                                            position: "absolute",
                                            right: "0",
                                            top: "0",
                                            backgroundColor: "#15803d",
                                            borderRadius: "0 4px 0 4px",
                                            padding: "2px 6px",
                                            fontSize: "12px",
                                            color: "white",
                                        }}
                                    >
                                        52%
                                    </span>
                                </button>

                                <button
                                    style={{
                                        backgroundColor: "#7f1d1d",
                                        border: "1px solid #b91c1c",
                                        borderRadius: "4px",
                                        color: "#ef4444",
                                        padding: "8px 15px",
                                        fontSize: "16px",
                                        fontWeight: "bold",
                                        position: "relative",
                                        height: "40px",
                                        width: "100px",
                                    }}
                                >
                                    NO
                                    <span
                                        style={{
                                            position: "absolute",
                                            right: "0",
                                            top: "0",
                                            backgroundColor: "#b91c1c",
                                            borderRadius: "0 4px 0 4px",
                                            padding: "2px 6px",
                                            fontSize: "12px",
                                            color: "white",
                                        }}
                                    >
                                        48%
                                    </span>
                                </button>

                                {/* Improved bet amount input with buttons in a single row */}
                                <div style={{ display: "flex", flexDirection: "column", width: "280px" }}>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            backgroundColor: "#1e293b",
                                            borderRadius: "4px",
                                            height: "40px",
                                            width: "100%",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        <span style={{ color: "#06b6d4", marginLeft: "10px", marginRight: "5px" }}>
                                            <img src="/assets/img/paymenticon/ruppe.png" width="16" height="16" alt="help icon" />

                                        </span>
                                        <span style={{ color: "#06b6d4", fontSize: "16px", fontWeight: "bold" }}>{betAmount}</span>
                                        <div style={{ marginLeft: "auto", display: "flex" }}>
                                            <span
                                                style={{
                                                    color: "#9ca3af",
                                                    fontSize: "12px",
                                                    cursor: "pointer",
                                                    padding: "12px 10px",
                                                    display: "block",           // make it a block-level element
                                                    textAlign: "center",
                                                }}
                                                onClick={() => setBetAmount("")}
                                            >
                                                CLEAR
                                            </span>
                                            <button
                                                style={{
                                                    backgroundColor: "#1e293b",
                                                    border: "none",
                                                    borderLeft: "1px solid #334155",
                                                    color: "#06b6d4",
                                                    padding: "0 10px",
                                                    fontSize: "14px",
                                                    height: "40px",
                                                }}
                                                onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) || 0) + 1 + "")}
                                            >
                                                +1.00
                                            </button>
                                            <button
                                                style={{
                                                    backgroundColor: "#1e293b",
                                                    border: "none",
                                                    borderLeft: "1px solid #334155",
                                                    color: "#06b6d4",
                                                    padding: "0 10px",
                                                    fontSize: "14px",
                                                    height: "40px",
                                                    borderTopRightRadius: "4px",
                                                    borderBottomRightRadius: "4px",
                                                }}
                                                onClick={() => setBetAmount((prev) => (Number.parseFloat(prev) || 0) + 5 + "")}
                                            >
                                                +5.00
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            style={{ marginRight: "6px" }}
                                        >
                                            <path
                                                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M12 6V12L16 14"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <span style={{ color: "#9ca3af", fontSize: "13px" }}>Potential Payout:</span>
                                        <span style={{ color: "#06b6d4", fontSize: "13px", marginLeft: "4px" }}> $187</span>
                                    </div>
                                </div>

                                <button
                                    style={{
                                        backgroundColor: "#06b6d4",
                                        border: "none",
                                        borderRadius: "4px",
                                        color: "black",
                                        padding: "8px 15px",
                                        fontSize: "14px",
                                        fontWeight: "bold",
                                        height: "40px",
                                        width: "120px",
                                    }}
                                >
                                    PLACE BET
                                </button>
                            </div>

                            {/* Replace the stats row with just the remaining stats */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    fontSize: "14px",
                                    color: "#9ca3af",
                                }}
                            >
                                <div style={{ textAlign: "left" }}>
                                    <div>
                                        Total Bets: <span style={{ color: "#06b6d4" }}>$3,560</span>
                                    </div>
                                    <div>
                                        Biggest Win this week: <span style={{ color: "#06b6d4" }}>$2,370</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <span style={{ color: "white", fontWeight: "bold" }}>342 Players</span> Have Already Bet
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div
                        style={{
                            width: "18%",
                            padding: "0 15px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "15px",
                                marginBottom: "8px",
                                width: "100%",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <span style={{ color: "white", fontWeight: "bold", fontSize: "14px" }}>CHAT</span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <span style={{ color: "#f59e0b", fontSize: "14px", marginRight: "2px", marginLeft: "2px" }}>♦</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2" />
                                    <circle cx="12" cy="12" r="2" stroke="white" strokeWidth="2" />
                                    <path d="M16 8L18 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M8 16L6 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M16 16L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M8 8L6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                <span style={{ color: "white", fontWeight: "bold", fontSize: "14px" }}>INFLUENCE</span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <span style={{ color: "#f59e0b", fontSize: "14px", marginRight: "2px", marginLeft: "2px" }}>♦</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M6 11H4C3.44772 11 3 11.4477 3 12V19C3 19.5523 3.44772 20 4 20H6C6.55228 20 7 19.5523 7 19V12C7 11.4477 6.55228 11 6 11Z"
                                        stroke="#06b6d4"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M20 11H18C17.4477 11 17 11.4477 17 12V19C17 19.5523 17.4477 20 18 20H20C20.5523 20 21 19.5523 21 19V12C21 11.4477 20.5523 11 20 11Z"
                                        stroke="#06b6d4"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M17 13C17 11.9391 16.5786 10.9217 15.8284 10.1716C15.0783 9.42143 14.0609 9 13 9H11C9.93913 9 8.92172 9.42143 8.17157 10.1716C7.42143 10.9217 7 11.9391 7 13"
                                        stroke="#06b6d4"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M12 7C13.1046 7 14 6.10457 14 5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5C10 6.10457 10.8954 7 12 7Z"
                                        stroke="#06b6d4"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <span style={{ color: "#06b6d4", fontWeight: "bold", fontSize: "14px" }}>PLAY</span>
                            </div>
                        </div>

                        {/* Conditional rendering based on login state */}
                        {!isLoggedIn ? (
                            <>
                                <div
                                    style={{
                                        fontSize: "11px",
                                        color: "white",
                                        marginBottom: "6px",
                                        textAlign: "center",
                                    }}
                                >
                                    Join +2 million players from <span style={{ marginLeft: "4px" }}>🇮🇳</span>
                                </div>

                                <button
                                    onClick={handleSignupClick}
                                    style={{
                                        backgroundColor: "#06b6d4",
                                        border: "none",
                                        borderRadius: "4px",
                                        color: "white",
                                        padding: "6px 12px",
                                        width: "200px",
                                        fontSize: "13px",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                        height: "32px",
                                    }}
                                >
                                    Sign Up Now (It's Free)
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Subscribe section - shown after login */}
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
                                        <div style={{ fontSize: "11px", color: "white", marginRight: "5px" }}>Subscriber</div>
                                        <div
                                            style={{
                                                backgroundColor: "#06b6d4",
                                                color: "white",
                                                fontSize: "10px",
                                                padding: "1px 5px",
                                                borderRadius: "2px",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            Exclusive
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
                                        <div
                                            style={{
                                                fontSize: "11px",
                                                color: "white",
                                                marginRight: "5px",
                                                textDecoration: "line-through",
                                            }}
                                        >
                                            $9.99
                                        </div>
                                        <div
                                            style={{
                                                color: "#06b6d4",
                                                fontSize: "18px",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            $4.99
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "10px",
                                                color: "white",
                                                marginLeft: "3px",
                                                alignSelf: "flex-end",
                                                marginBottom: "2px",
                                            }}
                                        >
                                            PER MONTH
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSubscribeClick}
                                        style={{
                                            backgroundColor: "#06b6d4",
                                            border: "none",
                                            borderRadius: "4px",
                                            color: "white",
                                            padding: "6px 12px",
                                            width: "200px",
                                            fontSize: "13px",
                                            fontWeight: "bold",
                                            textAlign: "center",
                                            height: "32px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            style={{ marginRight: "6px" }}
                                        >
                                            <path
                                                d="M20 12V22H4V12"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M22 7H2V12H22V7Z"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path d="M12 22V7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path
                                                d="M12 7H16.5C17.163 7 17.7989 6.73661 18.2678 6.26777C18.7366 5.79893 19 5.16304 19 4.5C19 3.83696 18.7366 3.20107 18.2678 2.73223C17.7989 2.26339 17.163 2 16.5 2C13 2 12 7 12 7Z"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M12 7H7.5C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C11 2 12 7 12 7Z"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        SUBSCRIBE
                                    </button>
                                    {showPaymentModal && <PaymentModal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} />}
                                    <div
                                        style={{
                                            fontSize: "10px",
                                            color: "#9ca3af",
                                            marginTop: "4px",
                                            textAlign: "center",
                                        }}
                                    >
                                        Only 6,842 remaining
                                    </div>
                                </div>
                            </>
                        )}
                    </div>



                    {/* Auth Modal */}
                    {showAuthModal && (
                        <div
                            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                            style={{
                                backgroundColor: "rgba(0, 0, 0, 0.7)",
                                backdropFilter: "blur(2px)",
                                zIndex: 1050,
                            }}
                        >
                            <AuthHeaderButtons
                                initialView={initialAuthView}
                                onAuthStateChange={handleAuthStateChange}
                                isModal={true}
                                onClose={() => setShowAuthModal(false)}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Mobile version */}
            {isMobile && (
                <>
                    {renderMobileBottomBar()}
                    {activeMobileSection === "donate" && renderDonationSection()}
                    {activeMobileSection === "bet" && renderBettingSection()}
                </>
            )}

            {/* Payment Modal */}

        </>
    )
}
