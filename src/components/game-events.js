// This file contains functions to emit game events to the socket server

/**
 * Emit a game event to the socket server
 * @param {Object} socket - The socket.io client instance
 * @param {string} streamId - The ID of the stream
 * @param {Object} event - The event object
 */
export const emitGameEvent = (socket, streamId, event) => {
    if (!socket || !streamId || !event) {
      console.error("Missing required parameters for emitGameEvent")
      return
    }
  
    console.log(`Emitting game event for stream ${streamId}:`, event.type)
  
    socket.emit("game_event", {
      streamId,
      event,
    })
  }
  
  /**
   * Emit a player picked up camera event
   * @param {Object} socket - The socket.io client instance
   * @param {string} streamId - The ID of the stream
   * @param {string} playerName - The name of the player who picked up the camera
   * @param {string} playerId - The ID of the player
   */
  export const emitPlayerPickedUpCamera = (socket, streamId, playerName, playerId) => {
    emitGameEvent(socket, streamId, {
      type: "player_picked_up_camera",
      playerName,
      playerId,
      timestamp: Date.now(),
    })
  }
  
  /**
   * Emit a player death event
   * @param {Object} socket - The socket.io client instance
   * @param {string} streamId - The ID of the stream
   * @param {string} playerName - The name of the player who died
   * @param {string} playerId - The ID of the player
   * @param {string} causeOfDeath - The cause of death
   */
  export const emitPlayerDeath = (socket, streamId, playerName, playerId, causeOfDeath = "unknown") => {
    emitGameEvent(socket, streamId, {
      type: "player_death",
      playerName,
      playerId,
      causeOfDeath,
      timestamp: Date.now(),
    })
  }
  
  /**
   * Emit a player survived event
   * @param {Object} socket - The socket.io client instance
   * @param {string} streamId - The ID of the stream
   * @param {string} playerName - The name of the player
   * @param {string} playerId - The ID of the player
   * @param {number} survivalTime - The time in seconds the player has survived
   */
  export const emitPlayerSurvived = (socket, streamId, playerName, playerId, survivalTime) => {
    emitGameEvent(socket, streamId, {
      type: "player_survived",
      playerName,
      playerId,
      survivalTime,
      timestamp: Date.now(),
    })
  }
  
  /**
   * Emit a game state update event
   * @param {Object} socket - The socket.io client instance
   * @param {string} streamId - The ID of the stream
   * @param {Object} gameState - The current game state
   */
  export const emitGameStateUpdate = (socket, streamId, gameState) => {
    emitGameEvent(socket, streamId, {
      type: "game_state_update",
      gameState,
      timestamp: Date.now(),
    })
  }
  
  /**
   * Emit a round ended event
   * @param {Object} socket - The socket.io client instance
   * @param {string} streamId - The ID of the stream
   * @param {Object} results - The results of the round
   */
  export const emitRoundEnded = (socket, streamId, results = {}) => {
    emitGameEvent(socket, streamId, {
      type: "round_ended",
      results,
      timestamp: Date.now(),
    })
  }
  
  /**
   * Emit a custom game event
   * @param {Object} socket - The socket.io client instance
   * @param {string} streamId - The ID of the stream
   * @param {string} eventType - The type of event
   * @param {Object} eventData - Additional event data
   */
  export const emitCustomGameEvent = (socket, streamId, eventType, eventData = {}) => {
    emitGameEvent(socket, streamId, {
      type: eventType,
      ...eventData,
      timestamp: Date.now(),
    })
  }
  