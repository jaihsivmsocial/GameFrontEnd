"use client"

export default function UnderstandingModal({ show, onClose, onYes, onNo }) {
  if (!show) {
    return null
  }

  return (
    <div className="modal fade show d-block game-modal" tabIndex={-1} onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <span className="modal-title-text"></span> {/* Title is in body for this one */}
            <button type="button" className="btn-close-custom" aria-label="Close" onClick={onClose}>
              &times;
            </button>
          </div>
          <div className="modal-body">
            <h4>Do you understand what is happening?</h4>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-game btn-game-yes" onClick={onYes}>
              Yes
            </button>
            <button type="button" className="btn btn-game btn-game-no" onClick={onNo}>
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
