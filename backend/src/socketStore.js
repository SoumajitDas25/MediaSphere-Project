let userSocketMap = new Map();

function initUserSocketMap() {
  userSocketMap = new Map(); // initialize or reset
}

function getUserSocketMap() {
  return userSocketMap;
}

export {
  initUserSocketMap,
  getUserSocketMap,
};