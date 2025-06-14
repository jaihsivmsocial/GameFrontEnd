"use client"

import { useState } from "react"

export default function ExplanationModal({ show, onClose, onSubmit }) {
  const [explanation, setExplanation] = useState("")

  if (!show) {
    return null
  }

  const handleSubmit = () => {
    onSubmit(explanation)
    setExplanation("")
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
            <h4>
              Get <span className="text-highlight-green">$10</span> in 10 seconds by explaining what's happening!
            </h4>
            <input
              type="text"
              className="form-control mt-3 mb-3"
              placeholder="Type here..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-game btn-game-submit" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
