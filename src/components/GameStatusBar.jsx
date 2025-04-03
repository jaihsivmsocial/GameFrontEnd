import "bootstrap/dist/css/bootstrap.min.css"
import "./game-status-bar.css"

const GameStatusBar = () => {
  return (
    <div className="game-status-bar d-flex align-items-center ">
      {/* Settings Icon */}
      <div className="settings-icon">
        <img src="/assets/img/iconImage/settings 1.png" alt="Settings" width="24" height="24" />
      </div>

      {/* Player Section */}
      <div className="player-section d-flex align-items-center">
        <div className="player-avatar">
          <img src="/assets/player-avatar.png" alt="MoJo" className="img-fluid" />
        </div>
        <div className="player-info">
          <div className="player-name">MoJo</div>
          <div className="player-level">LEVEL 64</div>
        </div>
      </div>

      {/* Currency Section */}
      <div className="currency-section">
        <div className="currency-box d-flex align-items-center justify-content-center">
          <span className="currency-icon">$</span>
          <span className="currency-amount">300</span>
        </div>
        <div className="xp-bar-container">
          <div className="xp-text">8,450/13,500 XP</div>
        </div>
      </div>

      {/* Companion Section */}
      <div className="companion-section d-flex align-items-center">
        <div className="companion-avatar">
          <img src="/assets/companion-avatar.png" alt="POM" className="img-fluid" />
        </div>
        <div className="companion-info">
          <div className="companion-name">POM</div>
          <div className="companion-type">COMPANION</div>
          <div className="health-box d-flex align-items-center justify-content-center">
            <span className="health-icon">❤</span>
            <span className="health-amount">100</span>
          </div>
        </div>
      </div>

      {/* Reward Timer Section */}
      <div className="reward-section text-end">
        <div className="reward-label">
          Next
          <br />
          Reward In
        </div>
        <div className="reward-timer">05:12</div>
      </div>
    </div>
  )
}

export default GameStatusBar

