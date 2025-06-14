"use client"

export default function RewardModal({ show, onClose }) {
  if (!show) {
    return null
  }

  return (
    <div className="modal fade show d-block game-modal" tabIndex={-1} onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content reward-modal-content">
          {" "}
          {/* Added reward-modal-content for specificity if needed */}
          {/* This modal has no explicit header in the screenshot, title is part of body */}
          <div className="modal-body reward-modal-body text-center">
            <div className="background-dollar">$</div>
            <div className="reward-modal-title">Here's $10</div>
            <p className="reward-modal-subtitle">But once you spend it, it's gone forever...</p>
            {/* Moved button into body for this specific design, as footer might not be desired */}
            <button type="button" className="btn btn-game btn-game-okay" onClick={onClose}>
              Okay!
            </button>
          </div>
          {/* Footer can be omitted if button is in body for this modal */}
          {/* <div className="modal-footer"> ... </div> */}
        </div>
      </div>
    </div>
  )
}
